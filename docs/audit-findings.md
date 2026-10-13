# FurBuddies — Final Portfolio Audit & Fixes

_Date: 2026-10-13 (v13). Auditor: AI agent. Draft theme `Copy of Horizon` (188756754665)._

Scope: audit the draft theme, fix confirmed issues, verify. No redesign, no palette/theme change, no publishing.

---

## 1. Summary
The draft theme is **structurally sound and portfolio-ready**. Three real, evidence-backed issues were found and fixed (one accessibility contrast failure, one performance/attribute bug in the hero, and a reduced-motion gap). Everything else checked out: valid JSON/schemas, no fake review structured data, working cart with checkout disabled, no mobile overflow, and correct image alt/lazy handling. Two low-severity items (homepage meta description, sparse Contact page copy) were left for approval because they require content decisions.

Verdict: **ready for portfolio review** after (optionally) the two content items below.

---

## 2. Issues found

| # | Sev | Area / file | Evidence | Impact |
|---|---|---|---|---|
| 1 | **High** | Benefits bar label color — `sections/fb-benefits.liquid` | Computed label `rgb(169,138,94)` (#a98a5e) on `rgb(250,247,242)` = **3.03:1** | Fails WCAG AA 4.5:1 for normal text |
| 2 | **Med** | Hero image attributes — `sections/fb-hero.liquid` | Rendered `.fb-hero__img` had **no `loading` / `fetchpriority`** even though the source set them; all 3 slides loaded eagerly & unprioritized | LCP image not prioritized; slides 2–3 loaded eagerly (wasted bytes). Cause: a `| default:` filter inside the `image_tag:` `alt:` argument silently dropped every argument after it (`loading`, `fetchpriority`) |
| 3 | **Med** | Reduced motion — `sections/fb-hero.liquid` | JS autoplay interval ran regardless of `prefers-reduced-motion`; only the CSS transition was disabled (measured: slide advanced under reduce) | Motion-sensitive users still got a changing hero |
| 4 | Low | Hero image `alt` | `alt: image.alt | default: heading` duplicated the slide heading for AT when image alt was blank | Duplicate screen-reader announcement risk |
| 5 | Low | Homepage SEO | `meta[name=description]` is **null** on `/` (product/collection pages have auto ones) | Minor SEO gap |
| 6 | Low | Contact page | `/pages/contact` main content is form-only (≈40 chars; no intro/context) | Sparse, but functional |
| 7 | Info | `sections/slideshow.liquid` step + `assets/slideshow.js` `parseFloat` | Leftover tweaks; product-card galleries use `slideshow.js` but not autoplay | Harmless; left unchanged (no confirmed bug) |

**Explicitly checked and OK:** product & home JSON-LD contains **no `aggregateRating`/`review`** (fictional ratings are on-page only); headings have exactly one `<h1>`; landmarks present (header/main/footer); search + newsletter inputs have accessible names; hero dots are labelled buttons; 12/12 hover overlays are decorative `alt=""` and lazy; no missing `alt` attributes; canonical present; storefront probe data (`FUR-PROBE-BARE`, `FUR-PROBE-TEMP`) returns **404** (not visitor-visible).

---

## 3. Fixes made

1. **Benefits label contrast** — `sections/fb-benefits.liquid` (CSS fallback + schema default) and `templates/index.json` setting.
   - `#a98a5e` → **`#8a6a3a`** (4.68:1, lightest warm brown that passes AA). Background unchanged.
2. **Hero image attributes/alt** — `sections/fb-hero.liquid`.
   - Precompute `img_alt` in Liquid and pass `alt: img_alt` (removed the `| default:` filter that broke argument parsing).
   - Result: slide 1 `loading="eager" fetchpriority="high"`; slides 2–3 `loading="lazy" fetchpriority="low"`. Alt = image alt (no heading duplication).
3. **Reduced-motion autoplay** — `sections/fb-hero.liquid` JS.
   - Added `matchMedia('(prefers-reduced-motion: reduce)')`; `start()` returns early when reduce is on, plus a `change` listener to start/stop. Dots still work; no arrows/play-pause added.

Files changed: `sections/fb-hero.liquid`, `sections/fb-benefits.liquid`, `templates/index.json` (draft theme only).

---

## 4. Verification performed

- **Theme state (Composio `SHOPIFY_GET_THEMES`):** live `Horizon` id `188753510633` role=`main`, `updated_at` 2026-10-11 (untouched); `Copy of Horizon` id `188756754665` role=`unpublished`, updated 2026-10-13. Shop `password_enabled=true`.
- **Contrast (computed, live):** benefits label now `rgb(138,106,58)` → **4.68:1** (was 3.03:1).
- **Hero attributes (live):** slide1 `eager/high`; slides 2–3 `lazy/low`; container height is fixed → layout reserved (no CLS).
- **Reduced motion (live, Playwright `emulateMedia`):** reduce → hero **did not** advance over 5.2s (stayed slide 0); no-preference (control) → advanced 0→1. 
- **JSON/schema validation:** `fb-hero`, `fb-benefits`, `fb-collection-banner` schemas parse as valid JSON; `templates/index.json`, `templates/product.json`, `templates/collection.json`, `config/settings_data.json` parse OK.
- **Structured data:** home JSON-LD = Organization only; product JSON-LD = Product/Brand/Offer, **no aggregateRating/review**.
- **Cart/checkout (live):** added product → cart badge updated, drawer opened, total recalculated ($102.00); checkout button reads **"Checkout disabled (demo)"**, `disabled`, `aria-disabled="true"`. No order created.
- **Filters/sort (live):** `/collections/all` and `/collections/dogs` render facets + sort; 24 and 12 products.
- **Collection banner (live):** `.fb-collection-banner__img` alt="Dogs", `loading=eager`, `fetchpriority=high`, `sizes=100vw`.
- **Mobile (390px):** document `scrollWidth − clientWidth = 0` (no horizontal overflow).
- **Screenshots:** `docs/screenshots/audit-v13-mobile-home.png`, `docs/screenshots/audit-v13-benefits-contrast.png`.
- **Theme Check:** **not available** — no `shopify` CLI and no Ruby installed (`node v26.8.1` present). Cannot run `shopify theme check`; schema/JSON were validated manually instead. Lighthouse/axe were not run (no tooling available in this environment); checks above were done via DOM/computed-style inspection.

---

## 5. Visual changes
- **Benefits bar labels** moved from a lighter tan to a **darker warm brown** (`#8a6a3a`). This is the only intentional visible change; it is the minimum needed for WCAG AA and preserves the cream/earth-tone look. Circles, icons, and background are unchanged.
- No other visual changes. Hero, card hover fade, section order, palette, fonts, and imagery are unchanged.

---

## 6. Not fixed / needs approval
1. **Homepage meta description** — missing. Adding copy is a content decision; recommend e.g. a short honest line describing the FurBuddies portfolio demo. (Not invented here.)
2. **Contact page content** — form-only. Recommend adding a short honest note such as "Demonstration storefront — this form is illustrative and not monitored." Requires editing the page body.
3. **Rotating announcement bar** — theme-controlled; could not confirm it honors `prefers-reduced-motion` without editing stock theme JS (out of safe scope). Recommend verifying and, if needed, gating its autoplay.
4. **Shopify Theme Check** — run `shopify theme check` in a proper toolchain (not installed here).
5. **Lighthouse/axe** — run against the preview (mobile + desktop) to confirm the contrast fix and catch anything DOM inspection missed.
6. **Demo data** (`FUR-PROBE-BARE` product, `FUR-PROBE-TEMP` collection) — not visitor-visible (404). Left in place; deletion needs explicit approval.
7. **Note:** the audit added one item to this browser session's demo cart (2→3). Session-only; no order was created.

---

## 7. Safety confirmation
- **Live theme untouched:** `Horizon` (188753510633) role `main`, last updated 2026-10-11; all writes targeted the draft.
- **Draft remains unpublished** (`role: unpublished`) and the **storefront is password-protected** (`password_enabled: true`).
- **Checkout remains disabled** (button disabled + "Checkout disabled (demo)"), accelerated checkout shows a demo notice, **0 orders**.
- No apps added, no dependencies changed, no analytics, no payment configuration.

---

## 8. Recommended next steps
1. Approve + add a homepage meta description and a short Contact-page note (items 6.1–6.2).
2. Run `shopify theme check` and Lighthouse/axe in a proper toolchain against the preview; confirm the contrast fix.
3. Verify the announcement bar's reduced-motion behavior; gate its autoplay if it doesn't respect it.
4. Optionally delete the two probe artifacts after approval.
5. Re-capture the standard portfolio screenshots (home desktop/mobile, collection, product) post-fix.
