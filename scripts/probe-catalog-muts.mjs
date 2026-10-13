import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);

async function probe(operationName, query, type = "mutation") {
  return page.evaluate(async ({ operationName, query, type }) => {
    const el = document.querySelector('[data-serialized-id="server-data"]');
    const csrf = JSON.parse(el.textContent).csrfToken;
    const r = await fetch(`/api/shopify/pet-pantry-test?operation=${operationName}&type=${type}`, {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ operationName, variables: {}, query }),
    });
    const j = await r.json().catch(() => null);
    return { status: r.status, msg: j?.errors?.[0]?.message ?? JSON.stringify(j?.data ?? j).slice(0, 200) };
  }, { operationName, query, type });
}

const muts = [
  ["collectionAddProducts", `mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) { collectionAddProducts(id: $id, productIds: $productIds) { job { id } userErrors { field message } } }`],
  ["collectionReorderProducts", `mutation collectionReorderProducts($id: ID!, $moves: [MoveInput!]!) { collectionReorderProducts(id: $id, moves: $moves) { job { id } userErrors { field message } } }`],
  ["productUpdate", `mutation productUpdate($input: ProductInput!) { productUpdate(input: $input) { product { id } userErrors { field message } } }`],
  ["productDeleteMedia", `mutation productDeleteMedia($productId: ID!, $mediaIds: [ID!]!) { productDeleteMedia(productId: $productId, mediaIds: $mediaIds) { deletedMediaIds mediaUserErrors { field message } } }`],
  ["productDelete", `mutation productDelete($input: ProductDeleteInput!) { productDelete(input: $input) { deletedProductId userErrors { field message } } }`],
  ["collectionDelete", `mutation collectionDelete($input: CollectionDeleteInput!) { collectionDelete(input: $input) { deletedCollectionId userErrors { field message } } }`],
  ["collectionUpdate", `mutation collectionUpdate($input: CollectionInput!) { collectionUpdate(input: $input) { collection { id title handle } userErrors { field message } } }`],
  ["productSet", `mutation productSet($input: ProductSetInput!, $synchronous: Boolean) { productSet(input: $input, synchronous: $synchronous) { product { id } userErrors { field message } } }`],
];
for (const [name, q] of muts) {
  const r = await probe(name, q);
  console.log(`${name.padEnd(24)} -> ${r.msg}`);
}

await browser.close();
