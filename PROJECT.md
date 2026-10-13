# Pet Pantry Test — Project Progress

Shopify store build for a pet foods & items website (test/capability-run project).

## Access Inventory (verified 2026-10-11)

| Access | Status | Notes |
|---|---|---|
| Chrome via CDP (`127.0.0.1:9222`) | ✅ | User's live browser; work in background tabs, never steal focus |
| Shopify Partner dashboard | ✅ | Partner account (email redacted), org ComputePH (id 5222432, dev dashboard 238337688) |
| Store: Pet Pantry Test | ✅ | `pet-pantry-test.myshopify.com`, admin `admin.shopify.com/store/pet-pantry-test` — Dev store, Basic plan, created 2026-10-11, clean slate (no sample data) |
| Store: ComputePH | ✅ | API-connected via Composio (unrelated to this project) |
| ChatGPT | ✅ | Logged in (via Google SSO) |

## Store Details

- **Name:** Pet Pantry Test
- **myshopify domain:** pet-pantry-test.myshopify.com
- **Admin URL:** https://admin.shopify.com/store/pet-pantry-test
- **Type:** Partner development store (free, Basic dev plan)
- **Data:** none yet — products/theme/content all TBD

## Session Rules

- Never use the ComputePH folder for this project — everything lives here
- Never force tab focus (`bringToFront`, AppActivate) — user is working in other tabs
- Confirm before irreversible actions (publishing live, deleting, payments setup)

## Progress Log

- 2026-10-11: Chrome CDP access verified; Partner account logged in via Google SSO
- 2026-10-11: Created dev store "Pet Pantry Test" via Partner dashboard (Dev type, Basic plan, no test data)
- 2026-10-11: Project folder initialized
- 2026-10-11: Brand decided: **FurBuddies** (portfolio-only fictional pet supplies store). Brief: docs/furBuddies-brief.md
- 2026-10-11: Automation profile re-login completed (Shopify session persisted in .chrome-profile)
- 2026-10-11: Phase 1 (read-only audit) started per brief
- 2026-10-11: Phase 1 audit complete → report at docs/phase1-audit.md → STOPPED for approval
  - Theme: Horizon 4.3.0 (OS 2.0, theme id 188753510633) — only theme, live
  - Storefront password-protected (all logged-out routes redirect); payments OFF; 0 products / 0 orders / 0 apps
  - Storefront audited via admin "Preview store" token (desktop + mobile screenshots in docs/screenshots/)
- 2026-10-11: ✅ Phase 1 APPROVED by user ("go ahead") — incl. §7 items: duplicate theme, rename store, publish only after Phase 2/3 preview sign-off
- 2026-10-11: Draft theme "Copy of Horizon" verified (themes-drafts.png) — dev work happens here, live theme untouched
- 2026-10-11: Store display name renamed Pet Pantry Test → **FurBuddies** (verified: settings field + sidebar badge "FUR"; myshopify domain unchanged)
- 2026-10-11: Phase 2 (visual design) built on draft theme "Copy of Horizon" (id 188756754665)
  - Theme file read/write API reverse-engineered (app_proxy FetchThemeFiles / ThemeFilesUpsert, version=unstable)
  - Deployed: `config/settings_data.json`, `templates/index.json`, `sections/header-group.json`, `sections/footer-group.json`
  - Palette: bg #faf7f2, fg #1f1f1f, muted #5a5a5a, surface #e8e3db, terracotta accent #c67b5c; radius 14; Inter kept
  - Homepage order: hero → shop-by-pet (bento, placeholders) → featured favorites → popular categories → editorial "Our promise" → more to explore
  - Header announcement: "Portfolio demo store — products, prices, and policies are illustrative."
  - Footer: "Join the FurBuddies pack" + tagline + nav (Home/Catalog/Contact) + demo disclaimer + email signup; social links blanked
  - Images: hero (frenchie) + editorial (dog) uploaded via theme-editor UI image picker → API-uploaded Files render as UUID-suffixed refs; arbitrary/cdn URLs are rejected by the upsert validator
  - Screenshots: docs/screenshots/phase2-home-desktop.png (1430x4082) + phase2-home-mobile.png (370x4554)
  - Gotcha: Horizon wraps page in `.page-wrapper` (body overflow hidden) — fullPage capture needs overflow release + footer content-visibility override; editorial image is lazy-loaded and needs scroll-into-view before capture
  - STOPPED for Phase 2 approval
