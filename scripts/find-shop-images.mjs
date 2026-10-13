import { withPage, fetchFiles } from "./theme-api.mjs";

const files = await withPage((page) => fetchFiles(page, null, { includeBody: true }));
const hits = [];
for (const f of files) {
  const c = f.body?.content || "";
  if (typeof c === "string" && c.includes("shopify://shop_images/")) {
    const matches = c.match(/shopify:\/\/shop_images\/[^\"]+/g) || [];
    hits.push(f.filename + " -> " + [...new Set(matches)].slice(0, 3).join(", "));
  }
}
console.log(hits.slice(0, 25).join("\n") || "NO HITS");
