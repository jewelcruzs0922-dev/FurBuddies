import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(4000);
  // hide Shopify preview bar for clean shots
  const hide = await page.$("text=Hide bar");
  if (hide) { await hide.click().catch(() => {}); await page.waitForTimeout(800); }
  // scroll to bottom via the real scroller
  await page.evaluate(() => { const w = document.querySelector(".page-wrapper"); if (w) w.scrollTop = w.scrollHeight; });
  await page.waitForTimeout(2500);
  const footer = await page.evaluate(() => {
    const f = document.querySelector("footer, .footer-group, #shopify-section-footer-group");
    if (!f) return null;
    const r = f.getBoundingClientRect();
    return { tag: f.tagName, cls: (f.className||"").toString().slice(0,80), top: r.top, height: r.height, text: f.innerText.slice(0, 300) };
  });
  console.log(JSON.stringify(footer, null, 1));
  await page.screenshot({ path: "docs/screenshots/diag-footer.png" });
} finally {
  await browser.close();
}
