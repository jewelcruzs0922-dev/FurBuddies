import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

async function probe(query) {
  return page.evaluate(async (query) => {
    const el = document.querySelector('[data-serialized-id="server-data"]');
    const csrf = JSON.parse(el.textContent).csrfToken;
    const r = await fetch(`/api/shopify/pet-pantry-test?operation=Probe&type=mutation`, {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ operationName: "Probe", variables: {}, query }),
    });
    return { status: r.status, json: await r.json().catch(() => null) };
  }, query);
}

const names = [
  "stagedUploadsCreate",
  "productCreateMedia",
  "productAppendMedia",
  "productUpdateMedia",
  "productImageCreate",
  "fileCreate",
  "bulkProductCreate",
  "productSet",
  "collectionCreate",
];
for (const n of names) {
  const res = await probe(`mutation P { ${n}(input: {}) { userErrors { message } } }`);
  const j = res.json;
  const msg = j?.errors?.[0]?.message ?? JSON.stringify(j?.data);
  console.log(`${n.padEnd(22)} -> ${msg}`);
}

await browser.close();
