import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 380, height: 780 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(4000);
  // scroll to editorial section
  await page.evaluate(() => {
    const el = document.querySelector("#shopify-section-template--27956869103849__media_editorial, [id*='media_editorial']");
    if (el) el.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")].map((i) => ({
      src: (i.currentSrc || i.src || "").slice(0, 110),
      complete: i.complete,
      nw: i.naturalWidth,
      nh: i.naturalHeight,
      w: Math.round(i.getBoundingClientRect().width),
      h: Math.round(i.getBoundingClientRect().height),
      loading: i.loading,
    }));
    return imgs.filter((i) => i.src.includes("editorial") || i.src.includes("files/") || i.h > 150);
  });
  console.log(JSON.stringify(info, null, 1));
} finally {
  await browser.close();
}
