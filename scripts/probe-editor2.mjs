import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";

const HERO_IMG = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/hero-frenchie.jpg";

const { browser, page } = await connect();
let stagedTarget = null;

page.on("request", (req) => {
  const u = req.url();
  if (u.includes("stagedUploadsCreate") || (u.includes("operation=") && u.includes("staged"))) {
    try { stagedTarget = { url: u, body: req.postData() }; } catch {}
  }
});
page.on("response", async (res) => {
  const u = res.url();
  if (u.includes("stagedUploadsCreate") || (u.includes("/api/shopify/") && u.includes("staged"))) {
    try { stagedTarget = { ...(stagedTarget || {}), respUrl: u, respBody: (await res.text()).slice(0, 2000) }; } catch {}
  }
});

try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(12000);
  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);
  await frame.locator('button[aria-labelledby*="hero_jVaWmY-label"]').first().click();
  await page.waitForTimeout(2500);
  await frame.locator("input[type=file]").first().setInputFiles(HERO_IMG);
  await page.waitForTimeout(8000);

  // also capture the actual multipart fields via request interception on GCS
  const gcsReq = await page.evaluate(() => window.__gcs || null);
  console.log("stagedTarget:", JSON.stringify(stagedTarget, null, 1).slice(0, 2000));
} finally {
  await browser.close();
}
