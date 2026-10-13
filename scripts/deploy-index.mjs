import { withPage, writeFiles } from "./theme-api.mjs";
import { connect, BASE } from "./lib-cdp.mjs";
import fs from "fs";

const content = fs.readFileSync("theme-snapshot/templates/index.json", "utf8");
JSON.parse(content.replace(/^\/\*[\s\S]*?\*\/\s*/, ""));

const { browser, page } = await connect();
await page.goto(BASE + "/themes", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);
const result = await writeFiles(page, [{ filename: "templates/index.json", content }]);
console.log("upserted:", JSON.stringify(result));
await browser.close();
