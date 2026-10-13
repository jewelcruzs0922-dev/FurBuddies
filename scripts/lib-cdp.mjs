import { chromium } from "playwright";

export const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
export const BASE = "https://admin.shopify.com/store/pet-pantry-test";

export async function connect() {
  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();
  return { browser, context, page };
}

export async function waitForFrame(page, match, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const f = page.frames().find((fr) => fr.url().includes(match));
    if (f) {
      try {
        await f.waitForSelector("body", { timeout: 2000 });
        return f;
      } catch {}
    }
    await page.waitForTimeout(1000);
  }
  throw new Error(`frame matching "${match}" not found within ${timeoutMs}ms`);
}

export async function openThemes(page) {
  await page.goto(`${BASE}/themes`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(6000);
  return waitForFrame(page, "online-store-web");
}
