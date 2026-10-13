import { connect, BASE } from "./lib-cdp.mjs";
import { THEME_ID } from "./theme-api.mjs";
import fs from "fs";

const UPSERT_QUERY = `mutation ThemeFilesUpsert($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
  themeFilesUpsert(files: $files, themeId: $themeId) {
    upsertedThemeFiles { checksumMd5 filename size }
    userErrors { field message filename }
  }
}`;

const images = [
  { url: "https://burst.shopifycdn.com/photos/french-bulldog-gets-cozy.jpg?width=1800&format=pjpg&exif=0&iptc=0", filename: "assets/hero-frenchie.jpg" },
  { url: "https://burst.shopifycdn.com/photos/happy-dog-gets-pets.jpg?width=1400&format=pjpg&exif=0&iptc=0", filename: "assets/editorial-dog.jpg" },
];

const files = [];
for (const img of images) {
  const res = await fetch(img.url);
  if (!res.ok) throw new Error(`download failed ${res.status}: ${img.url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  console.log(img.filename, buf.length, "bytes, type:", res.headers.get("content-type"));
  files.push({ filename: img.filename, body: { type: "BASE64", value: buf.toString("base64") } });
}

const { browser, page } = await connect();
await page.goto(BASE + "/themes", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);
const out = await page.evaluate(
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
    return { status: r.status, text: await r.text() };
  },
  { operationName: "ThemeFilesUpsert", variables: { themeId: THEME_ID, files }, query: UPSERT_QUERY },
);
console.log("status:", out.status);
const json = JSON.parse(out.text);
if (json.errors) console.log("GraphQL errors:", JSON.stringify(json.errors).slice(0, 800));
else console.log("result:", JSON.stringify(json.data?.themeFilesUpsert).slice(0, 800));
await browser.close();
