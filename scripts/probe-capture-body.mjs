import { chromium } from "playwright";
import fs from "fs";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

const captured = [];
page.on("request", (req) => {
  const u = req.url();
  if (u.includes("/api/operations/") && req.method() === "POST") {
    captured.push({ url: u, postData: req.postData(), headers: req.headers() });
  }
});

const routes = [
  "https://admin.shopify.com/store/pet-pantry-test/products",
  "https://admin.shopify.com/store/pet-pantry-test/collections",
  "https://admin.shopify.com/store/pet-pantry-test/products/new",
];
for (const r of routes) {
  await page.goto(r, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(6000);
}

console.log("captured count:", captured.length);
fs.writeFileSync("captured-ops-full.json", JSON.stringify(captured, null, 1));
for (const c of captured) {
  const m = c.url.match(/\/api\/operations\/([a-f0-9]+)\/([^/]+)\//);
  const pd = c.postData || "";
  const hasPersisted = pd.includes("persistedQuery") || pd.includes("extensions");
  console.log(`${m?.[2]}  hash=${m?.[1]?.slice(0, 12)}  len=${pd.length}  persisted=${hasPersisted}`);
}

await browser.close();
