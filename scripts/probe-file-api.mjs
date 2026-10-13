import { chromium } from "playwright";
import { CDP_URL, connect, waitForFrame } from "./lib-cdp.mjs";

const browser = await chromium.connectOverCDP(CDP_URL);
const page = (await browser.contexts()[0].pages()).find((p) => p.url().includes("admin.shopify.com"));

const reqs = [];
const onResponse = async (r) => {
  const u = r.url();
  if (/graphql|\.json|theme|file/i.test(u) && !/\.(png|jpg|jpeg|gif|svg|css|woff2?|ico)/.test(u)) {
    let postData = "";
    try { postData = (r.request().postData() || "").slice(0, 400); } catch {}
    reqs.push({ status: r.status(), method: r.request().method(), url: u.slice(0, 250), postData });
  }
};
page.on("response", onResponse);

try {
  // ensure code editor frame exists (up to 60s)
  let frame = page.frames().find((f) => f.url().includes("code-editor"));
  if (!frame) {
    console.log("looking for Edit code link...");
    for (let i = 0; i < 12 && !frame; i++) {
      const link = page.locator('a:has-text("Edit code"), button:has-text("Edit code")').first();
      if (await link.isVisible().catch(() => false)) {
        await link.click().catch(() => {});
        console.log("clicked Edit code");
      }
      await page.waitForTimeout(5000);
      frame = page.frames().find((f) => f.url().includes("code-editor"));
    }
  }
  if (!frame) {
    console.log("frames now:", page.frames().map((f) => f.url().slice(0, 90)));
    throw new Error("no code-editor frame");
  }
  console.log("editor frame ready:", frame.url().slice(0, 100));
  await page.waitForTimeout(3000);

  // open templates/index.json via tree
  const tpl = frame.locator('text=templates').first();
  await tpl.dblclick({ timeout: 8000 }).catch((e) => console.log("tpl err:", e.message.slice(0, 100)));
  await page.waitForTimeout(2000);
  const idx = frame.locator('text=index.json').first();
  console.log("index.json visible:", await idx.isVisible().catch(() => false));
  await idx.dblclick({ timeout: 8000 }).catch((e) => console.log("idx err:", e.message.slice(0, 100)));
  await page.waitForTimeout(4000);

  const text = await frame.evaluate(() => [...document.querySelectorAll(".view-line")].map((e) => e.innerText).join("\n"));
  console.log("=== index.json visible lines ===");
  console.log(text.slice(0, 3000));

  console.log("\n=== NETWORK ===");
  for (const r of reqs) console.log(r.status, r.method, r.url, r.postData ? "| " + r.postData.replace(/\n/g, " ") : "");

  await page.screenshot({ path: "docs/screenshots/index-json.png" });
} finally {
  page.off("response", onResponse);
  await browser.close();
}
