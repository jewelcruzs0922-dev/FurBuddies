import { connect } from "./lib-cdp.mjs";

const { browser, page } = await connect();
try {
  const res = await page.evaluate(async () => {
    const body = {
      operationName: "FetchThemeFiles",
      variables: { includeBody: true, first: 5, themeId: "gid://shopify/OnlineStoreTheme/188756754665", fileNames: ["templates/index.json", "AGENTS.md"] },
      query: `query FetchThemeFiles($themeId: ID!, $first: Int, $after: String, $includeBody: Boolean = false, $fileNames: [String!]) {
        onlineStore {
          theme(id: $themeId) {
            id
            files(first: $first, after: $after, filenames: $fileNames) {
              nodes { filename contentType body }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      }`,
    };
    const r = await fetch("/api/app_proxy/pet-pantry-test?operation=FetchThemeFiles&version=unstable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return { status: r.status, text: (await r.text()).slice(0, 4000) };
  });
  console.log("status:", res.status);
  console.log(res.text);
} finally {
  await browser.close();
}
