import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(4000);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 2500);
  await page.waitForTimeout(1200);
  const scrollers = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      if ((s.overflowY === "auto" || s.overflowY === "scroll") && el.scrollTop > 0) {
        out.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 90), scrollTop: el.scrollTop, scrollH: el.scrollHeight, clientH: el.clientHeight });
      }
    }
    return out;
  });
  console.log(JSON.stringify(scrollers, null, 1));
} finally {
  await browser.close();
}
