# Phase 1 — Read-only Audit Report

**Store:** Pet Pantry Test · `pet-pantry-test.myshopify.com` · admin `admin.shopify.com/store/pet-pantry-test`
**Date:** 2026-10-11 · **Mode:** read-only (no store changes made)
**Screenshots:** `docs/screenshots/` · **Raw dumps:** `%TEMP%\furbuddies-audit\`

---

## 1. Current architecture

| Area | Finding |
|---|---|
| Store type | Partner development store, **Basic Development plan**, created 2026-10-11, USD, United States market, English |
| Theme | **Horizon** (Theme Store id 2481, schema version **4.3.0**, theme id 188753510633), role `main` = **live/published** |
| Theme architecture | **Shopify Online Store 2.0** (JSON templates + sections; confirmed via `Shopify.theme` storefront payload and Horizon's Theme Store listing) |
| Theme files | Horizon structure: `sections/`, `templates/*.json`, `snippets/`, `assets/`, `config/`, `locales/`. **Limitation:** the admin Edit-code file tree renders in a cross-origin iframe I could not scrape read-only; file list is inferred from Horizon's known OS 2.0 layout, not directly enumerated |
| Theme inventory | **One theme only** (the live one) — no duplicate/backup theme exists |
| Products / variants | **0 products**, no variants |
| Collections | Only default auto-collection **"All"** (0 products) |
| Apps / integrations | **None installed** |
| Navigation | Default main menu: Home · Catalog (`/collections/all`) · Contact; announcement bar "Welcome to our store"; footer: newsletter signup + "Terms and Policies" + "Powered by Shopify" |
| Payments | **No live payment provider active.** Admin suggests Shopify Payments test-provider setup (dev store); nothing activated — real payments impossible |
| Checkout | Default configuration "Pet Pantry Test configuration" (Active), standard form fields (full name, address). Read-only top-of-page inspection only |
| Storefront access | **Password protection ON.** Logged-out, every route (`/`, `/collections/*`, `/search`, `/cart`, `/checkout`) redirects to `/password` |
| Customer accounts | Cart page shows a "Have an account? Log in" link (theme default). Account settings not modified or tested (sensitive — out of audit write scope) |
| Users | Managed at Partner-org level (owner: Jewel Cruz); `/settings/users` 404s in store admin |
| Domains | Only `pet-pantry-test.myshopify.com` (no custom domain — no cost exposure) |

### Page-by-page behavior (observed)

- **Home** (`sf-home-desktop.png` / `sf-home-mobile.png`): Horizon default — announcement bar, logo text "Pet Pantry Test", nav, hero "Browse our latest products" + "Shop all", a grid of **8 placeholder cards ("Product title" $19.99)** — theme demo placeholders shown because the store has no products — newsletter, footer.
- **Collection** (`/collections/all`): "0 items", sort + filter UI present, empty state "No products found."
- **Search** (`/search?q=dog`): functional; correct empty state "No results found for 'dog'."
- **Cart** (`/cart`): "Your cart is empty", "Continue shopping", "You may also like" placeholder recommendations, customer-login prompt.
- **Logged-out** (`storefront-lockedout.png`): password page on every route including `/checkout`.
- **Themes page**: Horizon card with Edit theme / Preview store; "Discover themes" + Theme Store link.
- **Console errors:** none observed on audited pages (admin themes page and storefront).

## 2. Existing functionality worth preserving

1. **Password protection** — strongest safety layer; blocks all public routes including `/checkout`.
2. **No active payment provider** — even past the password, no real payment path exists.
3. **Horizon OS 2.0 theme** — modern, section-based, officially supported; customization via theme editor + sections is the intended path (low risk, no theme replacement needed).
4. **Default navigation skeleton** (Home/Catalog/Contact) and footer/newsletter structure — sensible base for FurBuddies.
5. **Working search, empty states, filter/sort UI** on collections — native Shopify behavior, no fixes needed.
6. **Admin "Preview store" token flow** — password-free owner preview for reviewing changes before publish.
7. **Clean slate** — no apps, no orders, no customer data, no third-party conflicts.

## 3. Identified risks and missing features

**Risks**
- **No backup theme.** Any theme edit touches the only copy. Mitigation: duplicate before editing (needs approval — see §7).
- **Brand mismatch.** Store name/logo/title say "Pet Pantry Test" everywhere; must become **FurBuddies** (settings change — needs approval).
- **Misleading placeholders.** Home page shows 8 fake "$19.99 Product title" cards from the theme's demo state; confusing until Phase 3 catalog exists.
- **Single automation path.** No API connection exists for *this* store (Composio's Shopify link is bound to ComputePH). All future writes happen via admin UI automation — slower, must stay surgical.

**Missing (expected — clean slate)**
- Products, collections, product imagery, filters configured, editorial content, brand assets, footer/demo-info content.

**Potential conflicts / a11y (early observations)**
- Cart page customer-login link could invite real account flows — brief forbids creating accounts; link itself is harmless behind the password page. Changing customer-account settings is sensitive → would require separate approval (proposed: leave as-is unless it interferes with the demo).
- No accessibility deep-audit done yet (focus states, contrast, keyboard nav) — deferred to Phase 5 per brief.

**Limitations (stated, not guessed)**
- Theme file tree not directly enumerable (cross-origin iframe).
- Settings → Checkout inspected only at top level (no interaction, scroll-dependent content not fully captured).
- Settings → Users unavailable in-store (org-level).
- Storefront pricing/checkout behavior with items in cart **cannot be tested yet** (0 products) — will be tested in Phase 4 as the brief directs.
- Mobile appearance checked at 390×844 screenshots only; tablet widths deferred to Phase 5.

## 4. Recommended implementation strategy

1. **Phase 2 (visual design) on a duplicate theme.** Duplicate Horizon (backup) → edit the **unpublished** copy → review via admin "Preview store" → request publish approval only when you've signed off. Complies with brief rule 6 and preserves the live theme untouched.
2. **Rename** store display name to **FurBuddies** (myshopify domain stays). Apply brand to: logo text, page titles, announcement bar, footer copyright.
3. **Stay inside Horizon's OS 2.0 system:** build homepage sections (hero, dog/cat categories, featured products, popular categories, editorial section, recommendations) with theme-editor section ordering + `templates/index.json`, adding custom sections/snippets/CSS only where Horizon can't express the design. This keeps the design consistent with the theme (brief: "Keep the design consistent with the existing theme architecture").
4. **Phase 3 catalog via Shopify native CSV import** (Products → Import): one generated CSV creates 20–30 demo products atomically with consistent fields; smart collections created via admin UI; product imagery from a license-safe placeholder source (exact source proposed with the Phase 3 plan); "demo content" disclosure added to descriptions/footer.
5. **Phase 4 cart safeguards layered:** (a) storefront password stays ON (primary barrier), (b) payment provider stays OFF, (c) theme-level demo notice replaces/augments checkout button in cart — no store-wide checkout setting changes. Direct-route tests (`/checkout`, cart drawer, form posts) verify no bypass.
6. **All verification via existing tooling:** Playwright over CDP in *background* tabs, desktop 1440×900 + mobile 390×844 screenshots, incognito context for logged-out checks, console-error scans.

## 5. Proposed files and settings to change (future, approval-gated)

**Settings (admin):**
- General → Store name: Pet Pantry Test → FurBuddies *(approval requested in §7)*
- Navigation → main menu items (rework to FurBuddies IA in Phase 2)
- Online Store → theme: **publish duplicate after approval**

**Theme files (on the duplicate only):**
- `templates/index.json` — homepage section order/config
- `sections/*.liquid` — new/reworked homepage sections (hero, categories, editorial, footer tweaks)
- `snippets/*.liquid` — product card, demo badge/notice helpers
- `assets/*.css`, `assets/*.js` — accent styling, interaction feedback (minimal)
- `config/settings_schema.json` / theme-editor settings — colors, logo text, typography

**Explicitly NOT changing without item-specific approval:** payments, checkout config, domains/DNS, publication settings, customer-account settings, billing/plans, apps, users, taxes/shipping.

## 6. Test plan

| Layer | Checks |
|---|---|
| **Gate screenshots** | Every phase: desktop 1440×900 + mobile 390×844 of actual rendered preview |
| **Functional (Phase 5)** | Nav links; collection pages; search returns demo products; filters+sorting combine; PDP shows correct data; variants update; cart qty/remove/subtotal math; empty/loading/error states |
| **Safety (Phase 4)** | Logged-out incognito → always password page (/, /collections/*, /search, /cart, /checkout); add-to-cart journey stops at demo notice; `/checkout` never reachable/complete; payment provider remains inactive; no order created (Orders stays empty) |
| **Visual** | Header/nav, homepage, collection grid, PDP, cart, footer; long names/descriptions; 360/768/1440 widths; clipping/overflow/contrast |
| **Technical/a11y** | Console + network failure scan; semantic HTML, labels, keyboard nav, focus visibility; image alt text; broken links; verify no secrets in reports/screenshots |
| **Honesty rule** | Only claim tests actually executed (brief rule 8) |

## 7. Actions requiring your approval

1. **Approve this report** → begin Phase 2 (visual design).
2. **Duplicate the live Horizon theme** as a working copy (creates one extra theme; deletes nothing) and do all Phase 2–4 development on it.
3. **Rename the store display name** Pet Pantry Test → **FurBuddies** (domain unchanged: `pet-pantry-test.myshopify.com`).
4. **Publish the developed theme** only after you review Phase 2/3 previews (default: stay unpublished until then).
5. *(No requests at this time for payments, checkout, domains, customer accounts, billing — untouched and planned to stay that way.)*

---

*No store changes were made during this audit. Store state: 0 products, 0 orders, 0 apps, 1 theme (live Horizon), password protection ON, payments OFF.*
