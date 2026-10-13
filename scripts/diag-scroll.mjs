import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(4000);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 2500);
  await page.waitForTimeout(1500);
  const pos = await page.evaluate(() => ({
    windowY: window.scrollY,
    scrollingEl: document.scrollingElement?.scrollTop,
    mainTop: document.querySelector("#MainContent").getBoundingClientRect().top,
  }));
  console.log(JSON.stringify(pos));
  await page.screenshot({ path: "docs/screenshots/diag-scroll.png" });
} finally {
  await browser.close();
}
