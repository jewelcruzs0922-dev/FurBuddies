import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

const seen = [];
page.on("request", (req) => {
  const u = req.url();
  const m = req.method();
  if (m === "POST" && !u.match(/\.(js|css|png|jpg|svg|woff|ico)/)) {
    seen.push({ url: u.slice(0, 140), ct: req.headers()["content-type"], body: req.postData()?.slice(0, 220) });
  }
});

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(6000);
// interact to trigger data load: click a product row / open create
try { await page.getByRole("link", { name: /add product/i }).first().click({ timeout: 4000 }); await page.waitForTimeout(5000); } catch (e) { console.log("add product click:", String(e).slice(0, 80)); }
console.log("POSTs:", JSON.stringify(seen, null, 1));
console.log("URL now:", page.url());

await browser.close();
