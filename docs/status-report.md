# FurBuddies — Website Status & Quality Report

_Last updated: 2026-10-13_

## 0. Context for the auditor
- This is a **fictional portfolio/demo Shopify storefront** named **FurBuddies** (pet supplies). No real commerce, customers, or payments.
- Built by an AI agent on a **Shopify Partner development store** using a **draft (unpublished) theme**.
- Goal: a polished, visually complete, non-transactional storefront suitable for a design/portfolio review.
- **Do not treat product prices, reviews, policies, or claims as real.** All copy, imagery, ratings, and catalog are illustrative.

## 1. Store & platform
| Item | Value |
|---|---|
| Display name | FurBuddies (myshopify domain still `pet-pantry-test.myshopify.com`) |
| Store type | Shopify Partner **development store**, Basic dev plan, created 2026-10-11 |
| Currency / market | **USD**, United States, English |
| Storefront visibility | **Password-protected** (permanent). Previewable via admin-linked browser |
| Payments | **Not configured** -> checkout cannot be completed (intentional) |
| Apps installed | None |
| Orders | 0 |
| Theme | Shopify **Horizon 4.3.0** (Online Store 2.0) |

**Themes**
- Live theme `Horizon` (id `188753510633`) - untouched.
- Draft theme `Copy of Horizon` (id `188756754665`) - **all work happens here; NOT published**.

**Preview URL:** `https://pet-pantry-test.myshopify.com/?preview_theme_id=188756754665`

## 2. Design system
- Palette: background `#faf7f2`, foreground `#1f1f1f`, muted `#5a5a5a`, surface `#e8e3db`, accent terracotta `#c67b5c`.
- Radii: global radius 14; product image corner radius 14; card corner radius 10.
- Typography: **Inter** (heading + body), letter-spacing/wrap tuned for headings.
- Motion: `card_hover_effect: none`; product/media transitions; reduced-motion respected in custom sections.
- Logo: user-supplied dog+cat mark, white keyed to transparent; header lockup + square favicon.

## 3. Homepage composition (order)
1. **Fade hero** (`sections/fb-hero.liquid`) - 3 stacked full-bleed images, **cross-fade** (opacity 0.9s), 3.5s autoplay, dots only, **no arrows / no play-pause / no hover-pause**.
2. **Benefits/trust bar** (`sections/fb-benefits.liquid`) - 5 circular icon badges + bold labels on cream.
3. **Shop by pet** - bento collection list (Dogs, Cats).
4. **Featured favorites** - product grid (Dogs, 8 products).
5. **Popular categories** - grid (Treats, Toys, Accessories, Grooming).
6. **Our promise** - media-with-content editorial block + CTA.
7. **More to explore** - product grid (4).

Header: rotating announcement bar (3 messages, ~6s) + logo/nav (Home, Catalog, Contact).
Footer: brand column with full logo, nav, demo disclaimer, email signup; social links blanked.

## 4. Key custom features
- **Fade hero** - custom section, merchant-editable slides (image, heading, text, button), settings for height, heading size, autoplay. Timer only pauses when the browser tab is hidden (never on hover).
- **Benefits bar** - custom section; items: All Natural (leaf), Non-GMO ("GMO" text + slash), Allergy Safe (heart), Good for Guts (gut/flora), No additives (flask + slash). Colors: bg `#faf7f2`, circle `#efe5d3`, icon `#000000`, label `#a98a5e`. Responsive 5 -> 3 -> 2 columns. Fully editable (colors, layout, padding).
- **Product-card hover = FADE** - custom overlay in `snippets/card-gallery.liquid`: hovering cross-fades the product's **2nd (lifestyle) image** over the main image (opacity 0 -> 1, 0.4s). The theme's built-in "slide to image 2" hover and the zoom effect were disabled.
- **Collection banner** - custom `sections/fb-collection-banner.liquid` using the collection image; filter + sort enabled on collection templates.
- **Product page** - fictional review stars (metafields), key-details accordion (Ingredients / Feeding guide / Shipping & returns), "You may also like".

## 5. Catalog & media
- **24 demo products** across 6 categories (dog food, cat food, treats, toys, accessories, grooming), ACTIVE, priced, published to Online Store.
- **8 collections**: `dogs`, `cats`, `dog-food`, `cat-food`, `treats`, `toys`, `accessories`, `grooming`.
- **Imagery**: AI-generated photorealistic shots (Google Gemini), one per product + one per collection. Each product also has a **2nd "pet using/eating" lifestyle image** used for the hover fade.
- **Ratings**: fictional `reviews.rating` + `reviews.rating_count` metafields set on all 24 products.

## 6. Commerce safeguards (demo-only)
- Accelerated checkout button replaced with a demo notice (no "Buy it now").
- Cart checkout button **disabled** with a "Checkout disabled (demo)" note.
- `show_accelerated_checkout_buttons: false`.
- Direct `/checkout` loads but **cannot complete** ("This store can't accept payments right now"); **0 orders**.

## 7. Accessibility (current state - not formally audited)
- Semantic HTML, `aria-label` on product links, decorative SVGs `aria-hidden`, list roles on custom sections.
- **Potential issue to audit**: benefits-bar labels `#a98a5e` on `#faf7f2` and non-text icon contrast - likely **below WCAG AA 4.5:1** for the labels.
- No automated a11y pass (axe/Lighthouse) has been run.

