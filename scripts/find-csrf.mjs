import { connect } from "./lib-cdp.mjs";

const { browser, context, page } = await connect();
try {
  const all = await context.cookies();
  console.log("ALL cookies:", all.map((c) => `${c.name}@${c.domain}${c.httpOnly ? "(H)" : ""}`));

  const found = await page.evaluate(() => {
    const html = document.documentElement.outerHTML;
    const i = html.toLowerCase().indexOf("csrf");
    const hits = [];
    let idx = 0;
    while (idx !== -1 && hits.length < 5) {
      idx = html.toLowerCase().indexOf("csrf", idx);
      if (idx === -1) break;
      hits.push(html.slice(Math.max(0, idx - 80), idx + 120).replace(/\s+/g, " "));
      idx += 5;
    }
    const globals = Object.keys(window).filter((k) => /csrf|token|auth/i.test(k));
    return { hits, globals: globals.slice(0, 20) };
  });
  console.log("html csrf hits:", JSON.stringify(found.hits, null, 1));
  console.log("globals:", found.globals);
} finally {
  await browser.close();
}
