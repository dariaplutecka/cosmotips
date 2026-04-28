import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { AppLangSchema, CheckoutPayloadSchema } from "@/lib/reportSchema";
import { tarotCopy } from "@/lib/uiCopy";

const TarotCheckoutPayloadSchema = z.object({
  email: CheckoutPayloadSchema.shape.email,
  lang: AppLangSchema.default("en"),
});

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = TarotCheckoutPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { email, lang } = parsed.data;
  const stripe = getStripe();
  const baseUrl = getBaseUrl();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: 500,
          product_data: {
            name: tarotCopy[lang].buyTokens,
            description: tarotCopy[lang].pageSubtitle,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      product: "tarot_tokens",
      email,
      tokensToAdd: "3",
    },
    customer_email: email,
    success_url: `${baseUrl}/tarot?lang=${lang}&payment=success&email=${encodeURIComponent(email)}`,
    cancel_url: `${baseUrl}/tarot?lang=${lang}&payment=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
