import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

const seen = [];
page.on("request", (req) => {
  const u = req.url();
  const m = req.method();
  if (m === "POST" && u.startsWith("https://admin.shopify.com")) {
    seen.push({ url: u.replace("https://admin.shopify.com", ""), ct: req.headers()["content-type"], body: req.postData()?.slice(0, 200) });
  }
});

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(8000);
console.log("POSTs after load:", JSON.stringify(seen, null, 1));

await browser.close();
