import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.goto("https://pet-pantry-test.myshopify.com/admin/themes", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(5000);
  const info = await page.evaluate(() => {
    const links = [...document.querySelectorAll("a[href*='preview'], a[href*='theme']")];
    return {
      title: document.title,
      url: location.href,
      bodySnippet: document.body?.innerText?.slice(0, 300),
      themeLinks: links.slice(0, 25).map((a) => a.href),
    };
  });
  console.log(JSON.stringify(info, null, 1));
} finally {
  await browser.close();
}
