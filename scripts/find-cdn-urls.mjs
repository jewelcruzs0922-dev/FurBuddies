import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(3000);
  const urls = await page.evaluate(() => {
    const out = new Set();
    for (const e of document.querySelectorAll("[src], [href], [srcset]")) {
      for (const attr of ["src", "href", "srcset"]) {
        const v = e.getAttribute(attr);
        if (v && v.includes("cdn.shopify.com")) out.add(v.split(" ")[0].slice(0, 130));
      }
    }
    return [...out].slice(0, 25);
  });
  console.log(urls.join("\n"));
} finally {
  await browser.close();
}
