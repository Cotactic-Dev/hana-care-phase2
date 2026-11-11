# Hana Care Phase 2 — E-commerce mockup (Next.js + Tailwind)

Phase 2 replaces the "ขอเช่า → กรอก lead" flow with **add to cart → checkout** for bed rentals.
It is a **clickable mockup for client review**: no payment gateway, no backend — cart lives in
`localStorage`, the "order" in `sessionStorage`. Prices/discounts are sample data (`<SampleBadge/>`).

### Phase 2 at a glance

| Route | What |
| --- | --- |
| `/patient-beds/[slug]/` | Rental configurator: plan (เช่าระยะสั้น / ลีสซิ่ง / เช่าเพื่อเป็นเจ้าของ) → contract length → qty → add to cart / เช่าเลย |
| `/cart/` (+ slide-out drawer) | Lines, qty, remove, "แก้ไข" back to product page, totals |
| `/checkout/` | Customer + delivery address + payment method (card / PromptPay / bank transfer — mock) |
| `/checkout/order-received/` | Thank-you page: mock PromptPay QR / bank details / credit-approval notice + next steps |

- **Pricing rules:** `src/data/pricing.ts` — term options per plan + long-contract discount %, deposit (short-term only). Edit there.
- **Cart:** `src/components/cart/*` (`CartProvider` = context + drawer).
- Lead form stays on `/contact-us/` and the home page as "ปรึกษาก่อนเช่า".

**WooCommerce fit (future WordPress build):** the UI deliberately stays within what WooCommerce +
WooCommerce Subscriptions + a Thai gateway plugin (e.g. Opn/Omise) can do out of the box:
plan × term = variations of a variable subscription product, discounted rent = variation sale price,
deposit = sign-up fee, cart can only change qty/remove (edit = back to product), checkout uses standard
billing/shipping fields (province list = WC Thai states, `src/data/th-provinces.ts`), and the thank-you URL
matches WC's `/checkout/order-received/`.

### Ports (runs side by side with Phase 1)

| | Phase 1 | Phase 2 |
| --- | --- | --- |
| prod (`web`) | 3000 | **3100** |
| dev (`--profile dev`) | 3001 | **3101** |

```bash
docker compose --profile dev up -d dev   # http://localhost:3101 (hot reload)
```

### Deploy to Vercel

1. Import the GitHub repo `hana-care-phase2` → Framework preset **Next.js** (defaults are fine: `npm run build`, no root dir, Node 20).
2. Environment Variables (Production + Preview), see `.env.example`:

   | Key | Demo value | Note |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | *(leave empty)* | auto = Vercel production URL; set the real domain only at launch |
   | `NEXT_PUBLIC_LINE_URL` | `https://line.me/R/ti/p/@hanacare` | LINE add-friend link |
   | `NEXT_PUBLIC_GTM_ID` | *(empty)* | GTM off for the demo |
   | `NEXT_PUBLIC_GA4_DEBUG` | `false` | `true` shows the event inspector to the client |

3. Every Vercel deploy is **noindex** automatically (`VERCEL=1` → robots disallow + meta noindex), so the mockup never shows up on Google.
4. `NEXT_PUBLIC_*` are build-time → **Redeploy** after changing them.

---

# Phatra Care — Next.js + Tailwind

This is the Next.js 15 (App Router, TypeScript) and Tailwind CSS v4 port of the static site in the parent folder. Every URL is the same as before. The trailing slash is kept, so routes like `/patient-beds/comfort-care/` still work.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```

### Docker

```bash
cp .env.example .env   # set GTM ID, LINE URL, etc.
docker compose up -d --build        # http://localhost:3000 (PORT=xxxx to change)
docker compose logs -f web
docker compose down
```

The Dockerfile builds in three stages: deps, build, and runtime. The runtime stage uses `output: "standalone"` on node:20-alpine. It runs as a non-root user and has a healthcheck. `NEXT_PUBLIC_*` variables are build args, so you need to rebuild after changing them.

## Structure

```
src/
  app/                         # one folder per route (same URLs as the legacy site)
    layout.tsx                 # fonts (Prompt/Inter via next/font), GTM, TopBar/Header/Footer, providers
    globals.css                # Tailwind + @theme design tokens + overrides
    patient-beds/[slug]/       # ONE template for all 3 SKUs (data-driven)
    sitemap.ts, robots.ts, not-found.tsx
  data/products.ts             # single source of truth for the 3 SKUs (WooCommerce-ready shape)
  data/site.ts                 # phone, LINE, nav, SITE_URL
  components/
    layout/                    # TopBar, Header (client: scroll/mobile nav/lang), Footer, StickyMobileBar
    home/BedFinderQuiz.tsx     # 3-step quiz → reads products.ts
    products/ComparisonTable.tsx
    forms/LeadForm.tsx         # validation + GA4 generate_lead + redirect (no PII in URL)
    analytics/AnalyticsProvider.tsx  # page_view per route, data-track delegation, debug inspector
    i18n/                      # TH/EN client toggle (ported from app.js)
    seo/JsonLd.tsx
  styles/legacy.css            # original style.css, loaded in @layer components
```

## Styling approach

- The design tokens live in `@theme`, so utilities like `bg-primary`, `text-primary-dark`, `border-warm-border`, `shadow-card` and `font-en` are available.
- The original `assets/css/style.css` is now `src/styles/legacy.css`, imported into `@layer components`. Tailwind utilities always override it, so the visuals match the original exactly.
- New and refactored components use Tailwind utilities. When a section has been migrated, delete its rules from `legacy.css`.
- `.col-span-2` was renamed to `.form-col-full` because it clashed with the Tailwind utility of the same name and broke the mobile form layout.

## Analytics

- To track a click, put `data-track="event_name"` and `data-track-params='{"k":"v"}'` on any element, including in Server Components.
- Call `trackEvent()` from `@/lib/analytics` in client code. It pushes to `window.dataLayer`.
- Set `NEXT_PUBLIC_GTM_ID` to load GTM. Set `NEXT_PUBLIC_GA4_DEBUG=true` to show the on-page event inspector (for staging only).

## TODO / follow-ups

- Lead forms currently only track the event and redirect. Hook them up to a backend, such as `app/api/leads/route.ts`, then CRM, LINE Notify or email.
- Build real `/en/` routes. hreflang already points to `/en/`, but EN is still a client-side toggle.
- Add a `logo.png`. The Organization schema references `/assets/images/logo.png`, which doesn't exist.
- `/privacy-policy/` and `/terms-of-service/` pages don't exist yet. The footer opens the PDPA modal instead.
