import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();

const captured = [];
const onReq = (r) => {
  const u = r.url();
  if (u.includes("app_proxy") && !u.includes("FetchThemeFiles")) {
    captured.push({ url: u, body: r.postData() || "" });
  }
};
page.on("request", onReq);

const edFrame = () => page.frames().find((f) => f.url().includes("code-editor"));

async function retry(label, fn, tries = 8, delay = 3000) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { lastErr = e; console.log(`${label} attempt ${i}: ${String(e.message).split("\n")[0]}`); await page.waitForTimeout(delay); }
  }
  throw lastErr;
}

async function findButton(text) {
  for (const fr of page.frames()) {
    try {
      const b = fr.locator(`button:has-text("${text}")`).first();
      if (await b.isVisible().catch(() => false)) return b;
    } catch {}
  }
  return null;
}

try {
  await page.goto("https://admin.shopify.com/store/pet-pantry-test/themes/188756754665", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(5000);

  // ensure editor open
  for (let i = 0; i < 15 && !edFrame(); i++) {
    const link = page.locator('a:has-text("Edit code"), button:has-text("Edit code")').first();
    if (await link.isVisible().catch(() => false)) await link.click().catch(() => {});
    await page.waitForTimeout(4000);
  }
  if (!edFrame()) throw new Error("no editor frame");

  // open AGENTS.md
  await retry("open-file", async () => {
    const f = edFrame();
    if (!f) throw new Error("no frame");
    await f.locator("text=AGENTS.md").first().dblclick({ timeout: 8000 });
  });
  await page.waitForTimeout(3000);

  // type marker at end of document
  await retry("type", async () => {
    const f = edFrame();
    if (!f) throw new Error("no frame");
    await f.locator(".monaco-editor").first().click({ timeout: 8000 });
    await page.keyboard.press("Control+End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("\n<!-- write-probe -->", { delay: 5 });
  });
  await page.waitForTimeout(2000);

  // verify dirty: look for Save button state / tab dot
  const save = await findButton("Save");
  console.log("save found:", !!save);
  await page.screenshot({ path: "docs/screenshots/save-probe.png" });
  if (save) {
    await save.click({ timeout: 8000 });
    console.log("clicked save");
    await page.waitForTimeout(7000);
  }

  console.log("captured:", captured.length);
  for (const c of captured) {
    console.log("\nURL:", c.url);
    console.log("BODY:", c.body.slice(0, 3000));
  }
  await page.screenshot({ path: "docs/screenshots/save-probe-after.png" });
} finally {
  page.off("request", onReq);
  await browser.close();
}
