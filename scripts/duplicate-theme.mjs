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
  if (!frame) throw new Error("online-store-web frame not found");

  const more = frame.getByRole("button", { name: "Click for more theme actions" });
  console.log("more visible:", await more.isVisible().catch(() => false));
  await more.click();
  await frame.waitForTimeout(2000);

  const dup = frame.getByRole("button", { name: "Duplicate" });
  console.log("duplicate visible:", await dup.isVisible().catch(() => false));
  await dup.click();
  console.log("clicked Duplicate");

  // wait for a second theme card to appear
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(2000);
    const cards = await frame.evaluate(() => {
      const names = [...document.querySelectorAll('[aria-label], h2, h3, [class*="title"]')]
        .map((e) => (e.innerText || "").trim())
        .filter(Boolean);
      return names.filter((n) => /Horizon|Copy|Duplicat/i.test(n)).slice(0, 10);
    });
    console.log(`t+${(i + 1) * 2}s:`, JSON.stringify(cards));
    if (cards.some((c) => /Copy|Duplicat/i.test(c))) {
      console.log("DUPLICATE CREATED");
      break;
    }
  }
  await page.screenshot({ path: "docs/screenshots/themes-after-duplicate.png" }).catch(() => {});
} finally {
  await browser.close();
}
