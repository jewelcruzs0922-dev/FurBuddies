import { withPage } from "./theme-api.mjs";

await withPage(async (page) => {
  console.log("url:", page.url());
  const info = await page.evaluate(() => {
    const html = document.documentElement.outerHTML;
    const idx = html.toLowerCase().indexOf("csrf");
    const scripts = [...document.querySelectorAll("script[id]")].map((s) => s.id);
    return { snippet: idx > -1 ? html.slice(Math.max(0, idx - 120), idx + 60) : "NO CSRF IN HTML", scriptIds: scripts };
  });
  console.log("scripts:", info.scriptIds);
  console.log("snippet:", info.snippet);
});
