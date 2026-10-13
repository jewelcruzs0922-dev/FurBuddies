import { connect, BASE } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.goto(`${BASE}/content/files`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(5000);
  const hits = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = walker.nextNode())) {
      for (const a of n.attributes || []) {
        if (a.value && (a.value.includes("/s/files/") || a.value.includes("media_image") || a.value.includes("MediaImage"))) {
          out.push({ tag: n.tagName, attr: a.name, value: a.value.slice(0, 180) });
        }
      }
    }
    return out.slice(0, 30);
  });
  console.log(JSON.stringify(hits, null, 1));
} finally {
  await browser.close();
}
