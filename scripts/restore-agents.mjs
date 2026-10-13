import { withPage, fetchFiles, writeFiles } from "./theme-api.mjs";
import { readFileSync } from "node:fs";

const ORIGINAL = readFileSync("theme-snapshot/AGENTS.md", "utf8");

await withPage(async (page) => {
  const upserted = await writeFiles(page, [{ filename: "AGENTS.md", content: ORIGINAL }]);
  console.log("upserted:", JSON.stringify(upserted));

  const files = await fetchFiles(page, ["AGENTS.md"], { includeBody: true });
  const content = files[0]?.body?.content ?? "";
  console.log("restored matches original:", content === ORIGINAL, "| len:", content.length, "vs", ORIGINAL.length);
});
