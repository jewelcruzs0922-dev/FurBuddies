import { connect, BASE } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.goto(`${BASE}/content/files`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(5000);
  const imgs = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .map((i) => ({ src: i.currentSrc || i.src || "", alt: i.alt || "" }))
      .filter((x) => x.src.includes("cdn.shopify.com")),
  );
  console.log(JSON.stringify(imgs, null, 1));
} finally {
  await browser.close();
}
