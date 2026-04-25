# CosmoTips (MVP)

CosmoTips — personalized AI astrology reports, delivered instantly.

Modern, responsive web app that sells **$5** personalized horoscope reports using **Stripe Checkout** and generates the report with **OpenAI** after payment is confirmed.

## Features

- Mobile-first UI (Tailwind) with report-type selection cards
- Stripe Checkout payment gate ($5)
- Server-side OpenAI generation (API key never exposed to the browser)
- Success / cancel flows + loading and error states
- Optional: saves reports to localStorage + printable view

## Tech

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Stripe (server-side)
- OpenAI (server-side)

## Setup

1. Install deps

```bash
npm i
```

2. Create env file

```bash
cp .env.example .env.local
```

3. Fill in environment variables

- `OPENAI_API_KEY`: your OpenAI API key
- `STRIPE_MODE`: `test` or `live` (defaults to `test`)
- `STRIPE_SECRET_KEY_TEST`: Stripe test secret key
- `STRIPE_SECRET_KEY_LIVE`: Stripe live secret key
- `STRIPE_SKIP_PAYMENT_FOR_DEV`: set `true` to bypass Stripe checkout and generate reports immediately (dev-only; do not enable in production)

4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## How the payment → report flow works

1. Home form posts to `POST /api/stripe/checkout`
2. Server creates a Stripe Checkout Session for **$5** and stores birth inputs in `session.metadata`
3. Stripe redirects back to `/success?session_id=...`
4. Success page calls `GET /api/report/generate?session_id=...`
5. Server verifies `payment_status === "paid"` and then calls OpenAI to generate the report

## Key files

- `src/app/page.tsx`: form + report-type selection + checkout redirect
- `src/app/api/stripe/checkout/route.ts`: creates Stripe Checkout Session
- `src/app/api/report/generate/route.ts`: verifies payment + generates OpenAI report
- `src/app/success/page.tsx`: fetches and renders the report (Markdown)
- `src/app/reports/page.tsx`: local saved reports viewer

## Notes / Production checklist

- Stripe webhooks are not required for this MVP flow, but add them if you want fully server-driven fulfillment.
- Consider adding rate limiting and caching/idempotency (per paid session) to avoid multiple AI generations.
- Consider replacing the simple place input with a real autocomplete (Google Places, Mapbox, etc.).
