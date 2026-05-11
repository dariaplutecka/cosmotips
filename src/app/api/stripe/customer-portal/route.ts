import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/authSession";
import { getStripe } from "@/lib/stripe";
import { getProSubscription } from "@/lib/subscriptionStore";

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const subscription = await getProSubscription(session.email);
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found." }, { status: 404 });
  }

  const stripe = getStripe();
  const baseUrl = getBaseUrl(request);
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${baseUrl}/`,
  });

  return NextResponse.json({ url: portalSession.url });
}
