import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
const captured = [];
const onReq = (r) => {
  const u = r.url();
  if (u.includes("app_proxy") && !/FetchThemeFiles|InitialRequest|OnlineStoreTheme|ThemeData|GenerateArgus|FetchThemeFileVersions/.test(u)) {
    captured.push({ url: u, body: r.postData() || "" });
  }
};
page.on("request", onReq);

const waitFrame = async (ms = 40_000) => {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const f = page.frames().find((fr) => fr.url().includes("code-editor"));
    if (f) {
      try {
        await f.waitForSelector("body", { timeout: 2000 });
        return f;
      } catch {}
    }
    await page.waitForTimeout(1000);
  }
  return null;
};

try {
  let f = await waitFrame();
  if (!f) throw new Error("no editor frame after 40s");

  // check dirty state
  const dirty = await f.evaluate(() => {
    const tab = [...document.querySelectorAll('[role="tab"], [class*="tab"]')].map((e) => (e.innerText || "").trim());
    const dot = !!document.querySelector('[class*="dirty"], [class*="modified"]');
    return { tab: tab.slice(0, 5), dot };
  }).catch((e) => ({ err: e.message }));
  console.log("dirty state:", JSON.stringify(dirty));

  const save = f.locator('a.action-label:has-text("Save"), [role="button"]:has-text("Save")').first();
  console.log("save visible:", await save.isVisible().catch(() => false));
  await save.click({ timeout: 10_000 });
  console.log("clicked save");
  await page.waitForTimeout(8000);

  console.log("captured:", captured.length);
  for (const c of captured) {
    console.log("\nURL:", c.url);
    console.log("BODY:", c.body.slice(0, 3500));
  }
  await page.screenshot({ path: "docs/screenshots/save-result.png" });
} finally {
  page.off("request", onReq);
  await browser.close();
}
