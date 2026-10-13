import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(4000);
  const html = await page.evaluate(() => {
    const s = document.getElementById("shopify-section-sections--27956863107305__footer_m9NzUG");
    return s.innerHTML;
  });
  console.log(html.slice(2200));
} finally {
  await browser.close();
}
