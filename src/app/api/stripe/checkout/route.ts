import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { CheckoutPayloadSchema } from "@/lib/reportSchema";
import { checkRateLimit } from "@/lib/rateLimit";
import { getAuthSession } from "@/lib/authSession";
import {
  hasUsedProPersonalityPortrait,
  isProSubscriber,
  markProPersonalityPortraitUsed,
} from "@/lib/subscriptionStore";
import { storeFreeReportPayload } from "@/lib/freeReportStore";
import { isFreeReportEmailAllowed } from "@/lib/freeReportEmailAllowlist";

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Amounts are EUR cents. Weekly/monthly forecasts: €5; personality portrait: €10. */
function reportPrice(reportType: "natal_basic" | "personality" | "weekly" | "monthly") {
  if (reportType === "personality") return 1000;
  return 500;
}

function reportDescription(reportType: "natal_basic" | "personality" | "weekly" | "monthly") {
  if (reportType === "personality") return "Personality portrait";
  if (reportType === "weekly") return "7-day forecast from purchase date";
  if (reportType === "monthly") return "30-day forecast from purchase date";
  return "Report";
}

export async function POST(req: Request) {
  const rateLimit = await checkRateLimit(getClientIp(req));
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = CheckoutPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input." },
      { status: 400 },
    );
  }

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  const { email, dob, tob, pob, reportType, lang, birthTimeUnknown } = parsed.data;
  const birthTimeUnknownParam = birthTimeUnknown ? "1" : "0";

  const stripeMode = process.env.STRIPE_MODE ?? "test";
  const skipPaymentForDev =
    stripeMode !== "live" &&
    (process.env.STRIPE_SKIP_PAYMENT_FOR_DEV ?? "false") === "true";

  if (reportType === "natal_basic") {
    const sessionId = `fnb_${randomUUID()}`;
    await storeFreeReportPayload(sessionId, parsed.data);
    const params = new URLSearchParams({
      session_id: sessionId,
      fnb: "1",
      lang,
    });
    return NextResponse.json({ url: `${origin}/success?${params.toString()}` });
  }

  /* Allowlista przed Pro / Stripe — bez ukrycia za sesją lub stanem Redis subskrypcji. */
  if (isFreeReportEmailAllowed(email)) {
    const sessionId = `comp_${randomUUID()}`;
    await storeFreeReportPayload(sessionId, parsed.data);
    const params = new URLSearchParams({
      session_id: sessionId,
      comp: "1",
      lang,
    });
    return NextResponse.json({ url: `${origin}/success?${params.toString()}` });
  }

  const authSession = await getAuthSession();
  const proSubscriber =
    authSession?.email === email.trim().toLowerCase() && (await isProSubscriber(email));
  if (
    proSubscriber &&
    reportType === "personality" &&
    !(await hasUsedProPersonalityPortrait(email))
  ) {
    const claimed = await markProPersonalityPortraitUsed(email);
    if (!claimed) {
      // If another request used the included portrait first, fall through to paid checkout.
    } else {
      const sessionId = `pro_personality_${randomUUID()}`;
      const params = new URLSearchParams({
        session_id: sessionId,
        pro: "1",
        email,
        dob,
        tob,
        pob,
        reportType,
        lang,
        birthTimeUnknown: birthTimeUnknownParam,
      });
      return NextResponse.json({ url: `${origin}/success?${params.toString()}` });
    }
  }

  if (skipPaymentForDev) {
    const sessionId = `dev_${randomUUID()}`;
    const params = new URLSearchParams({
      session_id: sessionId,
      dev: "1",
      email,
      dob,
      tob,
      pob,
      reportType,
      lang,
      birthTimeUnknown: birthTimeUnknownParam,
    });
    return NextResponse.json({ url: `${origin}/success?${params.toString()}` });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: reportPrice(reportType),
          product_data: {
            name: "CosmoTips report",
            description: reportDescription(reportType),
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&lang=${encodeURIComponent(lang)}`,
    cancel_url: `${origin}/cancel?lang=${encodeURIComponent(lang)}`,
    /**
     * Tworzy fakturę Stripe (PDF + rekord rozliczeniowy). Konsument dostaje maile Stripe
     * z potwierdzeniem/z linkiem — włączone w Dashboardzie: ustawienia powiadomień dla klienta.
     * Zob. README („Stripe receipts & invoices”).
     */
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: `CosmoTips — ${reportDescription(reportType)}`,
        footer: "CosmoTips",
      },
    },
    metadata: {
      email,
      dob,
      tob,
      pob,
      reportType,
      lang,
      birthTimeUnknown: birthTimeUnknownParam,
    },
  });

  return NextResponse.json({ url: session.url });
}

