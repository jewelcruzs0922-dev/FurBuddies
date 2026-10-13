# FurBuddies — Shopify Pet Supplies Store

A **portfolio-only** Shopify storefront demo built on **Online Store 2.0** (Horizon theme base). FurBuddies is a fictional pet-supplies shop used to demonstrate Shopify theme design and storefront UX — there are no real products, customers, orders, or payments.

**Live demo:** https://pet-pantry-test.myshopify.com/ — *password-protected; ask me for access.*
Checkout is intentionally disabled.

---

## What's built

- **Custom cross-fade hero** (`sections/fb-hero.liquid`) — 3 full-bleed slides, 0.9s cross-fade, 3.5s autoplay, dots only (no arrows / play-pause / hover-pause); pauses when the tab is hidden and honours `prefers-reduced-motion`.
- **Benefits / trust bar** (`sections/fb-benefits.liquid`) — 5 icon items, responsive 5 → 3 → 2 columns.
- **Fade-on-hover product cards** — the second (lifestyle) image cross-fades over the main image.
- **Collection banner + filters/sort** (`sections/fb-collection-banner.liquid`).
- **Product page** — review-star metafields, a key-details accordion, and related products.
- **Demo cart** — add / update / remove, with checkout disabled and a clear demo notice.
- Rotating announcement bar, custom logo + favicon, and a responsive layout throughout.

## Tech

Shopify · Liquid · JavaScript · HTML/CSS · Responsive design

## Repository layout

```
theme-snapshot/   theme files (custom sections/snippets + a snapshot of the base theme files used)
docs/             audit reports, portfolio write-up, image credits, screenshots
scripts/          automation/tooling used to build and audit the demo
PROJECT.md        build log
```

## Notes & disclaimers

- Fictional "FurBuddies" brand; all copy, prices, and policies are illustrative.
- Product and lifestyle imagery is AI-generated for the demo.
- Checkout and payments are disabled, and the storefront is password-protected.
- Not affiliated with any real brand or business.
