import { chromium } from "playwright";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const TIMEOUT_MS = Number(process.env.WAIT_MS ?? 300_000);

const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("shopify") || p.url().includes("google.com"));
  if (!page) throw new Error("no tab to watch");

  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const url = page.url();

    // skip shopify's own interstitials only (never touch credentials)
    const notNow = page.getByText("Not now", { exact: true }).first();
    if (await notNow.isVisible().catch(() => false)) {
      console.log("skipping passkey prompt...");
      await notNow.click().catch(() => {});
      await page.waitForTimeout(3000);
      continue;
    }
    const remind = page.getByText("Remind me next time", { exact: true }).first();
    if (await remind.isVisible().catch(() => false)) {
      console.log("skipping security review...");
      await remind.click().catch(() => {});
      await page.waitForTimeout(3000);
      continue;
    }

    if (url.includes("admin.shopify.com") || url.includes("partners.shopify.com") || url.includes("dev.shopify.com")) {
      console.log("LOGIN DETECTED:", url.slice(0, 120));
      break;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  if (!page.url().includes("admin.shopify.com")) {
    await page.goto("https://admin.shopify.com/store/pet-pantry-test", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(8000);
  }
  console.log("URL:", page.url());
  console.log("TITLE:", await page.title());
  console.log("BODY:\n", (await page.locator("body").innerText().catch(() => "")).slice(0, 800));
} finally {
  await browser.close();
}
