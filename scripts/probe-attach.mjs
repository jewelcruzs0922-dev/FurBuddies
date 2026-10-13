import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const STAGED_URL = "https://shopify-staged-uploads.storage.googleapis.com/tmp/84811710697/files/b0cf18a9-f644-4577-9510-26cf5d7eb6c3/probe-dog.jpg";

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

// use the bare probe product we created earlier
const list = await gql("FindProbeProduct", `query FindProbeProduct { products(first: 20) { nodes { id title status } } }`, {}, "query");
console.log("PRODUCTS:", JSON.stringify(list.json?.data?.products?.nodes, null, 1));

const productId = list.json?.data?.products?.nodes?.find((p) => p.title === "FUR-PROBE-BARE")?.id;
console.log("target product:", productId);

if (productId) {
  const res = await gql(
    "productCreateMedia",
    `mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id ... on MediaImage { image { url } } }
        mediaUserErrors { field message }
      }
    }`,
    { productId, media: [{ originalSource: STAGED_URL, alt: "Golden retriever" }] },
  );
  console.log("ATTACH MEDIA:", JSON.stringify(res.json, null, 1).slice(0, 800));
}

await browser.close();
