import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(3000);
  const info = await page.evaluate(async () => {
    const sec = document.getElementById("shopify-section-sections--27956863107305__footer_m9NzUG");
    sec.scrollIntoView();
    await new Promise((r) => setTimeout(r, 1000));
    const content = sec.querySelector(".footer-content");
    return { sectionH: sec.offsetHeight, contentH: content.offsetHeight, scrollY: window.scrollY, pageH: document.documentElement.scrollHeight };
  });
  console.log(JSON.stringify(info));
  await page.evaluate(() => document.getElementById("shopify-section-sections--27956863107305__footer_m9NzUG").scrollIntoView());
  await page.waitForTimeout(800);
  await page.screenshot({ path: "docs/screenshots/phase2-footer-desktop.png" });
  console.log("footer screenshot saved");
} finally {
  await browser.close();
}
