import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";

const HERO_IMG = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/hero-frenchie.jpg";

const { browser, page } = await connect();

try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(12000);
  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);

  // patch fetch inside iframe to capture the stagedUploadsCreate response
  await frame.evaluate(() => {
    window.__staged = [];
    const of = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
      const resp = await of(...args);
      if (String(url).toLowerCase().includes("staged")) {
        try { const j = await resp.clone().json(); window.__staged.push({ url: String(url).slice(0, 200), json: j }); } catch {}
      }
      return resp;
    };
  });

  // also patch FormData append order by spying on the GCS post via PerformanceObserver is hard;
  // instead capture from the parent page the network request body of the GCS POST
  const gcsPosts = [];
  page.on("request", (req) => {
    if (req.url().includes("shopify-staged-uploads.storage.googleapis.com") && req.method() === "POST") {
      try {
        const pd = req.postData() || "";
        gcsPosts.push({ len: pd.length, preview: pd.slice(0, 1200) });
      } catch (e) { gcsPosts.push({ err: String(e).slice(0, 100) }); }
    }
  });

  await frame.locator('button[aria-labelledby*="hero_jVaWmY-label"]').first().click();
  await page.waitForTimeout(2500);
  await frame.locator("input[type=file]").first().setInputFiles(HERO_IMG);
  await page.waitForTimeout(10000);

  const staged = await frame.evaluate(() => window.__staged);
  console.log("STAGED CREATE:", JSON.stringify(staged, null, 1).slice(0, 2500));
  console.log("GCS POSTS:", JSON.stringify(gcsPosts, null, 1).slice(0, 2500));
} finally {
  await browser.close();
}
