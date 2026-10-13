import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const urls = [...document.querySelectorAll("link[href], script[src], img[src], source[srcset]")].map(
      (e) => e.href || e.src || e.srcset || "",
    );
    const joined = urls.join(" ");
    const ids = [...new Set(joined.match(/s\/files\/(\d+)\//g) || [])];
    const sample = urls.filter((u) => u.includes("/s/files/")).slice(0, 5);
    return { ids, sample };
  });
  console.log(JSON.stringify(info, null, 1));
} finally {
  await browser.close();
}
