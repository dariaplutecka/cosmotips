import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

let stripeSingleton: Stripe | null = null;
let stripeModeSingleton: string | null = null;

function getStripeSecret() {
  const mode = process.env.STRIPE_MODE ?? "test";
  if (mode === "live") return requireEnv("STRIPE_SECRET_KEY_LIVE");
  return requireEnv("STRIPE_SECRET_KEY_TEST");
}

export function getStripe() {
  const mode = process.env.STRIPE_MODE ?? "test";
  if (!stripeSingleton || stripeModeSingleton !== mode) {
    const secret = getStripeSecret();
    stripeSingleton = new Stripe(secret);
    stripeModeSingleton = mode;
  }
  return stripeSingleton;
}