## 8. QA performed
- Manual functional + visual QA in-browser on the draft theme (desktop + mobile): navigation, collection filters/sort, product page, add-to-cart, quantity math, remove, empty cart, search.
- Only Shopify-platform console noise observed (no theme JS errors).

## 9. Known limitations / risks
- Theme **unpublished**; storefront password-protected.
- **Checkout non-completable** by design (no payment provider).
- Probe artifacts still present: product `FUR-PROBE-BARE`, collection `FUR-PROBE-TEMP` (pending deletion approval).
- Review stars are **fake metafields**, not a real reviews app.
- Card hover renders a **second image per card** (extra network/asset cost; SEO/duplicate-media consideration).
- Home hero slides use **AI imagery**; claims/copy are fictional.
- Leftover-but-harmless tweaks: `sections/slideshow.liquid` autoplay `step` 0.5 and `assets/slideshow.js` `parseFloat` (no longer used by the home hero).
- **Not run**: Shopify Theme Check, Lighthouse/WebPageTest, automated accessibility audit, cross-browser testing.
- No analytics, no structured data (JSON-LD) review, no SEO metadata review.
- Contact/Catalog pages: verify they have real content (nav links point to Home/Catalog/Contact).

## 10. Files touched on the draft theme
- Custom sections: `fb-hero.liquid`, `fb-benefits.liquid`, `fb-collection-banner.liquid`
- Modified: `snippets/card-gallery.liquid`, `config/settings_data.json`, `templates/index.json`, `templates/collection.json`, `templates/product.json`, `sections/header-group.json`, `sections/footer-group.json`, `blocks/accelerated-checkout.liquid`, `snippets/cart-summary.liquid`, `sections/slideshow.liquid`, `assets/slideshow.js`
- Files (images): `furbuddies-logo.png`, `furbuddies-logo-header.png`, `furbuddies-favicon.png`, `furbuddies-hero.png`, `furbuddies-hero-2.png`, `furbuddies-hero-3.png`, `furbuddies-editorial.png`

## 11. Screenshots (repo `docs/screenshots/`)
Latest: `v12-card-hover-fade.png` (hover fade), `v11`/`v10`/`v9`/`v8-benefits*` (trust bar iterations), `v7-hero-1/2/3.png` (fade hero), `v6-*` (slideshow hero, product, collection, home), `phase5-*` (cart/search), `phase4-checkout-blocked.png`.

---

## 12. Audit checklist (Lighthouse + axe-core)

Run against the **preview URL** (unpublished theme) on both **mobile** and **desktop** profiles.

### Lighthouse
- [ ] Performance (mobile + desktop): record LCP, CLS, TBT, Speed Index, total bytes, request count.
- [ ] Images: confirm hero PNGs (3) are the LCP element cost; check sizing/`srcset`/format (PNG vs AVIF/WebP), and whether the per-card **second hover image** is loaded eagerly or lazy.
- [ ] Accessibility (Lighthouse): review the flagged audits; cross-check with axe below.
- [ ] Best Practices: image aspect ratios, console errors, HTTPS, third-party cookies.
- [ ] SEO: `<title>`/meta description, h1 presence, links are crawlable, robots.
- [ ] Compare home vs collection vs product templates; note the worst template.

### axe-core (browser devtools or `@axe-core/cli`)
- [ ] **Color contrast** - benefits bar labels `#a98a5e` on `#faf7f2`; icon glyphs on `#efe5d3`; muted text `#5a5a5a`; button/CTA contrast.
- [ ] **Images have alt** - product cards, hero slides, collection banners, lifestyle/hover images.
- [ ] **Headings** - single h1, logical order (hero heading vs section headings).
- [ ] **Landmarks** - header/nav/main/footer present and unique.
- [ ] **Links/buttons** - discernible names; icon-only controls (cart, search, account, hero dots, filter toggles) have labels.
- [ ] **Forms** - footer email signup label, error association; search input label.
- [ ] **Focus** - visible focus rings; keyboard reachability of hero dots, filters/sort, add-to-cart, quantity steppers.
- [ ] **ARIA** - custom sections use `role="list"/"listitem"` correctly; no empty links.
- [ ] **Reduced motion** - hero fade and card hover respect `prefers-reduced-motion`.

### Manual / qualitative
- [ ] Mobile tap target sizes (nav, dots, filter chips) >= 44px.
- [ ] Keyboard-only pass through: header megamenu, filters, product options, add-to-cart, cart drawer.
- [ ] Screen-reader pass on home + product (states, cart updates announced).
- [ ] Cross-browser: Chrome, Safari (iOS), Firefox.
- [ ] Heading/copy review for demo-claim accuracy vs. disclaimer.

### Shopify-specific
- [ ] Run **Theme Check** (`shopify theme check`) on the theme; resolve valid findings.
- [ ] Verify section schema JSON validity for `fb-hero`, `fb-benefits`, `fb-collection-banner`.
- [ ] Confirm no merchant setting can produce an invalid combination (e.g., empty slides, no blocks).
- [ ] Confirm checkout/accelerated-checkout guards remain after any theme refresh.
