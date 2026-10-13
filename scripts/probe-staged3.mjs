import { chromium } from "playwright";
import fs from "fs";

const CDP_URL = "http://127.0.0.1:9222";
const IMG_DIR = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs";

const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const adminPage = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

// reuse the staged target we already created
const stagedTarget = {
  url: "https://shopify-staged-uploads.storage.googleapis.com/",
  resourceUrl: "https://shopify-staged-uploads.storage.googleapis.com/tmp/84811710697/files/56c12594-e888-41b8-9eb0-1191f31174bf/probe-dog.jpg",
  parameters: [
    { name: "Content-Type", value: "image/jpeg" },
    { name: "success_action_status", value: "201" },
    { name: "acl", value: "private" },
    { name: "key", value: "tmp/84811710697/files/56c12594-e888-41b8-9eb0-1191f31174bf/probe-dog.jpg" },
    { name: "x-goog-date", value: "20261011T155738Z" },
    { name: "x-goog-credential", value: "merchant-assets@shopify-tiers.iam.gserviceaccount.com/20261011/auto/storage/goog4_request" },
    { name: "x-goog-algorithm", value: "GOOG4-RSA-SHA256" },
    { name: "x-goog-signature", value: "REDACTED-USE-FRESH-STAGED-TARGET" },
  ],
};

// fetch a fresh staged target for this exact test
const fresh = await adminPage.evaluate(async () => {
  const el = document.querySelector('[data-serialized-id="server-data"]');
  const csrf = JSON.parse(el.textContent).csrfToken;
  const r = await fetch("/api/shopify/pet-pantry-test?operation=stagedUploadsCreate&type=mutation", {
    method: "POST", credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
    body: JSON.stringify({
      operationName: "stagedUploadsCreate",
      variables: { input: [{ filename: "probe-dog.jpg", mimeType: "image/jpeg", httpMethod: "POST", resource: "PRODUCT_IMAGE" }] },
      query: `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }`,
    }),
  });
  return (await r.json()).data.stagedUploadsCreate.stagedTargets[0];
});
console.log("fresh staged target key:", fresh.parameters.find((p) => p.name === "key")?.value);

// upload from a blank tab (no admin CORS restriction) using Playwright's setInputFiles-free FormData
const tab = await context.newPage();
await tab.goto("about:blank");

const localPath = `${IMG_DIR}/golden-retriever-dog.jpg`;
if (!fs.existsSync(localPath)) {
  const resp = await fetch("https://burst.shopifycdn.com/photos/golden-retriever-dog.jpg?width=800&format=pjpg&exif=0&iptc=0");
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.writeFileSync(localPath, buf);
  console.log("downloaded local image bytes:", buf.length);
}

const uploadResult = await tab.evaluate(async ({ target, filename, bytes }) => {
  const bin = Uint8Array.from(atob(bytes), (c) => c.charCodeAt(0));
  const blob = new Blob([bin], { type: "image/jpeg" });
  const fd = new FormData();
  for (const p of target.parameters) fd.append(p.name, p.value);
  fd.append("file", blob, filename);
  const r = await fetch(target.url, { method: "POST", body: fd });
  return { status: r.status, text: (await r.text()).slice(0, 300) };
}, { target: fresh, filename: "probe-dog.jpg", bytes: fs.readFileSync(localPath).toString("base64") });

console.log("UPLOAD RESULT:", uploadResult.status, uploadResult.text.slice(0, 300));
console.log("resourceUrl:", fresh.resourceUrl);

await tab.close();
await browser.close();
