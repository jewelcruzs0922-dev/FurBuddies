import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  const f = page.frames().find((fr) => fr.url().includes("code-editor"));
  if (!f) throw new Error("no code-editor frame");

  // Approach 1: double-click tree item
  const item = f.locator('text=AGENTS.md').first();
  console.log("visible:", await item.isVisible().catch(() => false));
  await item.dblclick({ timeout: 8000 }).catch((e) => console.log("dblclick err:", e.message.slice(0, 150)));
  await page.waitForTimeout(3000);

  let tabs = await f.evaluate(() => [...document.querySelectorAll('[role="tab"], [class*="tab"]')].map((e) => (e.innerText || "").trim()).filter(Boolean).slice(0, 10));
  console.log("tabs after dblclick:", JSON.stringify(tabs));

  // Approach 2: Ctrl+P quick open
  await f.click('body', { position: { x: 700, y: 300 } }).catch(() => {});
  await page.keyboard.press("Control+p");
  await page.waitForTimeout(1500);
  await page.keyboard.type("AGENTS.md", { delay: 60 });
  await page.waitForTimeout(1500);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3000);

  const text = await f.evaluate(() => {
    const v = [...document.querySelectorAll(".view-line, .view-lines")].map((e) => e.innerText).join("\n");
    return v.slice(0, 4000);
  });
  console.log("EDITOR TEXT:", JSON.stringify(text.slice(0, 4000)));
  await page.screenshot({ path: "docs/screenshots/code-agents-md.png" });
} finally {
  await browser.close();
}
