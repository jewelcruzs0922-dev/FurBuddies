import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  const target = "https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665";
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(target, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(4000);

  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log("page height:", h);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/screenshots/phase2-footer-desktop.png" });
  console.log("footer screenshot saved");

  const footerInfo = await page.evaluate(() => {
    const f = document.querySelector("footer, .footer, [data-testid*='footer']");
    return {
      footerTag: f ? f.className?.slice(0, 80) : null,
      hasEmailList: document.body.innerText.includes("Join the FurBuddies pack"),
      hasDemo: document.body.innerText.includes("fictional pet brand"),
      hasMenu: document.body.innerText.includes("Home") && document.body.innerText.includes("Contact"),
      tail: document.body.innerText.slice(-500),
    };
  });
  console.log(JSON.stringify(footerInfo, null, 1));
} finally {
  await browser.close();
}
