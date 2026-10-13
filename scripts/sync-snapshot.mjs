import { withPage, fetchFiles } from "./theme-api.mjs";
import fs from "fs";

const files = await withPage((page) => fetchFiles(page, ["templates/index.json"]));
fs.writeFileSync("theme-snapshot/templates/index.json", files[0].body.content);
console.log("snapshot synced, size:", files[0].body.content.length);
