import { withPage, fetchFiles } from "./theme-api.mjs";

const files = await withPage((page) => fetchFiles(page, null, { includeBody: false }));
const names = files.map((f) => f.filename);
console.log("total:", names.length);
console.log("--- blocks/ ---");
console.log(names.filter((n) => n.startsWith("blocks/")).join("\n"));
console.log("--- sections/ ---");
console.log(names.filter((n) => n.startsWith("sections/") && n.endsWith(".liquid")).join("\n"));
