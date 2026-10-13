import { connect, BASE } from "./lib-cdp.mjs";

const ids = ["46329751437545", "46329751470313"];
const { browser, page } = await connect();
try {
  for (const id of ids) {
    await page.goto(`${BASE}/content/files/${id}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(4000);
    const info = await page.evaluate(() => {
      const urls = new Set();
      for (const e of document.querySelectorAll("a[href], input, code, [data-clipboard-text]")) {
        const v = e.getAttribute("href") || e.getAttribute("data-clipboard-text") || e.value || e.textContent || "";
        if (v.includes("cdn.shopify.com")) urls.add(v.trim().slice(0, 200));
      }
      return { urls: [...urls], body: document.body.innerText.slice(0, 500) };
    });
    console.log("== file", id, "==");
    console.log(JSON.stringify(info, null, 1));
  }
} finally {
  await browser.close();
}
