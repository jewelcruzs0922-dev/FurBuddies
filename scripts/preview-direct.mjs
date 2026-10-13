import { connect } from "./lib-cdp.mjs";
import fs from "fs";

const { browser, page } = await connect();
try {
  fs.mkdirSync("docs/screenshots", { recursive: true });
  const target = "https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665";
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(target, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(6000);
  const state = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    body: document.body?.innerText?.slice(0, 400),
  }));
  console.log(JSON.stringify(state, null, 1));
  await page.screenshot({ path: "docs/screenshots/phase2-home-desktop.png", fullPage: true });
  console.log("desktop screenshot saved");
} finally {
  await browser.close();
}
