import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(10000);
  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);

  await frame.locator('button[aria-labelledby*="hero_jVaWmY-label"]').first().click();
  await page.waitForTimeout(3000);

  const panel = await frame.evaluate(() => ({
    body: document.body.innerText.slice(0, 2000),
    fileInputs: document.querySelectorAll("input[type=file]").length,
  }));
  console.log(JSON.stringify(panel, null, 1));
} finally {
  await browser.close();
}
