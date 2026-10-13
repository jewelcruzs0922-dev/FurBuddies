import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const BASE = "https://admin.shopify.com/store/pet-pantry-test";
const OUT = path.join(os.tmpdir(), "furbuddies-audit");

const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

  // --- checkout + plan settings (read-only) ---
  for (const [name, url] of [
    ["checkout", `${BASE}/settings/checkout`],
    ["plan", `${BASE}/settings/plan`],
  ]) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(6000);
    const text = (await page.locator("body").innerText().catch(() => "")).trim();
    writeFileSync(path.join(OUT, `${name}.txt`), `URL: ${page.url()}\n\n${text}`);
    console.log(`\n=== ${name}`);
    console.log(text.slice(0, 600));
  }

  // --- theme edit code (read-only peek) ---
  await page.goto(`${BASE}/themes`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(10_000);
  // open theme actions menu via the ... button near Edit theme (try text piercing)
  const more = page.getByText("Edit theme", { exact: true }).first();
  // the ... is an icon button; try finding buttons near it in same container via evaluate click
  const clicked = await page.evaluate(() => {
    const all = [...document.querySelectorAll("button")];
    const edit = all.find((b) => (b.innerText || "").includes("Edit theme"));
    if (!edit) return "no-edit-theme";
    const container = edit.closest("div");
    const dots = [...(container?.querySelectorAll("button") ?? [])].find(
      (b) => b !== edit && !(b.innerText || "").trim() && (b.getAttribute("aria-label") || "").match(/more|action|menu/i) === null,
    );
    // fallback: any button with svg-only content in the card area
    const btns = [...document.querySelectorAll("button")].filter((b) => !(b.innerText || "").trim());
    const target = dots ?? btns[btns.length - 1];
    if (target) {
      target.click();
      return "clicked-unnamed";
    }
    return "none";
  });
  console.log("\nmenu click:", clicked);
  await page.waitForTimeout(2500);
  const editCode = page.getByText("Edit code", { exact: true }).first();
  console.log("Edit code visible:", await editCode.isVisible().catch(() => false));
  if (await editCode.isVisible().catch(() => false)) {
    await editCode.click();
    await page.waitForTimeout(10_000);
    const tree = await page.evaluate(() =>
      [...document.querySelectorAll("[role=treeitem], li, .tree-item, a")]
        .map((e) => (e.innerText || "").trim())
        .filter((t) => /\.(liquid|json|css|js|svg)$/.test(t) || /^(sections|templates|snippets|assets|config|locales)$/.test(t))
        .slice(0, 60),
    );
    console.log("FILE TREE:", JSON.stringify(tree, null, 1));
    writeFileSync(path.join(OUT, "theme-files.txt"), JSON.stringify(tree, null, 1));
    await page.screenshot({ path: path.join(OUT, "edit-code.png") }).catch(() => {});
  }
} finally {
  await browser.close();
}
