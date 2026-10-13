import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const STAGED_URL = "https://shopify-staged-uploads.storage.googleapis.com/tmp/84811710697/files/b0cf18a9-f644-4577-9510-26cf5d7eb6c3/probe-dog.jpg";

const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);

async function gql(operationName, query, variables, type = "mutation") {
  return page.evaluate(async ({ operationName, query, variables, type }) => {
    const el = document.querySelector('[data-serialized-id="server-data"]');
    const csrf = JSON.parse(el.textContent).csrfToken;
    const r = await fetch(`/api/shopify/pet-pantry-test?operation=${operationName}&type=${type}`, {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ operationName, variables: variables || {}, query }),
    });
    return { status: r.status, json: await r.json().catch(() => null) };
  }, { operationName, query, variables, type });
}

// A) stagedUploadTargetsGenerate
const a = await gql(
  "stagedUploadTargetsGenerate",
  `mutation stagedUploadTargetsGenerate($input: [StageImageInput!]!) {
    stagedUploadTargetsGenerate(input: $input) {
      urls { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }`,
  { input: [{ filename: "probe-dog2.jpg", mimeType: "image/jpeg", resource: "PRODUCT_IMAGE", httpMethod: "POST" }] },
);
console.log("A) stagedUploadTargetsGenerate:", JSON.stringify(a.json, null, 1).slice(0, 1200));

// B) onlineStoreShopImageUpload with the already-uploaded staged URL
const b = await gql(
  "onlineStoreShopImageUpload",
  `mutation onlineStoreShopImageUpload($image: ImageInput!) {
    onlineStoreShopImageUpload(image: $image) {
      image { shopifyUrl mediaId image { id altText originalSrc: url } }
      userErrors { field message }
    }
  }`,
  { image: { src: STAGED_URL } },
);
console.log("B) onlineStoreShopImageUpload:", JSON.stringify(b.json, null, 1).slice(0, 900));

await browser.close();
