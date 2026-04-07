import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { CheckoutPayloadSchema } from "@/lib/reportSchema";

export async function POST(req: Request) {
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

  const { email, dob, tob, pob, reportType, lang } = parsed.data;

  const stripeMode = process.env.STRIPE_MODE ?? "test";
  const skipPaymentForDev =
    stripeMode !== "live" &&
    (process.env.STRIPE_SKIP_PAYMENT_FOR_DEV ?? "false") === "true";

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
                  : "30-day forecast from purchase date",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel`,
    metadata: {
      email,
      dob,
      tob,
      pob,
      reportType,
      lang,
    },
  });

  return NextResponse.json({ url: session.url });
}

