import { withPage, writeFiles } from "./theme-api.mjs";
import fs from "fs";

const files = [
  "config/settings_data.json",
  "templates/index.json",
  "sections/header-group.json",
  "sections/footer-group.json",
];

const payload = files.map((filename) => {
  const content = fs.readFileSync("theme-snapshot/" + filename, "utf8");
  const json = content.replace(/^\/\*[\s\S]*?\*\/\s*/, "");
  JSON.parse(json);
  console.log("valid JSON:", filename);
  return { filename, content };
});

const result = await withPage((page) => writeFiles(page, payload));
console.log("upserted:", JSON.stringify(result.map((r) => ({ filename: r.filename, size: r.size, checksumMd5: r.checksumMd5 })), null, 1));
