import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROFILE_DIR = process.env.CHROME_PROFILE_DIR ?? path.join(ROOT, ".chrome-profile");
const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  path.join(process.env.LOCALAPPDATA ?? "", "Google", "Chrome", "Application", "chrome.exe"),
].filter(Boolean);

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH to your chrome.exe.");
  return found;
}

async function cdpUp() {
  try {
    const res = await fetch(`${CDP_URL}/json/version`);
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureChrome() {
  if (await cdpUp()) return;
  mkdirSync(PROFILE_DIR, { recursive: true });
  const port = new URL(CDP_URL).port || "9222";
  console.log(`Launching Chrome (profile: ${PROFILE_DIR}, CDP: ${CDP_URL})`);
  const child = spawn(
    findChrome(),
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${PROFILE_DIR}`,
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { detached: true, stdio: "ignore" },
  );
  child.unref();
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (await cdpUp()) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Chrome did not expose CDP at ${CDP_URL} within 20s.`);
}

const TARGET_URL = process.argv[2];

await ensureChrome();
const browser = await chromium.connectOverCDP(CDP_URL);
try {
  const context = browser.contexts()[0];
  let page = TARGET_URL
    ? context.pages().find((p) => p.url().startsWith(TARGET_URL.replace(/\/$/, "")))
    : context.pages()[0];
  if (!page) {
    page = await context.newPage();
    if (TARGET_URL) await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  }
  await page.waitForTimeout(6000);
  console.log("URL:", page.url());
  console.log("TITLE:", await page.title());
  console.log("BODY:\n", (await page.locator("body").innerText().catch(() => "")).slice(0, 1000));
  const shot = path.join(os.tmpdir(), `pet-observe-${Date.now()}.png`);
  await page.screenshot({ path: shot }).catch(() => {});
  console.log("shot:", shot);
} finally {
  await browser.close();
}
