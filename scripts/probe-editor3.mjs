import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";

const HERO_IMG = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/hero-frenchie.jpg";

const { browser, page } = await connect();
const captures = [];

try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(12000);
  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);

  // patch fetch/XHR inside the iframe before triggering upload
  await frame.evaluate(() => {
    window.__cap = [];
    const of = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
      const init = args[1] || {};
      let bodyPreview = "";
      try {
        if (init.body && typeof init.body === "string") bodyPreview = init.body.slice(0, 1500);
        else if (init.body instanceof FormData) {
          const o = {};
          for (const [k, v] of init.body.entries()) o[k] = typeof v === "string" ? v.slice(0, 200) : `<file ${v.name} ${v.size}>`;
          bodyPreview = JSON.stringify(o);
        }
      } catch (e) { bodyPreview = "<err>"; }
      window.__cap.push({ url: String(url).slice(0, 250), method: init.method || "GET", bodyPreview });
      return of(...args);
    };
  });

  await frame.locator('button[aria-labelledby*="hero_jVaWmY-label"]').first().click();
  await page.waitForTimeout(2500);
  await frame.locator("input[type=file]").first().setInputFiles(HERO_IMG);
  await page.waitForTimeout(10000);

  const cap = await frame.evaluate(() => window.__cap);
  console.log(JSON.stringify(cap, null, 1).slice(0, 4000));
} finally {
  await browser.close();
}
