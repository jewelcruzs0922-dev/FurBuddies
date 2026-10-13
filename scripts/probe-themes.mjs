import { chromium } from "playwright";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const BASE = "https://admin.shopify.com/store/pet-pantry-test";

const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();
  await page.goto(`${BASE}/themes`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(10_000);

  // dump interactive elements from main frame
  for (const [i, frame] of [page, ...page.frames()].entries()) {
    const els = await frame
      .evaluate(() =>
        [...document.querySelectorAll('button, a[href], [role="button"]')]
          .map((e) => ({
            tag: e.tagName.toLowerCase(),
            txt: (e.innerText || "").trim().slice(0, 40),
            aria: e.getAttribute("aria-label") || "",
            title: e.getAttribute("title") || "",
          }))
          .filter((x) => x.txt || x.aria || x.title)
          .slice(0, 40),
      )
      .catch(() => []);
    if (els.length) {
      console.log(`\n--- frame ${i}: ${frame.url().slice(0, 90)}`);
      for (const e of els) console.log(` ${e.tag} | "${e.txt}" | aria="${e.aria}" | title="${e.title}"`);
    }
  }

  // also probe shadow DOM from main frame
  const shadowHits = await page.evaluate(() => {
    const out = [];
    const walk = (root) => {
      for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) {
          for (const s of el.shadowRoot.querySelectorAll("button, a[href]")) {
            out.push({
              txt: (s.innerText || "").trim().slice(0, 40),
              aria: s.getAttribute("aria-label") || "",
              cls: (s.className || "").toString().slice(0, 50),
            });
          }
          walk(el.shadowRoot);
        }
      }
    };
    walk(document);
    return out.slice(0, 40);
  });
  console.log("\n--- shadow DOM controls:");
  for (const s of shadowHits) console.log(` btn | "${s.txt}" | aria="${s.aria}" | cls=${s.cls}`);
} finally {
  await browser.close();
}
