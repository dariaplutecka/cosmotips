import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/authSession";
import { createProSubscriptionStripeCheckoutUrl } from "@/lib/proSubscriptionCheckout";
import { AppLangSchema, CheckoutPayloadSchema } from "@/lib/reportSchema";

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

  const baseUrl = getBaseUrl(request);
  const result = await createProSubscriptionStripeCheckoutUrl({
    email: session.email,
    name: parsed.data.name,
    dob: parsed.data.dob,
    tob: parsed.data.tob,
    pob: parsed.data.pob,
    birthTimeUnknown: parsed.data.birthTimeUnknown,
    lang: parsed.data.lang,
    interval: parsed.data.interval,
    baseUrl,
  });

  if ("error" in result) {
    return NextResponse.json(
      { error: "Subscription price is not configured." },
      { status: 503 },
    );
  }

  return NextResponse.json({ url: result.url });
}
