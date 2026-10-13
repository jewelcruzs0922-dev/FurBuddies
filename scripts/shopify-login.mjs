import { chromium } from "playwright";
import path from "node:path";
import os from "node:os";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const shot = path.join(os.tmpdir(), `shopify-login-step-${Date.now()}.png`);

const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("shopify.com"));
  if (!page) throw new Error("no shopify tab");

  const google = page.getByText("Continue with Google", { exact: true }).first();
  if (await google.isVisible().catch(() => false)) {
    console.log("clicking Continue with Google...");
    await google.click();
    await page.waitForTimeout(6000);
  }

  console.log("URL:", page.url().slice(0, 160));
  console.log("TITLE:", await page.title());
  console.log("BODY:\n", (await page.locator("body").innerText().catch(() => "")).slice(0, 900));
  const btns = await page.evaluate(() =>
    [...document.querySelectorAll("button, a")]
      .map((e) => ({ tag: e.tagName, text: (e.innerText || "").trim().replace(/\n/g, " ").slice(0, 50), disabled: e.disabled || e.getAttribute("aria-disabled") === "true", id: e.id }))
      .filter((x) => x.text)
      .slice(0, 20),
  );
  console.log("BUTTONS:", JSON.stringify(btns, null, 2));
  const inputs = await page.evaluate(() =>
    [...document.querySelectorAll("input")].map((e) => ({ type: e.type, name: e.name, id: e.id, visible: !!(e.offsetWidth || e.offsetHeight) })),
  );
  console.log("INPUTS:", JSON.stringify(inputs));
  await page.screenshot({ path: shot });
  console.log("shot:", shot);
} finally {
  await browser.close();
}
