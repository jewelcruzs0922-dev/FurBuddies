import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const IDS = ["gid://shopify/MediaImage/46330105692393", "gid://shopify/MediaImage/46330278478057"];
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);

const res = await page.evaluate(async (ids) => {
  const el = document.querySelector('[data-serialized-id="server-data"]');
  const csrf = JSON.parse(el.textContent).csrfToken;
  const r = await fetch(`/api/shopify/pet-pantry-test?operation=MediaMany&type=query`, {
    method: "POST", credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
    body: JSON.stringify({
      operationName: "MediaMany",
      variables: { ids },
      query: `query MediaMany($ids: [ID!]!) { nodes(ids: $ids) { id ... on MediaImage { status image { url width height } alt } } }`,
    }),
  });
  return (await r.json()).data.nodes;
}, IDS);
console.log(JSON.stringify(res, null, 1));

await browser.close();
