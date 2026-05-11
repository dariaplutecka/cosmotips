import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/authSession";
import { getStripe } from "@/lib/stripe";
import { AppLangSchema, CheckoutPayloadSchema } from "@/lib/reportSchema";
import {
  type ProBillingInterval,
  setProSubscriberProfile,
} from "@/lib/subscriptionStore";

const SubscriptionCheckoutSchema = CheckoutPayloadSchema.pick({
  dob: true,
  tob: true,
  pob: true,
  birthTimeUnknown: true,
}).extend({
  name: z.string().trim().min(1).max(80),
  interval: z.enum(["monthly", "yearly"]),
  lang: AppLangSchema.default("en"),
});

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

function priceIdForInterval(interval: ProBillingInterval): string | null {
  const key =
    interval === "monthly"
      ? "STRIPE_PRO_MONTHLY_PRICE_ID"
      : "STRIPE_PRO_YEARLY_PRICE_ID";
  return process.env[key]?.trim() || null;
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = SubscriptionCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const priceId = priceIdForInterval(parsed.data.interval);
  if (!priceId) {
    return NextResponse.json(
      { error: "Subscription price is not configured." },
      { status: 503 },
    );
  }

  await setProSubscriberProfile({
    email: session.email,
    name: parsed.data.name,
    dob: parsed.data.dob,
    tob: parsed.data.tob,
    pob: parsed.data.pob,
    birthTimeUnknown: parsed.data.birthTimeUnknown,
    lang: parsed.data.lang,
  });

  const baseUrl = getBaseUrl(request);
  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: session.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/?lang=${encodeURIComponent(parsed.data.lang)}&subscription=success`,
    cancel_url: `${baseUrl}/?lang=${encodeURIComponent(parsed.data.lang)}&subscription=cancelled`,
    metadata: {
      product: "pro_subscription",
      email: session.email,
      billingInterval: parsed.data.interval,
    },
    subscription_data: {
      metadata: {
        product: "pro_subscription",
        email: session.email,
        billingInterval: parsed.data.interval,
      },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
