import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";
import fs from "fs";

const HERO_IMG = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/hero-frenchie.jpg";

const { browser, page } = await connect();
const captured = [];
page.on("request", (req) => {
  const u = req.url();
  const m = req.method();
  const ct = req.headers()["content-type"] || "";
  if (m === "POST" && (u.includes("upload") || u.includes("staged") || ct.includes("multipart") || u.includes("asset") || u.includes("files"))) {
    captured.push({ url: u.slice(0, 200), ct, bodyLen: (req.postData() || "").length });
  }
});

try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(12000);
  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);
  await frame.locator('button[aria-labelledby*="hero_jVaWmY-label"]').first().click();
  await page.waitForTimeout(2500);
  await frame.locator("input[type=file]").first().setInputFiles(HERO_IMG);
  await page.waitForTimeout(10000);
  console.log("captured POSTs:", JSON.stringify(captured, null, 1).slice(0, 2000));
  fs.writeFileSync("captured-editor-upload.json", JSON.stringify(captured, null, 1));
} finally {
  await browser.close();
}
