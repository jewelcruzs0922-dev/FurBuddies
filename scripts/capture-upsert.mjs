import { connect } from "./lib-cdp.mjs";
import { withPage, fetchFiles, themeFetch } from "./theme-api.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const ORIGINAL = readFileSync("theme-snapshot/AGENTS.md", "utf8");
const { browser, page } = await connect();

let fullBody = null;
const onReq = (r) => {
  if (r.url().includes("operation=ThemeFilesUpsert")) fullBody = r.postData() || "";
};
page.on("request", onReq);

const waitFrame = async (ms = 40_000) => {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const f = page.frames().find((fr) => fr.url().includes("code-editor"));
    if (f) {
      try { await f.waitForSelector("body", { timeout: 2000 }); return f; } catch {}
    }
    await page.waitForTimeout(1000);
  }
  return null;
};

try {
  let f = await waitFrame();
  if (!f) throw new Error("no editor frame");

  // ensure AGENTS.md open
  try {
    await f.locator("text=AGENTS.md").first().dblclick({ timeout: 6000 });
  } catch {}
  await page.waitForTimeout(2500);

  // make a trivial dirty edit
  f = await waitFrame();
  await f.locator(".monaco-editor").first().click({ timeout: 8000 });
  await page.keyboard.press("Control+End");
  await page.keyboard.type("x", { delay: 5 });
  await page.waitForTimeout(1500);

  const save = f.locator('a.action-label:has-text("Save"), [role="button"]:has-text("Save")').first();
  await save.click({ timeout: 10_000 });
  await page.waitForTimeout(8000);

  if (!fullBody) throw new Error("no upsert captured");
  writeFileSync("scripts/captured-upsert.json", fullBody, "utf8");
  console.log("full upsert captured:", fullBody.length, "chars");
} finally {
  page.off("request", onReq);
  await browser.close();
}

// --- restore AGENTS.md to original via API ---
const parsed = JSON.parse(fullBody);
console.log("query head:", parsed.query.slice(0, 200));

await withPage(async (page2) => {
  const res = await themeFetch(page2, "ThemeFilesUpsert", {
    themeId: "gid://shopify/OnlineStoreTheme/188756754665",
    files: [{ filename: "AGENTS.md", body: { value: ORIGINAL } }],
  }, parsed.query);
  console.log("restore status:", res.status);
  console.log("restore resp:", res.text.slice(0, 600));

  // verify
  const files = await fetchFiles(page2, ["AGENTS.md"], { includeBody: true });
  const content = files[0]?.body?.content ?? "";
  console.log("restored matches original:", content === ORIGINAL, "| len:", content.length, "vs", ORIGINAL.length);
  if (content !== ORIGINAL) {
    const i = [...content].findIndex((c, j) => c !== ORIGINAL[j]);
    console.log("first diff at", i, JSON.stringify(content.slice(i - 40, i + 40)), "vs", JSON.stringify(ORIGINAL.slice(i - 40, i + 40)));
  }
});
