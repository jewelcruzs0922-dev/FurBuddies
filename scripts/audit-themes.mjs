import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const OUT = path.join(os.tmpdir(), "furbuddies-audit");

const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 200));
  });

  await page.goto("https://admin.shopify.com/store/pet-pantry-test/themes", { waitUntil: "domcontentloaded", timeout: 60_000 }).catch((e) => console.log("goto:", e.message.slice(0, 100)));
  await page.waitForTimeout(15_000);

  const text = (await page.locator("body").innerText().catch(() => "")).trim();
  writeFileSync(path.join(OUT, "themes-retry.txt"), `URL: ${page.url()}\n\n${text}`);
  console.log("URL:", page.url());
  console.log("BODY:\n", text.slice(0, 1200));
  console.log("CONSOLE ERRORS:", JSON.stringify(errors.slice(0, 5)));
  await page.screenshot({ path: path.join(OUT, "themes-retry.png") });
  console.log("shot saved");
} finally {
  await browser.close();
}
