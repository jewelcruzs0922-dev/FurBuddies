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
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ operationName, variables: variables || {}, query }),
    });
    return { status: r.status, text: (await r.text()).slice(0, 600) };
  }, { operationName, query, variables, type });
}

const create = await gql(
  "ProbeCollectionCreate",
  `mutation ProbeCollectionCreate($input: CollectionInput!) { collectionCreate(input: $input) { collection { id title handle } userErrors { field message } } }`,
  { input: { title: "FUR-PROBE-TEMP" } },
);
console.log("CREATE:", create.status, create.text);

await browser.close();
