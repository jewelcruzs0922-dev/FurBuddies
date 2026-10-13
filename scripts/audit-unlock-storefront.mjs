import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const BASE = "https://admin.shopify.com/store/pet-pantry-test";
const SHOP = "https://pet-pantry-test.myshopify.com";
const OUT = path.join(os.tmpdir(), "furbuddies-audit");

const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("shopify")) ?? await context.newPage();

  // read storefront password from admin Preferences (not printed to logs)
  await page.goto(`${BASE}/preferences`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(7000);
  const pwd = await page.evaluate(() => {
    const el = document.querySelector('input[type="password"], input[name*="password" i]');
    return el ? el.value : null;
  });
  console.log("password found in admin:", pwd ? "yes" : "no");
  if (!pwd) {
    console.log("PREFS BODY:\n", (await page.locator("body").innerText().catch(() => "")).slice(0, 700));
    process.exit(1);
  }

  // unlock storefront in this browser profile
  await page.goto(`${SHOP}/password`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(4000);
  const pwInput = page.locator('input[type="password"], input[name="password"]').first();
  if (await pwInput.isVisible().catch(() => false)) {
    await pwInput.fill(pwd);
    await pwInput.press("Enter");
    await page.waitForTimeout(6000);
  }
  console.log("after unlock URL:", page.url());

  // audit storefront pages
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
    writeFileSync(path.join(OUT, `sf-${name}.txt`), `URL: ${page.url()}\n\n${text}`);
    console.log(`\n=== ${name} (${page.url().slice(0, 100)})`);
    console.log(text.slice(0, 450));
    await page.screenshot({ path: path.join(OUT, `sf-${name}-desktop.png`) }).catch(() => {});
  }

  // mobile home + collection
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [name, url] of [["home", `${SHOP}/`], ["collection-all", `${SHOP}/collections/all`]]) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(OUT, `sf-${name}-mobile.png`) }).catch(() => {});
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  console.log("\ndone. OUT:", OUT);
} finally {
  await browser.close();
}
