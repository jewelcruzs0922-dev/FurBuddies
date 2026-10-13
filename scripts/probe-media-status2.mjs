import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);

async function gql(operationName, query, type = "query") {
  return page.evaluate(async ({ operationName, query, type }) => {
    const el = document.querySelector('[data-serialized-id="server-data"]');
    const csrf = JSON.parse(el.textContent).csrfToken;
    const r = await fetch(`/api/shopify/pet-pantry-test?operation=${operationName}&type=${type}`, {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ operationName, variables: {}, query }),
    });
    return { status: r.status, json: await r.json().catch(() => null) };
  }, { operationName, query, type });
}

const res = await gql("MediaStatus2", `query MediaStatus2 {
  nodes(ids: ["gid://shopify/MediaImage/46330105692393"]) {
    id
    ... on MediaImage { status image { url width height } alt }
  }
}`);
console.log(JSON.stringify(res.json, null, 1).slice(0, 600));

await browser.close();
