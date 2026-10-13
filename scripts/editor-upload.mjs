import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";

const HERO_IMG = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/hero-frenchie.jpg";
const EDIT_IMG = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/editorial-dog.jpg";

const { browser, page } = await connect();
try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(12000);
  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);

  // --- Hero image ---
  await frame.locator('button[aria-labelledby*="hero_jVaWmY-label"]').first().click();
  await page.waitForTimeout(2500);
  await frame.locator("input[type=file]").first().setInputFiles(HERO_IMG);
  console.log("hero image uploaded");
  await page.waitForTimeout(9000);

  // --- Media with text: click section, then its Upload images button ---
  await frame.locator('button[aria-labelledby*="media_editorial-label"]').first().click();
  await page.waitForTimeout(3000);

  // find the Upload images button inside the settings panel
  const uploadBtn = frame.getByRole("button", { name: /upload images/i }).first();
  const uploadCount = await frame.getByRole("button", { name: /upload images/i }).count();
  console.log("upload buttons visible:", uploadCount);
  if (await uploadCount) {
    await uploadBtn.click();
    await page.waitForTimeout(1500);
  }
  const fileInputs = frame.locator("input[type=file]");
  const n = await fileInputs.count();
  console.log("file inputs now:", n);
  if (n) {
    await fileInputs.first().setInputFiles(EDIT_IMG);
    console.log("editorial image uploaded");
    await page.waitForTimeout(9000);
  }

  await page.screenshot({ path: "docs/screenshots/editor-before-save.png" });

  // --- Save ---
  const saveBtn = frame.getByRole("button", { name: "Save", exact: true });
  console.log("save buttons:", await saveBtn.count());
  await saveBtn.first().click();
  console.log("clicked save");
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "docs/screenshots/editor-after-save.png" });
  console.log("done");
} finally {
  await browser.close();
}
