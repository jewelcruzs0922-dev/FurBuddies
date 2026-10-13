import { withPage, fetchFiles } from "./theme-api.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const FILES = [
  "AGENTS.md",
  "templates/index.json",
  "sections/header-group.json",
  "sections/footer-group.json",
  "sections/header.liquid",
  "sections/header-announcements.liquid",
  "sections/hero.liquid",
  "sections/collection-list.liquid",
  "sections/product-list.liquid",
  "sections/media-with-content.liquid",
  "sections/footer.liquid",
  "sections/footer-utilities.liquid",
  "config/settings_data.json",
  "config/settings_schema.json",
];

const OUT = path.resolve("theme-snapshot");
mkdirSync(OUT, { recursive: true });

await withPage(async (page) => {
  const files = await fetchFiles(page, FILES, { includeBody: true });
  for (const f of files) {
    const body = f.body;
    let content = null;
    if (body?.content !== undefined) content = body.content;
    else if (body?.contentBase64 !== undefined) content = Buffer.from(body.contentBase64, "base64").toString("utf8");
    else if (body?.url !== undefined) content = `[binary/url] ${body.url}`;
    if (content === null) { console.log("NO BODY:", f.filename, JSON.stringify(body)); continue; }
    const dest = path.join(OUT, f.filename);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, content, "utf8");
    console.log("saved", f.filename, content.length, "chars");
  }
});
