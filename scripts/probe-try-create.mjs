import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

// 1) GET a known op to confirm reachability
const getOp = await page.evaluate(async () => {
  const r = await fetch("/api/operations/deadbeef/Betas/shopify/pet-pantry-test?variables=%7B%7D", { credentials: "same-origin" });
  return { status: r.status, body: (await r.text()).slice(0, 300) };
});
console.log("GET Betas op:", JSON.stringify(getOp));

// 2) Try POSTing a productCreate mutation to a guessed op path
const tryPost = await page.evaluate(async () => {
  const mutation = `mutation productCreate($product: ProductCreateInput!) { productCreate(product: $product) { product { id title handle } userErrors { field message } } }`;
  const body = {
    operationName: "productCreate",
    variables: { product: { title: "TEST-PROBE-DELETE-ME", status: "DRAFT" } },
    query: mutation,
    extensions: { client_context: { page_view_token: "x", client_route_handle: "products:list", client_pathname: "/store/pet-pantry-test/products" } },
  };
  const tries = [];
  for (const ep of [
    "/api/operations/probe/productCreate/shopify/pet-pantry-test",
    "/api/operations/probe/ProductCreate/shopify/pet-pantry-test",
  ]) {
    try {
      const r = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      tries.push({ ep, status: r.status, body: (await r.text()).slice(0, 300) });
    } catch (e) {
      tries.push({ ep, err: String(e).slice(0, 150) });
    }
  }
  return tries;
});
console.log("POST tries:", JSON.stringify(tryPost, null, 1));

await browser.close();
