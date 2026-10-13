import { connect, BASE } from "./lib-cdp.mjs";

export const THEME_ID = "gid://shopify/OnlineStoreTheme/188756754665";

const READ_QUERY = `query FetchThemeFiles($themeId: ID!, $first: Int, $after: String, $includeBody: Boolean = false, $fileNames: [String!]) {
  onlineStore {
    theme(id: $themeId) {
      id
      files(first: $first, after: $after, filenames: $fileNames) {
        edges {
          node {
            filename
            checksumMd5
            createdAt
            updatedAt
            size
            ...ThemeFileBody @include(if: $includeBody)
          }
          cursor
        }
        userErrors { code filename }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
}

fragment ThemeFileBody on OnlineStoreThemeFile {
  body {
    ... on OnlineStoreThemeFileBodyText { content }
    ... on OnlineStoreThemeFileBodyBase64 { contentBase64 }
    ... on OnlineStoreThemeFileBodyUrl { url }
  }
}`;

export async function withPage(fn) {
  const { browser, page } = await connect();
  try {
    if (!page.url().includes("admin.shopify.com")) {
      await page.goto(`${BASE}/themes`, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForTimeout(3000);
    }
    return await fn(page);
  } finally {
    await browser.close();
  }
}

export async function themeFetch(page, operationName, variables, query) {
  return page.evaluate(
    async ({ operationName, variables, query }) => {
      const el = document.querySelector('[data-serialized-id="server-data"], [id*="server-data"], [data-serialized-id*="server-data"]');
      if (!el) throw new Error("server-data element not found");
      const csrfToken = JSON.parse(el.textContent).csrfToken;
      const r = await fetch(`/api/app_proxy/pet-pantry-test?operation=${operationName}&version=unstable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
          "x-shopify-app-id": "580111",
          "x-shopify-extension-id": "650f1a14fa979ec5c74d063e968411d4-online_store",
          "x-online-store-web": "1",
          "x-shopify-instance-id": "1",
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ operationName, variables, query }),
      });
      const text = await r.text();
      return { status: r.status, text };
    },
    { operationName, variables, query },
  );
}

export async function fetchFiles(page, filenames, { includeBody = true } = {}) {
  const out = [];
  let after = null;
  do {
    const res = await themeFetch(page, "FetchThemeFiles", {
      includeBody,
      first: 200,
      after,
      themeId: THEME_ID,
      ...(filenames ? { fileNames: filenames } : {}),
    }, READ_QUERY);
    if (res.status !== 200) throw new Error(`FetchThemeFiles HTTP ${res.status}: ${res.text.slice(0, 300)}`);
    const json = JSON.parse(res.text);
    if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors).slice(0, 400)}`);
    const conn = json.data.onlineStore.theme.files;
    out.push(...conn.edges.map((e) => e.node));
    after = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
  } while (after);
  return out;
}

const UPSERT_QUERY = `mutation ThemeFilesUpsert($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
  themeFilesUpsert(files: $files, themeId: $themeId) {
    upsertedThemeFiles { checksumMd5 createdAt filename size updatedAt }
    userErrors { field message filename }
  }
}`;

export async function writeFiles(page, files) {
  const res = await themeFetch(page, "ThemeFilesUpsert", {
    themeId: THEME_ID,
    files: files.map((f) => ({ filename: f.filename, body: { type: "TEXT", value: f.content } })),
  }, UPSERT_QUERY);
  if (res.status !== 200) throw new Error(`ThemeFilesUpsert HTTP ${res.status}: ${res.text.slice(0, 500)}`);
  const json = JSON.parse(res.text);
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors).slice(0, 600)}`);
  const errs = json.data?.themeFilesUpsert?.userErrors;
  if (errs?.length) throw new Error(`userErrors: ${JSON.stringify(errs).slice(0, 600)}`);
  return json.data.themeFilesUpsert.upsertedThemeFiles;
}
