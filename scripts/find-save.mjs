import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  for (const fr of page.frames()) {
    let info;
    try {
      info = await fr.evaluate(() => {
        const cands = [...document.querySelectorAll("*")].filter((e) => (e.childElementCount === 0 || e.tagName === "BUTTON" || e.getAttribute("role") === "button") && (e.innerText || "").trim() === "Save");
        return cands.map((e) => ({ tag: e.tagName, role: e.getAttribute("role"), cls: (e.className || "").toString().slice(0, 80), disabled: e.disabled || e.getAttribute("aria-disabled"), rect: JSON.stringify(e.getBoundingClientRect()) }));
      });
    } catch (e) { info = [{ err: String(e.message).split("\n")[0] }]; }
    console.log("FRAME", fr.url().slice(0, 80), JSON.stringify(info, null, 1));
  }
} finally {
  await browser.close();
}
