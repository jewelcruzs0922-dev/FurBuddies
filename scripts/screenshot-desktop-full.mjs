import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(5000);

  // remove Shopify preview bar (it is a fixed overlay, not theme UI)
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body > *")) {
      const t = el.textContent || "";
      if (t.includes("Exit preview") && el.getBoundingClientRect().height < 80) el.remove();
    }
    const ifr = document.querySelector("iframe#preview-bar, iframe[name='preview-bar'], #preview-bar");
    if (ifr) ifr.remove();
  });
  await page.waitForTimeout(800);

  // scroll through the real scroller to paint every section
  await page.evaluate(async () => {
    const w = document.querySelector(".page-wrapper");
    if (!w) return;
    for (let y = 0; y <= w.scrollHeight; y += 500) {
      w.scrollTop = y;
      await new Promise((r) => setTimeout(r, 180));
    }
  });
  await page.waitForTimeout(2000);

  const footerCheck = await page.evaluate(() => {
    const f = document.querySelector("footer");
    if (!f) return null;
    const s = getComputedStyle(f);
    return { h: f.getBoundingClientRect().height, cv: s.contentVisibility, text: f.innerText.slice(0, 80) };
  });
  console.log("footer:", JSON.stringify(footerCheck));

  await page.addStyleTag({
    content: [
      ".page-wrapper { overflow: visible !important; height: auto !important; }",
      "html, body { overflow: visible !important; height: auto !important; }",
      "footer, footer * { content-visibility: visible !important; contain: none !important; }",
    ].join("\n"),
  });
  await page.waitForTimeout(2000);

  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log("page height:", h);
  await page.screenshot({ path: "docs/screenshots/phase2-home-desktop.png", fullPage: true });
  console.log("saved");
} finally {
  await browser.close();
}
