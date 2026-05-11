import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { AppLangSchema, CheckoutPayloadSchema } from "@/lib/reportSchema";
import { addTarotTokens } from "@/lib/tarotTokenStore";
import { tarotCopy } from "@/lib/uiCopy";
import { getAuthSession } from "@/lib/authSession";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/requestIp";

const TarotCheckoutPayloadSchema = z.object({
  email: CheckoutPayloadSchema.shape.email,
  lang: AppLangSchema.default("en"),
  packageSize: z.enum(["1", "3"]).default("1"),
});

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(`tarot-checkout:${getClientIp(request)}`);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = TarotCheckoutPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { lang, packageSize } = parsed.data;
  const session = await getAuthSession();
  const email = session?.email ?? parsed.data.email;
  const tokensToAdd = packageSize === "3" ? 3 : 1;
  const unitAmount = packageSize === "3" ? 1000 : 500;
  const baseUrl = getBaseUrl(request);
  const stripeMode = process.env.STRIPE_MODE ?? "test";
  const skipPaymentForDev =
    stripeMode !== "live" &&
    (process.env.STRIPE_SKIP_PAYMENT_FOR_DEV ?? "false") === "true";

  if (skipPaymentForDev) {
    await addTarotTokens(email, tokensToAdd);
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
          unit_amount: unitAmount,
          product_data: {
            name: tarotCopy[lang].buyTokens,
            description: `${tokensToAdd} tarot token${tokensToAdd === 1 ? "" : "s"}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      product: "tarot_tokens",
      email,
      tokensToAdd: String(tokensToAdd),
    },
    customer_email: email,
    success_url: `${baseUrl}/?tab=tarot&lang=${lang}&payment=success&email=${encodeURIComponent(email)}`,
    cancel_url: `${baseUrl}/?tab=tarot&lang=${lang}&payment=cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
