import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { CheckoutPayloadSchema } from "@/lib/reportSchema";
import { checkRateLimit } from "@/lib/rateLimit";

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
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
    const params = new URLSearchParams({
      session_id: sessionId,
      fnb: "1",
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
          unit_amount: 500,
          product_data: {
            name: "Personalized Horoscope Report",
            description:
              reportType === "personality"
                ? "Personality Description"
                : reportType === "weekly"
                  ? "7-day forecast from purchase date"
                  : reportType === "monthly"
                    ? "30-day forecast from purchase date"
                    : "Report",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&lang=${encodeURIComponent(lang)}`,
    cancel_url: `${origin}/cancel?lang=${encodeURIComponent(lang)}`,
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

