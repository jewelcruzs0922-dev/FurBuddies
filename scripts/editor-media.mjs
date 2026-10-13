import { connect, BASE, waitForFrame } from "./lib-cdp.mjs";

const EDIT_IMG = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/editorial-dog.jpg";

const { browser, page } = await connect();
try {
  await page.goto(`${BASE}/themes/188756754665/editor`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(12000);
  const frame = await waitForFrame(page, "online-store-web.shopifyapps.com/themes", 30000);

  await frame.locator('button[aria-labelledby*="media_editorial-label"]').first().click();
  await page.waitForTimeout(2500);
  await frame.locator('button[aria-labelledby*="media_editorial__media-label"]').first().click();
  await page.waitForTimeout(2500);

  const input = frame.locator('input[type="file"][accept*="image"]').first();
  console.log("input count:", await frame.locator('input[type="file"][accept*="image"]').count());
  await input.setInputFiles(EDIT_IMG);
  console.log("editorial image set, waiting for upload...");
  await page.waitForTimeout(10000);

  const save = frame.getByRole("button", { name: "Save", exact: true });
  await save.first().click();
  console.log("clicked save");
  await page.waitForTimeout(7000);
  await page.screenshot({ path: "docs/screenshots/editor-media-saved.png" });
  console.log("done");
} finally {
  await browser.close();
}
