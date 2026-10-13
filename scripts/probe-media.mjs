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

// A) try productCreate with a `media` field
const resA = await gql(
  "TryMediaField",
  `mutation TryMediaField($input: ProductInput!) {
    productCreate(input: $input) { product { id title } userErrors { field message } }
  }`,
  { input: { title: "FUR-PROBE-MEDIA-FIELD", status: "DRAFT", media: [{ originalSource: "https://burst.shopifycdn.com/photos/golden-retriever-dog.jpg?width=800", alt: "dog" }] } },
);
console.log("A) productCreate+media:", JSON.stringify(resA.json, null, 1).slice(0, 600));

// B) stagedUploadsCreate
const resB = await gql(
  "TryStaged",
  `mutation TryStaged($input: StagedUploadsCreateInput!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }`,
  { input: [{ filename: "probe-dog.jpg", mimeType: "image/jpeg", httpMethod: "POST", resource: "FILE_IMAGE" }] },
);
console.log("B) stagedUploadsCreate:", JSON.stringify(resB.json, null, 1).slice(0, 900));

await browser.close();