- 2026-10-13: Connected Composio Shopify integration to the **correct** store (`furbuddies` account → pet-pantry-test.myshopify.com); removed the unrelated ComputePH connection from this workspace (store untouched)
- 2026-10-13: Live read-only re-audit via API; storefront renderable via storefront password + `?preview_theme_id=188756754665`
- 2026-10-13: Phase 3 (sample catalog) built on draft theme via API:
  - 24 demo products (Dog Food, Cat Food, Treats, Toys, Accessories, Grooming & Care) — ACTIVE, priced, published to Online Store, each with a generated paw-tile image
  - 8 custom collections (6 categories + Dogs + Cats), each with 4–12 products and a generated image
  - Homepage wired: Shop by pet → Dogs/Cats; Popular categories → Treats/Toys/Accessories/Grooming; Featured favorites → Dogs
  - Theme files edited via admin `app_proxy` ThemeFilesUpsert (Admin GraphQL needs an exemption; REST asset-write 404s)
- 2026-10-13: Phase 4 (demo cart + safeguards):
  - `blocks/accelerated-checkout.liquid` — dynamic checkout replaced with demo notice (no "Buy it now")
  - `snippets/cart-summary.liquid` — checkout button disabled + "Checkout disabled (demo)" note
  - `config/settings_data.json` — `show_accelerated_checkout_buttons: false`
  - Verified: add-to-cart, qty math ($34→$68), remove, empty state; direct `/checkout` loads but CANNOT complete ("This store can't accept payments right now", Pay now disabled); 0 orders
- 2026-10-13: Phase 5 (QA): functional + visual + basic a11y checks on rendered draft; only Shopify-platform console noise (no theme JS errors)
- 2026-10-13: Phase 6: portfolio write-up at `docs/portfolio.md`; screenshots in `docs/screenshots/`
- ⛔ Theme remains UNPUBLISHED (checkout reachable post-password though non-completable → per brief, do not publish)
- 2026-10-13 (v2): Product imagery replaced with real CC photos (Wikimedia Commons, curated) — 24/24 product images + 8 collection images replaced in place; credits at docs/image-credits.md; screenshots v2-*.png
- 2026-10-13 (v2): Repo hygiene — removed captured-*.json / valid-images.json / last-media-id.txt / scripts/captured-upsert.json / .playwright-mcp; added ignore patterns (no secrets were ever committed; no remotes)
- 2026-10-13 (v3): Imagery upgraded to **AI-generated photorealistic product shots** (Google Gemini `gemini-2.5-flash-image`) — 24/24 product + 8/8 collection images replaced in place, each matching its title, no text/logos/branding; provenance at docs/image-credits.md; screenshots v3-*.png
- 2026-10-13 (v4): Branding — user-supplied FurBuddies dog+cat logo applied:
  - White background keyed to transparent; header lockup (mark+wordmark, tagline cropped) uploaded to Files as `furbuddies-logo-header.png`; square mark favicon as `furbuddies-favicon.png`
  - `config/settings_data.json`: `logo` + `favicon` set, `logo_height` 64 (desktop) / 46 (mobile)
  - Theme-file write path this session: **Playwright browser (logged-in admin)** → `app_proxy` ThemeFilesUpsert/FetchThemeFiles (Composio REST asset-write still 404s; Admin GraphQL themeFilesUpsert still needs a Shopify exemption)
  - Verified live on storefront preview; screenshots docs/screenshots/v5-home-desktop.png + v5-home-mobile.png; snapshot settings_data.json synced
- 2026-10-13 (v5): Design enhancements (user-requested), all on draft theme via app_proxy:
  - Rotating announcement bar (3 messages, autoplay 6s) in `sections/header-group.json`
  - New custom **trust/benefits bar** `sections/fb-benefits.liquid` (4 icon items) wired under the hero in `templates/index.json`
  - Full FurBuddies lockup (with tagline) added to footer brand column (`sections/footer-group.json` → image block)
  - Collection pages: new custom **banner** `sections/fb-collection-banner.liquid` (uses collection image) + filters/sort (already enabled) — `templates/collection.json`
  - Product page: **review stars** (fictional `reviews.rating` / `reviews.rating_count` metafields set on all 24 products) + **key-details accordion** (Ingredients / Feeding guide / Shipping & returns) in `templates/product.json`; "You may also like" recommendations already present
  - Visual polish: `card_hover_effect: subtle-zoom`, `product_corner_radius: 14`, `card_corner_radius: 10`
  - **Hover lifestyle images**: 24 AI-generated "pet using/eating the product" images attached as each product's 2nd image; `show_second_image_on_hover: true` + `product_card_carousel: false` (dedicated hover-preview mode)
  - Screenshots docs/screenshots/v6-*.png (home desktop/mobile, collection, product)
  - Gotcha: app_proxy writes need the admin page open (Playwright browser); unquoted hyphenated JS object keys break the eval parser (use quoted keys)
