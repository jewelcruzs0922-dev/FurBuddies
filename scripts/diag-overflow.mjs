import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(4000);
  const info = await page.evaluate(() => {
    const b = document.body;
    const out = { bodyClass: b.className, bodyStyle: b.getAttribute("style"), htmlStyle: document.documentElement.getAttribute("style") };
    // check open dialogs/drawers
    out.openDrawers = [...document.querySelectorAll("[data-open], dialog[open], [aria-hidden=false].drawer, .cart-drawer")].slice(0, 5).map((e) => (e.className || "").toString().slice(0, 80));
    out.dialogs = [...document.querySelectorAll("dialog")].map((d) => ({ open: d.open, cls: (d.className || "").slice(0, 60) }));
    return out;
  });
  console.log(JSON.stringify(info, null, 1));
} finally {
  await browser.close();
}
