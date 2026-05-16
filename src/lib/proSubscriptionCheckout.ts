import { getStripe } from "@/lib/stripe";
import type { AppLang } from "@/lib/reportSchema";
import {
  type ProBillingInterval,
  setProSubscriberProfile,
} from "@/lib/subscriptionStore";

function priceIdForInterval(interval: ProBillingInterval): string | null {
  const key =
    interval === "monthly"
      ? "STRIPE_PRO_MONTHLY_PRICE_ID"
      : "STRIPE_PRO_YEARLY_PRICE_ID";
  return process.env[key]?.trim() || null;
}

export async function createProSubscriptionStripeCheckoutUrl(opts: {
  email: string;
  name: string;
  dob: string;
  tob: string;
  pob: string;
  birthTimeUnknown: boolean;
  lang: AppLang;
  interval: ProBillingInterval;
  baseUrl: string;
}): Promise<{ url: string } | { error: string }> {
  const priceId = priceIdForInterval(opts.interval);
  if (!priceId) {
    return { error: "subscription_price_not_configured" };
  }

  await setProSubscriberProfile({
    email: opts.email,
    name: opts.name,
    dob: opts.dob,
    tob: opts.tob,
    pob: opts.pob,
    birthTimeUnknown: opts.birthTimeUnknown,
    lang: opts.lang,
  });

  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: opts.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${opts.baseUrl}/?lang=${encodeURIComponent(opts.lang)}&subscription=success`,
    cancel_url: `${opts.baseUrl}/?lang=${encodeURIComponent(opts.lang)}&subscription=cancelled`,
    metadata: {
      product: "pro_subscription",
      email: opts.email,
      billingInterval: opts.interval,
    },
    subscription_data: {
      metadata: {
        product: "pro_subscription",
        email: opts.email,
        billingInterval: opts.interval,
      },
    },
  });

  const url = checkoutSession.url;
  if (!url) return { error: "stripe_no_checkout_url" };
  return { url };
}
