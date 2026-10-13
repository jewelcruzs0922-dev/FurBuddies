import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(10000);

  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);
  console.log("frame url:", frame.url().slice(0, 120));

  const info = await frame.evaluate(() => ({
    body: document.body.innerText.slice(0, 1200),
    controls: [...document.querySelectorAll("button, [role=button], a")].slice(0, 50).map((b) => (b.textContent || "").trim().slice(0, 40)).filter(Boolean),
  }));
  console.log(JSON.stringify(info, null, 1));
} finally {
  await browser.close();
}
