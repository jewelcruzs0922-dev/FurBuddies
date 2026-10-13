import { connect, BASE } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(12000);

  const info = await page.evaluate(() => ({
    url: location.href,
    frames: [...document.querySelectorAll("iframe")].map((f) => f.src.slice(0, 100)),
    buttons: [...document.querySelectorAll("button, a[role=button]")].slice(0, 40).map((b) => (b.textContent || "").trim().slice(0, 40)).filter(Boolean),
    body: document.body.innerText.slice(0, 800),
  }));
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: "docs/screenshots/editor-phase2.png" });
} finally {
  await browser.close();
}
