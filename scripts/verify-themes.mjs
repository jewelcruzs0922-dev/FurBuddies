import { chromium } from "playwright";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const BASE = "https://admin.shopify.com/store/pet-pantry-test";

const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();
  await page.goto(`${BASE}/themes`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(10_000);
  const frame = page.frames().find((f) => f.url().includes("online-store-web"));
  const headings = [];
  if (frame) {
    for (const h of await frame.locator("h1, h2, h3, h4").all()) {
      const t = (await h.innerText().catch(() => "")).trim();
      if (t) headings.push(t);
    }
  }
  console.log("THEME HEADINGS:", JSON.stringify(headings));
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "docs/screenshots/themes-drafts.png" }).catch(() => {});
  console.log("shot: docs/screenshots/themes-drafts.png");
} finally {
  await browser.close();
}
