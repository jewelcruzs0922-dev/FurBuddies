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
  { input: [{ filename: "valid-probe.jpg", mimeType: "image/jpeg", resource: "PRODUCT_IMAGE", httpMethod: "POST" }] },
);
const target = gen.json?.data?.stagedUploadTargetsGenerate?.urls?.[0];
const key = target.parameters.find((p) => p.name === "key").value;

const tab = await context.newPage();
await tab.goto("about:blank");
const up = await tab.evaluate(async ({ target, filename, bytes }) => {
  const bin = Uint8Array.from(atob(bytes), (c) => c.charCodeAt(0));
  const fd = new FormData();
  for (const p of target.parameters) fd.append(p.name, p.value);
  fd.append("file", new Blob([bin], { type: "image/jpeg" }), filename);
  const r = await fetch(target.url, { method: "POST", body: fd });
  return { status: r.status };
}, { target, filename: "valid-probe.jpg", bytes: fs.readFileSync(`${IMG_DIR}/hero-frenchie.jpg`).toString("base64") });
console.log("upload:", up.status, "key:", key);

const stagedUrl = `https://shopify-staged-uploads.storage.googleapis.com/${key}`;
const attach = await gql(
  "productCreateMedia",
  `mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media { id ... on MediaImage { status image { url } } alt }
      mediaUserErrors { field message }
    }
  }`,
  { productId: "gid://shopify/Product/15411077087465", media: [{ originalSource: stagedUrl, alt: "Valid probe", mediaContentType: "IMAGE" }] },
);
console.log("ATTACH:", JSON.stringify(attach.json, null, 1).slice(0, 700));
const mediaId = attach.json?.data?.productCreateMedia?.media?.[0]?.id;
fs.writeFileSync("last-media-id.txt", mediaId || "");

await tab.close();
await browser.close();
