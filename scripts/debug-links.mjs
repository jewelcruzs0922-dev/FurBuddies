import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.goto("https://admin.shopify.com/store/pet-pantry-test/themes", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(8000);
  const info = await page.evaluate(() => {
    const all = [...document.querySelectorAll("a")].map((a) => a.href).filter((h) => h && !h.startsWith("javascript"));
    const text = document.body.innerText;
    return {
      linkCount: all.length,
      links: all.slice(0, 80),
      hasCopyOfHorizon: text.includes("Copy of Horizon"),
      hasLive: text.includes("Live"),
      snippet: text.slice(0, 1500),
    };
  });
  console.log(JSON.stringify(info, null, 1));
} finally {
  await browser.close();
}
