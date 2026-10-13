import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

const seen = [];
page.on("request", (req) => {
  const u = req.url();
  if (u.includes("graphql") || u.includes("/api/20") || u.includes("/services/")) {
    seen.push({ method: req.method(), url: u.slice(0, 160), headers: Object.fromEntries(Object.entries(req.headers()).filter(([k]) => k.startsWith("x-") || k === "content-type")) });
  }
});

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(9000);
console.log("URL:", page.url());
console.log("captured requests:", JSON.stringify(seen.slice(0, 20), null, 1));

// Try the internal admin GraphQL endpoint directly from page context
const probe = await page.evaluate(async () => {
  const tries = [];
  const endpoints = [
    "/api/2025-10/graphql.json",
    "/api/graphql",
    "/services/framework/graphql",
  ];
  for (const ep of endpoints) {
    try {
      const r = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ query: "{ shop { name id } }" }),
      });
      const t = await r.text();
      tries.push({ ep, status: r.status, body: t.slice(0, 200) });
    } catch (e) {
      tries.push({ ep, err: String(e).slice(0, 120) });
    }
  }
  return tries;
});
console.log("endpoint probe:", JSON.stringify(probe, null, 1));

await browser.close();
