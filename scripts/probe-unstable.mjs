import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

const res = await page.evaluate(async () => {
  const el = document.querySelector('[data-serialized-id="server-data"]');
  const csrf = JSON.parse(el.textContent).csrfToken;
  const out = [];
  for (const ep of ["/api/unstable/graphql.json", "/api/2025-10/graphql.json", "/api/graphql.json"]) {
    try {
      const r = await fetch(ep, {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ operationName: "ProbeShop", variables: {}, query: "query ProbeShop { shop { name id } }" }),
      });
      out.push({ ep, status: r.status, body: (await r.text()).slice(0, 250) });
    } catch (e) { out.push({ ep, err: String(e).slice(0, 120) }); }
  }
  return out;
});
console.log(JSON.stringify(res, null, 1));

await browser.close();
