import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

const ENDPOINT = "/api/operations/probe/AnyOpName/shopify/pet-pantry-test";

async function gql(query, variables) {
  return page.evaluate(async ({ endpoint, query, variables }) => {
    const el = document.querySelector('[data-serialized-id="server-data"]');
    const csrf = JSON.parse(el.textContent).csrfToken;
    const r = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ operationName: "Op", variables: variables || {}, query }),
    });
    return { status: r.status, json: await r.json().catch(() => null) };
  }, { endpoint: ENDPOINT, query, variables });
}

// 1) read: list products (should be empty)
const read = await gql(`query { products(first: 5) { nodes { id title } } }`);
console.log("READ products:", JSON.stringify(read).slice(0, 300));

// 2) write: create a collection (safe, and we want one anyway). Check userErrors.
const create = await gql(
  `mutation CollectionCreate($input: CollectionInput!) { collectionCreate(input: $input) { collection { id title handle } userErrors { field message } } }`,
  { input: { title: "FUR-PROBE (temporary)" } },
);
console.log("CREATE collection:", JSON.stringify(create).slice(0, 400));

await browser.close();
