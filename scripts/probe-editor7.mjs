import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";

const HERO_IMG = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/hero-frenchie.jpg";

const { browser, page } = await connect();

try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(12000);
  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);

  await frame.evaluate(() => {
    window.__mut = [];
    const of = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input?.url;
      const method = (init?.method || "GET").toUpperCase();
      if (method === "POST") {
        let op = "", bodyPreview = "";
        try {
          const j = typeof init?.body === "string" ? JSON.parse(init.body) : null;
          if (j) { op = j.operationName || ""; bodyPreview = JSON.stringify(j).slice(0, 700); }
        } catch {}
        if (op) window.__mut.push({ op, url: String(url).slice(0, 160), bodyPreview });
      }
      return of(input, init);
    };
  });

  await frame.locator('button[aria-labelledby*="hero_jVaWmY-label"]').first().click();
  await page.waitForTimeout(2500);
  await frame.locator("input[type=file]").first().setInputFiles(HERO_IMG);
  await page.waitForTimeout(12000);

  const muts = await frame.evaluate(() => window.__mut);
  const interesting = muts.filter((m) => /media|image|upload|staged|asset/i.test(m.op));
  console.log("ALL OPS:", muts.map((m) => m.op).join(", "));
  console.log("\nINTERESTING:", JSON.stringify(interesting, null, 1).slice(0, 3000));
} finally {
  await browser.close();
}
