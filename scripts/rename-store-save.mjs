import { chromium } from "playwright";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("store-contact-details"));
  if (!page) throw new Error("contact page not found");

  const save = page.locator('button:has-text("Save")').first();
  console.log("save visible:", await save.isVisible().catch(() => false));
  await save.click({ timeout: 8000 });
  await page.waitForTimeout(5000);

  const unsaved = await page.getByText("Unsaved changes").first().isVisible().catch(() => false);
  const val = await page.getByLabel(/store name/i).first().inputValue().catch(() => "n/a");
  console.log("unsaved bar:", unsaved, "| store name:", JSON.stringify(val));
  await page.screenshot({ path: "docs/screenshots/settings-renamed.png" });
  console.log(unsaved ? "SAVE FAILED" : "SAVE OK");
} finally {
  await browser.close();
}
