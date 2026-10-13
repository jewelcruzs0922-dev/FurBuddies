import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
const captured = [];
const onReq = (r) => {
  if (r.url().includes("operation=FetchThemeFiles")) captured.push(r.postData() || "");
};
page.on("request", onReq);
try {
  await page.goto("https://admin.shopify.com/store/pet-pantry-test/themes/188756754665", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(5000);
  for (let i = 0; i < 15 && !captured.length; i++) {
    const link = page.locator('a:has-text("Edit code"), button:has-text("Edit code")').first();
    if (await link.isVisible().catch(() => false)) await link.click().catch(() => {});
    await page.waitForTimeout(4000);
  }
  if (!captured.length) throw new Error("nothing captured");
  console.log(captured[0]);
} finally {
  page.off("request", onReq);
  await browser.close();
}
