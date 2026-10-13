import { withPage, fetchFiles } from "./theme-api.mjs";
import fs from "fs";
import path from "path";

const wanted = [
  "blocks/_media-without-appearance.liquid",
  "blocks/_collection-card.liquid",
  "blocks/_collection-card-image.liquid",
  "blocks/collection-card.liquid",
  "blocks/menu.liquid",
  "blocks/image.liquid",
  "blocks/text.liquid",
  "blocks/button.liquid",
  "sections/collection-links.liquid",
];

const files = await withPage((page) => fetchFiles(page, wanted));
fs.mkdirSync("theme-snapshot/blocks", { recursive: true });
for (const f of files) {
  const out = "theme-snapshot/" + f.filename;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, f.body.content);
  console.log("saved", f.filename, f.size);
}

for (const f of files) {
  const t = f.body.content;
  const m = t.match(/\{% schema %\}([\s\S]*?)\{% endschema %\}/);
  if (!m) { console.log("==", f.filename, "no schema"); continue; }
  const s = JSON.parse(m[1]);
  console.log("==", f.filename, "| name:", s.name);
  console.log("  settings:", (s.settings || []).map((x) => x.id + "(" + x.type + (x.options ? ":" + x.options.map((o) => o.value).join("|") : "") + ")").join(", "));
  console.log("  blocks:", JSON.stringify((s.blocks || []).map((b) => b.type)));
  if (s.presets) console.log("  presets:", JSON.stringify(s.presets).slice(0, 600));
}
