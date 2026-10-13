import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

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

const staged = await gql(
  "stagedUploadsCreate",
  `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }`,
  { input: [{ filename: "probe-dog.jpg", mimeType: "image/jpeg", httpMethod: "POST", resource: "PRODUCT_IMAGE" }] },
);
const target = staged.json?.data?.stagedUploadsCreate?.stagedTargets?.[0];
console.log("STAGED TARGET:", JSON.stringify(target, null, 1).slice(0, 800));

if (target) {
  // fetch the image and upload as multipart form to the staged target
  const uploaded = await page.evaluate(async ({ target }) => {
    const params = Object.fromEntries((target.parameters || []).map((p) => [p.name, p.value]));
    const imgRes = await fetch("https://burst.shopifycdn.com/photos/golden-retriever-dog.jpg?width=800&format=pjpg&exif=0&iptc=0");
    const blob = await imgRes.blob();
    const fd = new FormData();
    for (const [k, v] of Object.entries(params)) fd.append(k, v);
    fd.append("file", blob, "probe-dog.jpg");
    const r = await fetch(target.url, { method: "POST", body: fd });
    return { status: r.status, text: (await r.text()).slice(0, 300) };
  }, { target });
  console.log("UPLOAD:", uploaded.status, uploaded.text.slice(0, 300));
}

await browser.close();
