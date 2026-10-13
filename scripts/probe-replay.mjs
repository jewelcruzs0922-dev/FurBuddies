import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

await page.goto("https://admin.shopify.com/store/pet-pantry-test/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

// replay the real captured GET with csrf token added, to see if token is accepted
const out = await page.evaluate(async () => {
  const el = document.querySelector('[data-serialized-id="server-data"]');
  const csrf = JSON.parse(el.textContent).csrfToken;
  const realUrl = "/api/operations/45403df80b7c708f0b85b5231fcd30be5e6d7e22fb6b612e2b282c5f2e944a3e/Betas/shopify/pet-pantry-test?variables=%7B%7D";
  const res = {};
  res.noToken = (await fetch(realUrl, { credentials: "same-origin" })).status;
  res.withToken = (await fetch(realUrl, { credentials: "same-origin", headers: { "x-csrf-token": csrf } })).status;
  // POST with real hash + csrf, empty body
  const postBody = { operationName: "Betas", variables: {}, extensions: { client_context: { page_view_token: "x", client_route_handle: "products:list", client_pathname: "/store/pet-pantry-test/products" } } };
  const r = await fetch("/api/operations/45403df80b7c708f0b85b5231fcd30be5e6d7e22fb6b612e2b282c5f2e944a3e/Betas/shopify/pet-pantry-test", {
    method: "POST", credentials: "same-origin",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify(postBody),
  });
  res.postStatus = r.status;
  res.postBody = (await r.text()).slice(0, 300);
  return res;
});
console.log(JSON.stringify(out, null, 1));

await browser.close();
