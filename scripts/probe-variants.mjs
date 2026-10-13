import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
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

// test: create a product with 2 size variants + tags + productType
const res = await gql(
  "ProbeVariants",
  `mutation ProbeVariants($input: ProductInput!) {
    productCreate(input: $input) {
      product { id title status productType tags variants(first: 5) { nodes { id title price } } }
      userErrors { field message }
    }
  }`,
  {
    input: {
      title: "FUR-PROBE-VARIANTS",
      status: "DRAFT",
      vendor: "FurBuddies Demo",
      productType: "Probe",
      tags: ["probe", "test"],
      descriptionHtml: "<p>Probe with variants. Safe to remove.</p>",
      variants: [
        { price: "10.99", option1: "Small", sku: "PROBE-S" },
        { price: "14.99", option1: "Large", sku: "PROBE-L" },
      ],
    },
  },
);
console.log(JSON.stringify(res.json, null, 1).slice(0, 1000));

await browser.close();
