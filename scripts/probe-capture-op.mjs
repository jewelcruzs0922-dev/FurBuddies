import { chromium } from "playwright";
import fs from "fs";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

let captured = null;
page.on("request", (req) => {
  const u = req.url();
  if (u.includes("/api/operations/") && !captured) {
    captured = { url: u, method: req.method(), headers: req.headers(), postData: req.postData() };
  }
});

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(8000);

if (!captured) {
  // navigate to trigger a query
  await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(6000);
}
console.log("captured URL:", captured?.url);
console.log("headers:", JSON.stringify(captured?.headers, null, 1));
console.log("postData:", captured?.postData?.slice(0, 800));
fs.writeFileSync("captured-admin-op.json", JSON.stringify(captured, null, 1));

await browser.close();
