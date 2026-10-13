import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const SHOP = "https://pet-pantry-test.myshopify.com";
const OUT = path.join(os.tmpdir(), "furbuddies-audit");

const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().startsWith(SHOP) && !p.url().includes("/password"));
  if (!page) throw new Error("preview tab not found");
  console.log("using tab:", page.url().slice(0, 100));

  const routes = [
    ["home", `${SHOP}/`],
    ["collection-all", `${SHOP}/collections/all`],
    ["search", `${SHOP}/search?q=dog`],
    ["cart", `${SHOP}/cart`],
  ];
  for (const [name, url] of routes) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(6000);
    if (page.url().includes("/password")) {
      console.log(`\n=== ${name}: BLOCKED BY PASSWORD`);
      continue;
    }
    const text = (await page.locator("body").innerText().catch(() => "")).trim();
    writeFileSync(path.join(OUT, `sf-${name}.txt`), `URL: ${page.url()}\n\n${text}`);
    console.log(`\n=== ${name} (${page.url().slice(0, 100)})`);
    console.log(text.slice(0, 450));
    await page.screenshot({ path: path.join(OUT, `sf-${name}-desktop.png`) }).catch(() => {});
  }

  for (const [name, url] of [["home", `${SHOP}/`], ["collection-all", `${SHOP}/collections/all`]]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(OUT, `sf-${name}-mobile.png`) }).catch(() => {});
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  console.log("\ndone");
} finally {
  await browser.close();
}
