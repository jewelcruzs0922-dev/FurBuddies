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
    return { status: r.status, json: await r.json().catch(() => null) };
  }, { operationName, query, variables, type });
}

const res = await gql(
  "ProbeProductCreate2",
  `mutation ProbeProductCreate2($input: ProductSetInput!) {
    productSet(input: $input, synchronous: true) {
      product { id title handle media(first: 5) { nodes { id ... on MediaImage { image { url } } } } }
      userErrors { field message }
    }
  }`,
  {
    input: {
      title: "FUR-PROBE-PRODUCT-TEMP",
      status: "DRAFT",
      vendor: "FurBuddies Demo",
      descriptionHtml: "<p>Temporary probe product. Safe to delete.</p>",
      media: [{ originalSource: "https://burst.shopifycdn.com/photos/golden-retriever-dog.jpg?width=1200&format=pjpg&exif=0&iptc=0", alt: "Golden retriever" }],
    },
  },
);
console.log("PRODUCT SET:", res.status, JSON.stringify(res.json, null, 1).slice(0, 900));

await browser.close();
