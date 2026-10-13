import { connect, BASE } from "./lib-cdp.mjs";

const files = [
  "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/hero-frenchie.jpg",
  "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/editorial-dog.jpg",
];

const { browser, page } = await connect();
try {
  await page.goto(`${BASE}/content/files`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(5000);

  await page.setInputFiles("input[type=file]", files);
  console.log("files set, waiting for upload...");
  await page.waitForTimeout(12000);

  const after = await page.evaluate(() => document.body.innerText.slice(0, 1200));
  console.log("BODY:", after);

  // try to find copy-link buttons / rows mentioning our file names
  const links = await page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll("a[href], button")) {
      const t = (a.textContent || "").trim();
      const h = a.getAttribute("href") || "";
      if (/frenchie|editorial-dog/i.test(t + " " + h)) out.push({ tag: a.tagName, text: t.slice(0, 60), href: h.slice(0, 120) });
    }
    return out.slice(0, 20);
  });
  console.log("MATCHES:", JSON.stringify(links, null, 1));
} finally {
  await browser.close();
}
