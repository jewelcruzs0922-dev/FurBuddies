import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(6000);

const info = await page.evaluate(() => {
  const out = { cookies: document.cookie.split("; ").map((c) => c.split("=")[0]) };
  // look for csrf-ish attributes
  const metas = [...document.querySelectorAll("meta")].map((m) => ({ name: m.getAttribute("name"), content: (m.getAttribute("content") || "").slice(0, 40) })).filter((m) => m.name && /csrf|token/i.test(m.name));
  out.metas = metas;
  // search serialized data blobs for csrfToken
  const blobs = [];
  for (const el of document.querySelectorAll("[data-serialized-id], [data-serialized], script[type='application/json']")) {
    const t = el.textContent || "";
    const i = t.toLowerCase().indexOf("csrf");
    if (i >= 0) blobs.push({ id: el.getAttribute("data-serialized-id") || el.id || el.className, snippet: t.slice(Math.max(0, i - 60), i + 80) });
  }
  out.csrfBlobs = blobs.slice(0, 6);
  // any element with a csrf attribute
  const attrs = [];
  for (const el of document.querySelectorAll("*")) {
    for (const a of el.attributes || []) {
      if (/csrf/i.test(a.name) || /csrf/i.test(a.value)) attrs.push({ tag: el.tagName, name: a.name, value: a.value.slice(0, 40) });
      if (attrs.length > 10) break;
    }
    if (attrs.length > 10) break;
  }
  out.csrfAttrs = attrs;
  return out;
});
console.log(JSON.stringify(info, null, 1));

await browser.close();
