import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(4000);
  const html = await page.evaluate(() => {
    const sec = document.querySelector("[id*='hero_jVaWmY']");
    if (!sec) return "NO HERO SECTION";
    return sec.innerHTML.slice(0, 4000);
  });
  console.log(html);
} finally {
  await browser.close();
}
