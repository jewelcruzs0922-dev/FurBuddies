import { withPage, fetchFiles } from "./theme-api.mjs";

await withPage(async (page) => {
  const files = await fetchFiles(page, null, { includeBody: false });
  console.log("file count:", files.length);
  for (const f of files) console.log(" ", f.filename, f.contentType, f.body ? `(${f.body.length}b)` : "");
});
