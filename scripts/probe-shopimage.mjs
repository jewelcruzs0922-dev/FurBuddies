import { chromium } from "playwright";
import fs from "fs";

const CDP_URL = "http://127.0.0.1:9222";
const IMG_DIR = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs";
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

const gen = await gql(
  "stagedUploadTargetsGenerate",
  `mutation stagedUploadTargetsGenerate($input: [StageImageInput!]!) {
    stagedUploadTargetsGenerate(input: $input) { urls { url parameters { name value } } userErrors { field message } }
  }`,
  { input: [{ filename: "shop-probe.jpg", mimeType: "image/jpeg", resource: "SHOP_IMAGE", httpMethod: "POST" }] },
);
const target = gen.json?.data?.stagedUploadTargetsGenerate?.urls?.[0];
const key = target.parameters.find((p) => p.name === "key").value;
console.log("key:", key);

const tab = await context.newPage();
await tab.goto("about:blank");
const up = await tab.evaluate(async ({ target, filename, bytes }) => {
  const bin = Uint8Array.from(atob(bytes), (c) => c.charCodeAt(0));
  const fd = new FormData();
  for (const p of target.parameters) fd.append(p.name, p.value);
  fd.append("file", new Blob([bin], { type: "image/jpeg" }), filename);
  const r = await fetch(target.url, { method: "POST", body: fd });
  return { status: r.status };
}, { target, filename: "shop-probe.jpg", bytes: fs.readFileSync(`${IMG_DIR}/golden-retriever-dog.jpg`).toString("base64") });
console.log("upload:", up.status);

const stagedUrl = `https://shopify-staged-uploads.storage.googleapis.com/${key}`;
const fin = await gql(
  "onlineStoreShopImageUpload",
  `mutation onlineStoreShopImageUpload($image: ImageInput!) {
    onlineStoreShopImageUpload(image: $image) {
      image { shopifyUrl mediaId image { id altText originalSrc: url } }
      userErrors { field message }
    }
  }`,
  { image: { src: stagedUrl } },
);
console.log("FINALIZE:", JSON.stringify(fin.json, null, 1).slice(0, 900));

await tab.close();
await browser.close();