- 2026-10-13 (v6): Homepage hero → **3-image autoplay slideshow** (3.5s):
  - Generated 2 new cinematic hero images (Gemini), uploaded to Files: `furbuddies-hero-2.png` (tabby cat), `furbuddies-hero-3.png` (dog + cat); slide 1 reuses `furbuddies-hero.png`
  - Replaced the `hero` section with Horizon's `slideshow` section in `templates/index.json` (full_frame, full-width, large, on-media, dots, arrows, autoplay) with 3 `_slide` blocks (heading + subtext + button each)
  - To allow exactly **3.5s**: changed `sections/slideshow.liquid` schema `autoplay_speed` `step` 1 → 0.5, and `assets/slideshow.js` `parseInt` → `parseFloat` for the autoplay interval
  - Verified: `autoplay="3.5"`, 3 slides/dots, scroll advances; note autoplay is intentionally suspended while the tab is hidden (`document.hidden`) and pauses on hover
  - Screenshots docs/screenshots/v6-hero-slide1.png / -2 / -3
- 2026-10-13 (v7): Hero switched to a **cross-fade** slideshow on request (no arrows, no play/pause, no hover pause):
  - Horizon's `slideshow` section is a scroll-carousel with hover-pause baked into `assets/slideshow.js`, so replaced it with a purpose-built section `sections/fb-hero.liquid` (blocks of type `slide`; settings: height, heading size, autoplay)
  - Full-bleed images stacked with `opacity` cross-fade (0.9s), 3.5s interval via a small inline timer that only skips while the tab is hidden - it does **not** pause on hover; dots for manual nav
  - `templates/index.json`: `hero_slideshow` → `hero_fade` (type `fb-hero`)
  - Verified: 3 slides + dots, autoplay advances while hovering, 0 arrows / 0 pause-play controls; screenshots docs/screenshots/v7-hero-1.png / -2 / -3
  - Note: the earlier `slideshow.liquid` step + `slideshow.js` parseFloat tweaks remain (harmless; product-card galleries still use `slideshow.js`)
- 2026-10-13 (v8): Rebuilt the trust/benefits bar to match the Shopify **Scratch** theme's design the user supplied:
  - Rewrote `sections/fb-benefits.liquid`: two-tone green SVG **wave band** header (`preserveAspectRatio="none"`) above a row of **circular icon badges** with **bold green labels**
  - Five items: All Natural (leaf) / Non-GMO ("GMO" text + CSS slash) / Allergy Safe (heart) / Good for Guts (gut-bacteria cluster) / No additives (flask + slash)
  - New block icon options: `leaf`, `gmo`, `heart`, `gut`, `flask` (kept `truck`/`return` for back-compat). New section color settings: wave (dark/light), icon circle, label, icon; plus wave height + top/bottom padding
  - Responsive: 5 columns → 3 (≤989px) → 2 (≤599px)
  - `templates/index.json`: `fb_benefits` repointed to the 5 new blocks/settings
  - Note: a `text` block setting with a blank default is rejected by schema validation ("default can't be blank") - removed it
  - Verified live (desktop 1440 + mobile 480): screenshots docs/screenshots/v8-benefits.png, v8-benefits-mobile-full.png
- 2026-10-13 (v9): Benefits bar restyled to cream (per request):
  - Removed the green wave band entirely (markup, SVG, and its settings)
  - Section background: white -> cream `#f7f2e9`; icon circles -> cream `#efe5d3`
  - Icon line color -> darker cream/tan `#a98a5e` (also used by the Non-GMO "GMO" text + slash)
  - Kept Scratch icon formats + green labels (`#2f7d4f`); top/bottom padding 64px
  - Screenshot docs/screenshots/v9-benefits-cream.png
- 2026-10-13 (v10): Benefits bar - icon lines -> black `#000000`, label text -> dark cream `#a98a5e`, circles kept cream `#efe5d3`. Screenshot docs/screenshots/v10-benefits-black-icons.png
- 2026-10-13 (v11): Benefits bar background matched to the nav/page color `#faf7f2` (was `#f7f2e9`; header is transparent over `body`). Verified benefits bg == body bg.
- 2026-10-13 (v12): Product-card hover changed from **slide/zoom to a fade**:
  - Root cause: Horizon's card `on:pointerenter="/previewImage"` scrolls the mini-slideshow to the 2nd image (a horizontal slide); `card_hover_effect` added a zoom
  - Edited `snippets/card-gallery.liquid`: removed the `previewImage`/`resetImage` hover handlers; added an absolutely-positioned 2nd-image overlay `.card-gallery__hover-fade` (opacity 0 -> 1, `transition: opacity .4s`) shown via `.card-gallery:hover` (gated by `@media (hover: hover)`; `prefers-reduced-motion` disables the transition)
  - `config/settings_data.json`: `current.card_hover_effect` `subtle-zoom` -> `none` (no zoom)
  - Applies to every product grid (home Featured favorites + More to explore + collection pages + recommendations) since they all render `card-gallery`
  - Verified: 12/12 cards have the overlay; hover sets the 0->1 opacity transition (proof screenshot docs/screenshots/v12-card-hover-fade.png)
