import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { AppLangSchema, CheckoutPayloadSchema } from "@/lib/reportSchema";
import { addTarotTokens } from "@/lib/tarotTokenStore";
import { tarotCopy } from "@/lib/uiCopy";
import { getAuthSession } from "@/lib/authSession";

const TarotCheckoutPayloadSchema = z.object({
  email: CheckoutPayloadSchema.shape.email,
  lang: AppLangSchema.default("en"),
});

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = TarotCheckoutPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { lang } = parsed.data;
  const session = await getAuthSession();
  const email = session?.email ?? parsed.data.email;
  const baseUrl = getBaseUrl(request);
  const stripeMode = process.env.STRIPE_MODE ?? "test";
  const skipPaymentForDev =
    stripeMode !== "live" &&
    (process.env.STRIPE_SKIP_PAYMENT_FOR_DEV ?? "false") === "true";

  if (skipPaymentForDev) {
    await addTarotTokens(email, 1);
    return NextResponse.json({
      url: `${baseUrl}/?tab=tarot&lang=${lang}&payment=success&email=${encodeURIComponent(email)}`,
    });
  }

  const stripe = getStripe();

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
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
      tokensToAdd: "1",
    },
    customer_email: email,
    success_url: `${baseUrl}/?tab=tarot&lang=${lang}&payment=success&email=${encodeURIComponent(email)}`,
    cancel_url: `${baseUrl}/?tab=tarot&lang=${lang}&payment=cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
