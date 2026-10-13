import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  await page.waitForTimeout(8000);
  const f = page.frames().find((fr) => fr.url().includes("code-editor"));
  if (!f) {
    console.log("frames:", page.frames().map((x) => x.url().slice(0, 100)));
    throw new Error("no code-editor frame");
  }
  const info = await f.evaluate(() => ({
    title: document.title,
    bodyLen: document.body.innerText.length,
    text: document.body.innerText.slice(0, 600),
    monaco: !!document.querySelector(".monaco-editor"),
    listItems: [...document.querySelectorAll('[role="treeitem"], [role="option"], li, [class*="file"]')]
      .map((e) => (e.innerText || "").trim().slice(0, 40))
      .filter(Boolean)
      .slice(0, 50),
  }));
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: "docs/screenshots/code-editor.png" });
} finally {
  await browser.close();
}