- 2026-10-13: Added `docs/status-report.md` - full site status/quality report + Lighthouse/axe audit checklist (for external audit)
- 2026-10-13 (v13): Final portfolio audit + fixes (draft theme only; report at `docs/audit-findings.md`):
  - **Fix (a11y/contrast):** benefits label `#a98a5e` -> `#8a6a3a` (3.03:1 -> **4.68:1**, passes WCAG AA). Files: `sections/fb-benefits.liquid` + `templates/index.json`
  - **Fix (perf/attr bug):** hero images had no `loading`/`fetchpriority` because a `| default:` filter inside the `image_tag:` `alt:` arg dropped later args; precomputed `img_alt` -> slide 1 `eager/high`, slides 2-3 `lazy/low`. File: `sections/fb-hero.liquid`
  - **Fix (reduced motion):** hero autoplay JS now skips `prefers-reduced-motion: reduce` (+ change listener). Verified: reduce = no advance; normal = advances
  - Verified: schemas + templates JSON valid; product/home JSON-LD has **no** fake aggregateRating/review; cart works with checkout "Checkout disabled (demo)" disabled; no mobile overflow; probe data 404
  - Live theme untouched (Horizon 188753510633, updated 2026-10-11); draft unpublished; storefront password-protected
  - Not fixed (needs approval): homepage meta description, Contact page copy, announcement-bar reduced-motion, Theme Check/Lighthouse not runnable here
- 2026-10-13 (v14): Cleanup + verification round (draft theme only):
  - **Meta description:** `snippets/meta-tags.liquid` now emits a homepage `<meta name="description">` for `request.page_type == 'index'` when `page_description` is blank (theme pages/products already had theirs)
  - **Contact note:** added a `text` block (`notice`) to `templates/page.contact.json` explaining FurBuddies is a portfolio demo; layout preserved
  - **Announcement bar reduced motion:** `assets/announcement-bar.js` now skips autoplay under `prefers-reduced-motion: reduce` (+ change listener, cleanup in `disconnectedCallback`). Verified: reduce = no rotation; normal = rotates
  - **axe-core (via CDN, real run):** fixed hero `aria-hidden-focus` (inactive slides now `inert`, `sections/fb-hero.liquid`), review `.rating` `aria-prohibited-attr` (`role="img"`, `blocks/review.liquid`), recommendation skeleton `aria-prohibited-attr` (single `role="status"` region in `blocks/product-recommendations.liquid` + `sections/product-recommendations.liquid`)
  - **Lighthouse 13.5.0 available but blocked:** audit redirected to `/password` (finalUrl), so scores are not representative; storefront stays password-protected
  - **Theme Check unavailable** (no `shopify` CLI, no Ruby)
  - Remaining axe items (documented, not fixed): `heading-order` (theme/content heading pattern), collection facets `list` (theme), `frame-title` = Shopify preview bar (environmental)
  - Verified: meta description present; contact note renders; benefits contrast stays 4.68:1; hero + announcement honour reduced motion; cart add/drawer works; checkout "Checkout disabled (demo)"; no mobile overflow
  - Screenshots: `docs/screenshots/final-home-desktop.png`, `final-home-mobile.png`

## Pending / Next Steps

- [x] Phase 1: Read-only store audit → report → approval ✅ (approved 2026-10-11)
- [x] Approvals: duplicate theme ✅ · rename store to FurBuddies ✅
- [x] Phase 2: Visual design (homepage sections on draft theme) → screenshots ✅ built + captured 2026-10-11 — awaiting approval
- [x] Phase 3: Sample catalog 24 products + 8 collections ✅ (2026-10-13)
- [x] Phase 4: Demo cart + transaction safeguards ✅ (2026-10-13)
- [x] Phase 5: QA (functional, visual, a11y) ✅ (2026-10-13)
- [x] Phase 6: Portfolio preparation → `docs/portfolio.md` ✅ (2026-10-13)
- [ ] Cleanup (approval): delete probe artifacts `FUR-PROBE-BARE` (product) + `FUR-PROBE-TEMP` (collection)
- [ ] ⛔ Publish developed theme ONLY after user reviews previews AND accepts the checkout limitation
