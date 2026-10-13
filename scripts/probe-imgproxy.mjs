import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

const probe = await page.evaluate(async () => {
  const el = document.querySelector('[data-serialized-id="server-data"]');
  const csrf = JSON.parse(el.textContent).csrfToken;
  const url = "https://burst.shopifycdn.com/photos/golden-retriever-dog.jpg?width=800&format=pjpg&exif=0&iptc=0";
  const out = [];
  // try same-origin proxy-ish paths
  for (const p of ["/api/shopify/pet-pantry-test?operation=img&type=query"]) {
    try {
      const r = await fetch(p, { credentials: "same-origin", headers: { "x-csrf-token": csrf } });
      out.push({ p, status: r.status });
    } catch (e) { out.push({ p, err: String(e).slice(0, 80) }); }
  }
  // direct burst fetch to see if it's reachable from admin origin at all
  try {
    const r = await fetch(url, { mode: "no-cors" });
    out.push({ p: "burst no-cors", status: r.status, type: r.type });
  } catch (e) { out.push({ p: "burst no-cors", err: String(e).slice(0, 100) }); }
  return { out, csrfPresent: !!csrf, sampleUrl: url };
});
console.log(JSON.stringify(probe, null, 1));

await browser.close();
