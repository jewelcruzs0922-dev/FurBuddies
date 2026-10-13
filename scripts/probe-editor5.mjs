import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";

const HERO_IMG = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/hero-frenchie.jpg";

const { browser, page } = await connect();

try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(12000);
  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);

  await frame.evaluate(() => {
    window.__gcs = [];
    const of = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input?.url;
      if (String(url).includes("shopify-staged-uploads.storage.googleapis.com")) {
        const fd = init?.body;
        const o = {};
        if (fd && typeof fd.entries === "function") {
          for (const [k, v] of fd.entries()) o[k] = typeof v === "string" ? v : `<${v.name}|${v.size}|${v.type}>`;
        }
        window.__gcs.push({ url: String(url), fields: o });
      }
      return of(input, init);
    };
  });

  await frame.locator('button[aria-labelledby*="hero_jVaWmY-label"]').first().click();
  await page.waitForTimeout(2500);
  await frame.locator("input[type=file]").first().setInputFiles(HERO_IMG);
  await page.waitForTimeout(10000);

  const gcs = await frame.evaluate(() => window.__gcs);
  console.log("GCS FORM:", JSON.stringify(gcs, null, 1).slice(0, 3000));
} finally {
  await browser.close();
}
