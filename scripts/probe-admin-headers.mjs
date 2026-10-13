import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

let captured = null;
page.on("request", (req) => {
  const u = req.url();
  const h = req.headers();
  const isApi = (u.includes("/api/20") && u.includes("graphql")) || u.includes("/api/graphql");
  if (isApi && !captured) {
    captured = { url: u, method: req.method(), headers: h, postData: req.postData()?.slice(0, 400) };
  }
});

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);
// trigger a client GraphQL by typing in search or opening a filter
try {
  await page.getByRole("button", { name: /filter/i }).first().click({ timeout: 4000 });
  await page.waitForTimeout(3000);
} catch (e) { console.log("filter click failed:", String(e).slice(0, 80)); }
await page.waitForTimeout(4000);

console.log("captured:", JSON.stringify(captured, null, 1));

// now retry the probe with the captured headers
const probe = await page.evaluate(async ({ url, headers }) => {
  const out = [];
  for (const variant of ["with-headers", "csrf-only", "bare"]) {
    const h = { "Content-Type": "application/json", Accept: "application/json" };
    if (variant !== "bare") {
      if (headers["x-csrf-token"]) h["x-csrf-token"] = headers["x-csrf-token"];
      if (headers["x-shopify-shop-id"]) h["x-shopify-shop-id"] = headers["x-shopify-shop-id"];
      if (headers["x-shopify-app-id"]) h["x-shopify-app-id"] = headers["x-shopify-app-id"];
      if (headers["x-requested-with"]) h["x-requested-with"] = headers["x-requested-with"];
      if (headers["x-shopify-flow-session-id"]) h["x-shopify-flow-session-id"] = headers["x-shopify-flow-session-id"];
    }
    const r = await fetch("/api/graphql", {
      method: "POST", headers: h, credentials: "same-origin",
      body: JSON.stringify({ query: "{ shop { name id } }" }),
    });
    out.push({ variant, status: r.status, body: (await r.text()).slice(0, 200) });
  }
  return out;
}, { url: captured?.url, headers: captured?.headers ?? {} });
console.log("probe:", JSON.stringify(probe, null, 1));

await browser.close();
