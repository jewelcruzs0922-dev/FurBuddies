import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const BASE = "https://admin.shopify.com/store/pet-pantry-test";
const OUT = path.join(os.tmpdir(), "furbuddies-audit");
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ["themes", `${BASE}/themes`],
  ["products", `${BASE}/products`],
  ["collections", `${BASE}/collections`],
  ["apps", `${BASE}/apps`],
  ["settings-general", `${BASE}/settings/general`],
  ["settings-payments", `${BASE}/settings/payments`],
  ["settings-users", `${BASE}/settings/users`],
];

const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  let page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

  for (const [name, url] of PAGES) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForTimeout(7000);
      const text = (await page.locator("body").innerText().catch(() => "")).trim();
      writeFileSync(path.join(OUT, `${name}.txt`), `URL: ${page.url()}\n\n${text}`);
      console.log(`\n##### ${name} (${page.url().slice(0, 110)})`);
      console.log(text.slice(0, 700) || "(empty body)");
      await page.screenshot({ path: path.join(OUT, `${name}.png`) }).catch(() => {});
    } catch (e) {
      console.log(`\n##### ${name} FAILED: ${e.message.slice(0, 150)}`);
    }
  }
  console.log("\nOUT DIR:", OUT);
} finally {
  await browser.close();
}
