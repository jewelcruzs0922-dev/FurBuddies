import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(4000);
  const info = await page.evaluate(() => {
    const secs = [...document.querySelectorAll("[id*='shopify-section']")].map((s) => ({
      id: s.id,
      len: (s.innerHTML || "").length,
      text: (s.textContent || "").trim().slice(0, 60),
    }));
    return secs;
  });
  console.log(JSON.stringify(info, null, 1));
} finally {
  await browser.close();
}
