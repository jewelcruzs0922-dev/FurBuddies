import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const SHOP = "https://pet-pantry-test.myshopify.com";
const OUT = path.join(os.tmpdir(), "furbuddies-audit");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.connectOverCDP(CDP_URL);

// --- 1. logged-OUT check in an isolated context (no cookies) ---
try {
  const incog = await browser.newContext();
  const p = await incog.newPage();
  await p.goto(`${SHOP}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await p.waitForTimeout(6000);
  console.log("=== LOGGED OUT ===");
  console.log("URL:", p.url());
  console.log("BODY:\n", (await p.locator("body").innerText().catch(() => "")).slice(0, 500));
  // try cart/checkout routes while logged out
  for (const route of ["/cart", "/checkout"]) {
    await p.goto(`${SHOP}${route}`, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    await p.waitForTimeout(4000);
    console.log(`route ${route} ->`, p.url().slice(0, 120));
  }
  await p.screenshot({ path: path.join(OUT, "storefront-loggedout.png") }).catch(() => {});
  await incog.close();
} catch (e) {
  console.log("logged-out check failed:", e.message.slice(0, 150));
}

// --- 2. logged-IN preview via admin session tab ---
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("pet-pantry")) ?? await context.newPage();

  const pages = [
    ["home", `${SHOP}/`],
    ["collection-all", `${SHOP}/collections/all`],
    ["search", `${SHOP}/search?q=dog`],
    ["cart", `${SHOP}/cart`],
  ];
  for (const [name, url] of pages) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(6000);
    const text = (await page.locator("body").innerText().catch(() => "")).trim();
    writeFileSync(path.join(OUT, `storefront-${name}.txt`), `URL: ${page.url()}\n\n${text}`);
    console.log(`\n=== ${name} (${page.url().slice(0, 100)})`);
    console.log(text.slice(0, 500));
    await page.screenshot({ path: path.join(OUT, `storefront-${name}-desktop.png`) }).catch(() => {});
  }

  // mobile home
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${SHOP}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: path.join(OUT, "storefront-home-mobile.png") }).catch(() => {});
  console.log("\nmobile screenshot saved");
  await page.setViewportSize({ width: 1440, height: 900 });
} catch (e) {
  console.log("preview check failed:", e.message.slice(0, 150));
} finally {
  await browser.close();
}
console.log("OUT:", OUT);
