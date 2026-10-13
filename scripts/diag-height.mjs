import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(4000);
  const info = await page.evaluate(() => {
    const d = document.documentElement, b = document.body;
    const main = document.querySelector("#MainContent, main, #shopify-section-template--27956869103849__hero_jVaWmY");
    const cs = main ? getComputedStyle(main) : null;
    return {
      docScroll: d.scrollHeight, docClient: d.clientHeight,
      bodyScroll: b.scrollHeight, bodyClient: b.clientHeight,
      bodyOverflow: getComputedStyle(b).overflow, htmlOverflow: getComputedStyle(d).overflow,
      mainTag: main?.tagName, mainId: main?.id, mainH: main ? main.getBoundingClientRect().height : null,
      mainOverflow: cs?.overflow, mainHeight: cs?.height,
    };
  });
  console.log(JSON.stringify(info, null, 1));
} finally {
  await browser.close();
}
