import { chromium } from "playwright";

const CDP_URL = "http://127.0.0.1:9222";
const browser = await chromium.connectOverCDP(CDP_URL);
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("admin.shopify.com")) ?? await context.newPage();

let captured = null;
page.on("request", (req) => {
  const u = req.url();
  if (u.includes("/api/shopify/pet-pantry-test?operation=") && !captured) {
    captured = { url: u, method: req.method(), headers: req.headers(), postData: req.postData() };
  }
});

await page.goto("https://admin.shopify.com/store/pet-pantry-test/collections", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(7000);

console.log("captured:", captured ? JSON.stringify({ url: captured.url, headers: captured.headers }, null, 1) : "none");

// now retry with those exact headers
const result = await page.evaluate(async ({ url, headers }) => {
  const h = { "Content-Type": "application/json", Accept: "application/json" };
  for (const k of ["x-csrf-token", "x-shopify-shop-id", "x-requested-with", "x-shopify-flow-session-id"]) {
    if (headers[k]) h[k] = headers[k];
  }
  const r = await fetch(url, {
    method: "POST", credentials: "same-origin", headers: h,
    body: JSON.stringify({ operationName: "ProbeRead", variables: {}, query: `query ProbeRead { products(first: 3) { nodes { id title } } }` }),
  });
  return { status: r.status, text: (await r.text()).slice(0, 300) };
}, { url: captured?.url, headers: captured?.headers ?? {} });
console.log("retry:", JSON.stringify(result, null, 1));

await browser.close();
