import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);

const res = await page.evaluate(async () => {
  const el = document.querySelector('[data-serialized-id="server-data"]');
  const csrf = JSON.parse(el.textContent).csrfToken;
  const r = await fetch(`/api/shopify/pet-pantry-test?operation=IntrospectVariant&type=query`, {
    method: "POST", credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
    body: JSON.stringify({
      operationName: "IntrospectVariant",
      variables: {},
      query: `query IntrospectVariant { __type(name: "ProductVariantInput") { inputFields { name type { name kind ofType { name } } } } }`,
    }),
  });
  return (await r.json()).data.__type?.inputFields?.map((f) => f.name) ?? [];
});
console.log("ProductVariantInput fields:", res.join(", "));

await browser.close();
