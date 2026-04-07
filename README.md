# AstroApka (MVP)

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

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
