import { connect } from "./lib-cdp.mjs";
import fs from "fs";

const { browser, page } = await connect();
try {
  fs.mkdirSync("docs/screenshots", { recursive: true });
  const target = "https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665";

  // desktop: tall viewport so content-visibility renders everything
  await page.setViewportSize({ width: 1440, height: 5200 });
  await page.goto(target, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "docs/screenshots/phase2-home-desktop.png" });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log("desktop done, page height:", h);

  // mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(3000);
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "docs/screenshots/phase2-home-mobile.png", fullPage: true });
  console.log("mobile done");
} finally {
  await browser.close();
}
