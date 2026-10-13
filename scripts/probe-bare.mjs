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

// 1) list existing products
const list = await gql("ListAllProducts", `query ListAllProducts { products(first: 20) { nodes { id title status } } }`, {}, "query");
console.log("EXISTING PRODUCTS:", JSON.stringify(list.json?.data?.products?.nodes ?? list.json, null, 1));

// 2) create a bare draft product (no media) to confirm productCreate works
const create = await gql(
  "CreateBareProduct",
  `mutation CreateBareProduct($input: ProductInput!) {
    productCreate(input: $input) { product { id title status handle } userErrors { field message } }
  }`,
  { input: { title: "FUR-PROBE-BARE", status: "DRAFT", vendor: "FurBuddies Demo", descriptionHtml: "<p>probe</p>" } },
);
console.log("BARE CREATE:", JSON.stringify(create.json, null, 1).slice(0, 500));

await browser.close();
