# FurBuddies — Portfolio Project Overview

> **This is a fictional, non-transactional portfolio demo.** FurBuddies is not a real
> business, the products and prices are illustrative, no orders are fulfilled, and no
> payments can be taken. It exists to demonstrate Shopify theme development,
> responsive e-commerce UX, and QA.

- **Store:** `pet-pantry-test.myshopify.com` (Shopify development store)
- **Theme:** Horizon (Online Store 2.0), developed on the unpublished draft **"Copy of Horizon"**
- **Status:** development theme kept **unpublished**; live Horizon theme untouched

---

## 1. Project overview

FurBuddies is a pet-supplies storefront (food, treats, toys, accessories, grooming)
built as a business-quality portfolio piece on a real Shopify dev store. The work
covers visual design, a coherent demo catalog, product discovery, a demo cart with
transaction safeguards, and quality assurance — all delivered read-only-first and in
reviewable phases.

## 2. Implemented features

- **Homepage** (OS 2.0 sections): announcement bar, hero value proposition, "Shop by
  pet" (Dogs/Cats), "Featured favorites", "Popular categories", editorial "Our
  promise", "More to explore", and a footer with demo disclosure.
- **Catalog:** 24 demo products across 6 categories + 2 species collections.
- **Product discovery:** collection browsing, product cards, product detail pages,
  native search, availability/price filtering, sorting, related recommendations.
- **Demo cart:** add to cart, quantity update, remove, correct subtotal, empty state.
- **Safeguards:** checkout button disabled with a demo notice, dynamic checkout
  ("Buy it now") replaced with a demo notice, accelerated checkout disabled, no
  payment provider, permanent storefront password.
- **Responsive design:** verified at desktop (1440×900) and mobile (390×844).

## 3. Architecture

- Shopify **Online Store 2.0** theme (Horizon): JSON templates + `sections/`,
  `blocks/`, `snippets/`, `assets/`, `config/`, `locales/`, `layout/`.
- All edits target the **draft theme only** (`188756754665`); the live theme
  (`188753510633`) is untouched.
- Catalog uses **native Shopify products & collections** — no external database.
- Demo imagery is generated in-house (see §4) and uploaded as native product/collection
  images.

## 4. Important technical decisions

- **Draft-theme development.** Duplicated Horizon so the live theme stayed intact and
  changes could be reviewed via preview before any publish.
- **AI product imagery (v3).** All 24 product images and 8 collection images are
  AI-generated photorealistic product shots (Google Gemini image model), square 1:1 at
  1000×1000 on a consistent warm studio background, each matching its product title and
  free of text/logos/branding. Provenance recorded in `docs/image-credits.md`.
- **Theme file writes via the admin `app_proxy`.** The Admin GraphQL
  `themeFilesUpsert` requires a Shopify exemption and the REST asset-write path
  returned 404, so theme files were updated through the Online Store admin's internal
  `app_proxy` endpoint (`FetchThemeFiles` / `ThemeFilesUpsert`, `version=unstable`).
- **Safeguards layered, not single-point.** Checkout button disabled, dynamic checkout
  removed, accelerated checkout off, no payment provider, permanent storefront
  password — deliberately redundant because the brief warns that hiding a button does
  not disable checkout.
- **No sensitive settings changed.** Payments, checkout config, domains, DNS,
  publication, and customer-account settings were not modified.

## 5. Tests performed & known limitations

**Performed (verified against the rendered draft preview):**

| Area | Result |
|---|---|
| Homepage sections render with real collections/products | ✅ |
| Collection page loads, filters (Availability, Price) + sort present | ✅ |
| Search returns products ("dog" → 19 results) | ✅ |
| PDP shows correct title, price, image, description | ✅ |
| Add to cart works (demo cart) | ✅ |
| Quantity update: qty 2 → $68.00 (correct math) | ✅ |
| Remove item → "Your cart is empty" + Continue shopping | ✅ |
| Cart checkout button disabled + demo notice | ✅ |
| PDP dynamic checkout removed, demo notice shown | ✅ |
| Direct `/checkout` cannot complete — "This store can't accept payments right now", **Pay now disabled** | ✅ |
| Orders created | **0** |
| Console | only Shopify-platform noise (no theme JS errors) |

**Known limitations:**

- **`/checkout` is reachable after entering the storefront password.** It loads
  Shopify's hosted checkout, but it **cannot complete** (no payment provider; `Pay now`
  disabled; `checkoutApiSupported: false`). The theme cannot intercept `/checkout`.
  For logged-out visitors every route, including `/checkout`, redirects to the
  permanent `/password` page. **The store is therefore kept unpublished.**
- Product/collection imagery is generated placeholder art, not real product photos.
- Storefront filtering is limited to Shopify's native options (availability, price);
  richer attribute filters would need the (free) Search & Discovery app.
- Accessibility was spot-checked (alt text present, form labels present, focus styles
  inherited from Horizon) but not exhaustively audited.
- Two leftover probe artifacts from earlier API exploration remain: draft product
  `FUR-PROBE-BARE` and unpublished collection `FUR-PROBE-TEMP` (neither is visible on
  the storefront). Recommend deleting on approval.

## 6. Screenshots

Desktop + mobile captures in `docs/screenshots/`:

- `phase3-home-desktop.png`, `phase3-home-mobile.png`
- `phase3-collection-dogs-desktop.png`, `phase5-collection-mobile.png`
- `phase3-product-desktop.png`
- `phase5-search-desktop.png`
- `phase4-cart-desktop.png`, `phase5-cart-empty.png`
- `phase4-checkout-blocked.png`
- **Latest (v6)**: `v6-home-desktop.png`, `v6-home-mobile.png`,
  `v6-collection-desktop.png`, `v6-product-desktop.png` — show the brand logo,
  rotating announcements, benefits bar, collection banner + filters/sort, product
  review stars + key-details accordion, and recommendations.

## 7. Potential future improvements (portfolio only)

- Replace generated imagery with licensed pet photography.
- Add richer attribute facets (Search & Discovery) and variant swatches.
- Expand the editorial section into a small demo blog/journal.
- Add automated visual-regression + accessibility (axe) checks.

## 8. How Shopify native functionality was used

- **Products, variants, prices, tags, product types, images** via the Admin API.
- **Custom collections** (manual) for the 6 categories + Dogs/Cats.
- **Online Store 2.0 sections** (`hero`, `collection-list`, `product-list`,
  `media-with-content`, `header/footer` groups) configured via `templates/index.json`.
- **Native search, cart, and collection filtering/sorting.**
- **Theme Store theme (Horizon)** extended rather than replaced.
- **Storefront password protection** and **payment-provider configuration** left at
  their safe defaults.

## 9. Disclosure

FurBuddies is a **fictional brand** created for a portfolio demonstration. Product
names, descriptions, and prices are illustrative and are **not available for
purchase**. The cart is a demonstration; checkout is disabled and no orders are
created. No real customers, sales, or conversion data are represented.
