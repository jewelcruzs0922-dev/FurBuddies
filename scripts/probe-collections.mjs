import { chromium } from "playwright";
import fs from "fs";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

const captured = [];
page.on("request", (req) => {
  const u = req.url();
  const ct = req.headers()["content-type"] || "";
  if (req.method() === "POST" && ct.includes("json") && u.includes("admin.shopify.com")) {
    captured.push({ url: u.replace("https://admin.shopify.com", ""), postData: (req.postData() || "").slice(0, 300) });
  }
});

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(7000);

// click "Create collection" to trigger a mutation query load
try { await page.getByRole("link", { name: /create collection/i }).first().click({ timeout: 5000 }); await page.waitForTimeout(6000); } catch (e) { console.log("click:", String(e).slice(0, 80)); }

console.log("URL:", page.url());
console.log("all admin JSON POSTs:", JSON.stringify(captured, null, 1).slice(0, 2500));
fs.writeFileSync("captured-collections.json", JSON.stringify(captured, null, 1));

await browser.close();
