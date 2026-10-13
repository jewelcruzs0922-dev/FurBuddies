import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 380, height: 780 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(5000);

  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body > *")) {
      const t = el.textContent || "";
      if (t.includes("Exit preview") && el.getBoundingClientRect().height < 80) el.remove();
    }
  });
  await page.waitForTimeout(500);

  await page.evaluate(async () => {
    const w = document.querySelector(".page-wrapper") || document.scrollingElement;
    if (!w) return;
    const max = w.scrollHeight || document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += 400) {
      w.scrollTop = y;
      await new Promise((r) => setTimeout(r, 220));
    }
    const el = document.querySelector("[id*='media_editorial']");
    if (el) el.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(3500);
  await page.evaluate(() => {
    const w = document.querySelector(".page-wrapper") || document.scrollingElement;
    if (w) w.scrollTop = 0;
  });
  await page.waitForTimeout(1000);

  await page.addStyleTag({
    content: [
      ".page-wrapper { overflow: visible !important; height: auto !important; }",
      "html, body { overflow: visible !important; height: auto !important; }",
      "footer, footer * { content-visibility: visible !important; contain: none !important; }",
    ].join("\n"),
  });
  await page.waitForTimeout(1500);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log("page height:", h);
  await page.screenshot({ path: "docs/screenshots/phase2-home-mobile.png", fullPage: true });
  console.log("saved");
} finally {
  await browser.close();
}
