import { chromium } from "playwright";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const NEW_NAME = process.argv[2] ?? "FurBuddies";

const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

  await page.goto("https://admin.shopify.com/store/pet-pantry-test/settings/general/store-contact-details", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(6000);
  console.log("url after nav:", page.url());

  const inputs = await page.evaluate(() =>
    [...document.querySelectorAll("input, textarea")].map((e) => ({
      type: e.type,
      value: (e.value || "").slice(0, 50),
      visible: !!(e.offsetWidth || e.offsetHeight),
      label: ((document.querySelector(`label[for="${e.id}"]`) || {}).innerText || e.getAttribute("aria-label") || "").slice(0, 50),
    })).filter((i) => i.visible),
  );
  console.log("INPUTS:", JSON.stringify(inputs, null, 1));
  await page.screenshot({ path: "docs/screenshots/settings-contact.png" });

  const field = page.getByLabel(/store name/i).first();
  const visible = await field.isVisible().catch(() => false);
  console.log("Store name field visible:", visible);

  if (visible) {
    const before = await field.inputValue().catch(() => "");
    console.log("before:", JSON.stringify(before));
    if (before !== NEW_NAME) {
      await field.fill(NEW_NAME);
      const save = page.getByRole("button", { name: /^save$/i }).first();
      if (await save.isVisible().catch(() => false)) {
        await save.click();
        console.log("clicked Save");
      } else {
        console.log("no Save button visible");
      }
      await page.waitForTimeout(5000);
    }
    const after = await field.inputValue().catch(() => "");
    console.log("after:", JSON.stringify(after));
    console.log("RENAME:", after === NEW_NAME ? "OK" : "FAILED — verify manually");
  }
  await page.screenshot({ path: "docs/screenshots/settings-renamed.png" }).catch(() => {});
} finally {
  await browser.close();
}
