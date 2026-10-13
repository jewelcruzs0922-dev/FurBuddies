import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

async function gql(operationName, query, variables, type = "query") {
  return page.evaluate(async ({ operationName, query, variables, type }) => {
    const el = document.querySelector('[data-serialized-id="server-data"]');
    const csrf = JSON.parse(el.textContent).csrfToken;
    const r = await fetch(`/api/shopify/pet-pantry-test?operation=${operationName}&type=${type}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ operationName, variables: variables || {}, query }),
    });
    return { status: r.status, json: await r.json().catch(() => null) };
  }, { operationName, query, variables, type });
}

const res = await gql("IntrospectProductSetInput", `
  query IntrospectProductSetInput {
    __type(name: "ProductSetInput") {
      name
      inputFields { name type { name kind ofType { name kind } } }
    }
  }
`);
const fields = res.json?.data?.__type?.inputFields ?? [];
console.log("ProductSetInput fields:");
for (const f of fields) console.log(" -", f.name, ":", f.type?.name ?? f.type?.ofType?.name ?? f.type?.kind);

await browser.close();
