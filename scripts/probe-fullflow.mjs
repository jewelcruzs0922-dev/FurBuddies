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

// 1) generate targets
const gen = await gql(
  "stagedUploadTargetsGenerate",
  `mutation stagedUploadTargetsGenerate($input: [StageImageInput!]!) {
    stagedUploadTargetsGenerate(input: $input) {
      urls { url parameters { name value } }
      userErrors { field message }
    }
  }`,
  { input: [{ filename: "probe-dog3.jpg", mimeType: "image/jpeg", resource: "PRODUCT_IMAGE", httpMethod: "POST" }] },
);
const target = gen.json?.data?.stagedUploadTargetsGenerate?.urls?.[0];
console.log("TARGET key:", target?.parameters?.find((p) => p.name === "key")?.value);

// 2) upload bytes from a blank tab
const localPath = `${IMG_DIR}/golden-retriever-dog.jpg`;
const tab = await context.newPage();
await tab.goto("about:blank");
const up = await tab.evaluate(async ({ target, filename, bytes }) => {
  const bin = Uint8Array.from(atob(bytes), (c) => c.charCodeAt(0));
  const fd = new FormData();
  for (const p of target.parameters) fd.append(p.name, p.value);
  fd.append("file", new Blob([bin], { type: "image/jpeg" }), filename);
  const r = await fetch(target.url, { method: "POST", body: fd });
  return { status: r.status };
}, { target, filename: "probe-dog3.jpg", bytes: fs.readFileSync(localPath).toString("base64") });
console.log("UPLOAD:", up.status);

const key = target.parameters.find((p) => p.name === "key").value;
const stagedUrl = `https://shopify-staged-uploads.storage.googleapis.com/${key}`;
console.log("stagedUrl:", stagedUrl);

// 3) attach to product via productCreateMedia
const attach = await gql(
  "productCreateMedia",
  `mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media { id ... on MediaImage { status image { url } } alt }
      mediaUserErrors { field message }
    }
  }`,
  { productId: "gid://shopify/Product/15411077087465", media: [{ originalSource: stagedUrl, alt: "Golden retriever", mediaContentType: "IMAGE" }] },
);
console.log("ATTACH:", JSON.stringify(attach.json, null, 1).slice(0, 800));

await tab.close();
await browser.close();
