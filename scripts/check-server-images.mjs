import { withPage, fetchFiles } from "./theme-api.mjs";
import { connect, BASE } from "./lib-cdp.mjs";

const { browser, page } = await connect();
await page.goto(BASE + "/themes", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);

const files = await fetchFiles(page, ["templates/index.json"]);
const j = JSON.parse(files[0].body.content.replace(/^\/\*[\s\S]*?\*\/\s*/, ""));
console.log("server image_1:", j.sections.hero_jVaWmY.settings.image_1);
console.log("server editorial image:", j.sections.media_editorial.blocks.media.settings.image);
await browser.close();
