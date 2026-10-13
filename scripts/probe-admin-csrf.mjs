import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(6000);

const probe = await page.evaluate(async () => {
  const el = document.querySelector('[data-serialized-id="server-data"]');
  if (!el) return { err: "no server-data" };
  const csrfToken = JSON.parse(el.textContent).csrfToken;
  const out = [];
  for (const ep of ["/api/graphql", "/api/2025-10/graphql.json"]) {
    try {
      const r = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrfToken },
        credentials: "same-origin",
        body: JSON.stringify({ query: "{ shop { name id myshopifyDomain } }" }),
      });
      out.push({ ep, status: r.status, body: (await r.text()).slice(0, 300) });
    } catch (e) {
      out.push({ ep, err: String(e).slice(0, 120) });
    }
  }
  return out;
});
console.log(JSON.stringify(probe, null, 1));

await browser.close();
