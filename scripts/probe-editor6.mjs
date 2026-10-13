import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";

const HERO_IMG = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/hero-frenchie.jpg";

const { browser, page } = await connect();

try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(12000);
  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);

  await frame.evaluate(() => {
    window.__after = [];
    const of = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input?.url;
      const method = init?.method || "GET";
      let bodyPreview = "";
      try {
        if (typeof init?.body === "string") bodyPreview = init.body.slice(0, 900);
      } catch {}
      const resp = await of(input, init);
      if (method === "POST" && !String(url).includes("storage.googleapis.com")) {
        window.__after.push({ url: String(url).slice(0, 220), bodyPreview });
      }
      return resp;
    };
  });

  await frame.locator('button[aria-labelledby*="hero_jVaWmY-label"]').first().click();
  await page.waitForTimeout(2500);
  await frame.locator("input[type=file]").first().setInputFiles(HERO_IMG);
  await page.waitForTimeout(12000);

  const after = await frame.evaluate(() => window.__after);
  console.log("POST-UPLOAD CALLS:", JSON.stringify(after, null, 1).slice(0, 3500));
} finally {
  await browser.close();
}
