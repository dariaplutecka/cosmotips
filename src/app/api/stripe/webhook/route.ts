import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getStripe } from "@/lib/stripe";
import {
  AppLangSchema,
  CheckoutPayloadSchema,
  type ReportType,
} from "@/lib/reportSchema";
import { getOpenAI } from "@/lib/openai";
import { buildNatalBasicFreePrompt, buildReportPrompt } from "@/lib/reportPrompts";
import { computeNatalChart } from "@/lib/natalChart";
import { buildNatalSampleBlurb } from "@/lib/natalSampleBlurb";
import { generateReportPdfBuffer } from "@/lib/reportPdf";
import { sendReportPdfEmail } from "@/lib/reportEmail";
import { getReport, setReport } from "@/lib/reportCache";
import { successUi } from "@/lib/uiCopy";
import { addTarotTokens } from "@/lib/tarotTokenStore";
import { claimIdempotencyKey, proWebhookEventKey } from "@/lib/proDeliveryStore";
import {
  getEmailByStripeCustomerId,
  getEmailByStripeSubscriptionId,
  setProSubscription,
  type ProBillingInterval,
  type ProSubscriptionStatus,
} from "@/lib/subscriptionStore";

/** pdfmake + Stripe webhook verification need Node (not Edge). */
export const runtime = "nodejs";

/** OpenAI + PDF + Resend can take longer than the default serverless timeout. */
export const maxDuration = 120;

let webhookRedis: Redis | undefined;
let webhookRedisMissingEnvWarned = false;

function getWebhookRedisClient(): Redis {
  if (webhookRedis) return webhookRedis;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (!webhookRedisMissingEnvWarned) {
      console.warn(
        "[stripe/webhook] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set; tarot webhook idempotency requires Redis.",
      );
      webhookRedisMissingEnvWarned = true;
    }
    throw new Error("Tarot webhook idempotency storage is not configured.");
  }

  webhookRedis = new Redis({ url, token });
  return webhookRedis;
}

function extractText(resp: unknown): string {
  if (!resp || typeof resp !== "object") return "";
  const output = (resp as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const c of content) {
      if (!c || typeof c !== "object") continue;
      const type = (c as { type?: unknown }).type;
      const text = (c as { text?: unknown }).text;
      if (type === "output_text" && typeof text === "string") return text;
    }
  }

  return "";
}

function objectValue<T = unknown>(value: unknown, key: string): T | undefined {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, T>)[key];
}

function objectId(value: unknown): string | null {
  if (typeof value === "string") return value;
  return objectValue<string>(value, "id") ?? null;
}

function metadataValue(value: unknown, key: string): string | undefined {
  const metadata = objectValue<Record<string, string | undefined>>(value, "metadata");
  return metadata?.[key];
}

function customerEmail(value: unknown): string | undefined {
  const customer = objectValue<{ email?: string }>(value, "customer");
  return customer?.email;
}

function subscriptionStatus(value: unknown): ProSubscriptionStatus {
  return (
    objectValue<string>(value, "status") as ProSubscriptionStatus | undefined
  ) ?? "incomplete";
}

function subscriptionPeriodEnd(value: unknown): number {
  return objectValue<number>(value, "current_period_end") ?? 0;
}

function billingIntervalFromMetadata(value: unknown): ProBillingInterval {
  const interval = metadataValue(value, "billingInterval");
  return interval === "yearly" ? "yearly" : "monthly";
}

function isProSubscriptionObject(value: unknown): boolean {
  return metadataValue(value, "product") === "pro_subscription";
}

async function resolveSubscriptionEmail(opts: {
  email?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
}): Promise<string | null> {
  if (opts.email) return opts.email;
  if (opts.subscriptionId) {
    const bySubscription = await getEmailByStripeSubscriptionId(opts.subscriptionId);
    if (bySubscription) return bySubscription;
  }
  if (opts.customerId) {
    const byCustomer = await getEmailByStripeCustomerId(opts.customerId);
    if (byCustomer) return byCustomer;
  }
  return null;
}

async function persistSubscriptionFromStripeObject(value: unknown) {
  const customerId = objectId(objectValue(value, "customer"));
  const subscriptionId = objectId(value);
  const email = await resolveSubscriptionEmail({
    email: metadataValue(value, "email"),
    customerId,
    subscriptionId,
  });
  if (!email || !customerId || !subscriptionId) {
    throw new Error("Missing subscription email, customer, or subscription id.");
  }
  if (!isProSubscriptionObject(value)) {
    throw new Error("Stripe subscription is not a Pro subscription.");
  }
  await setProSubscription({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    status: subscriptionStatus(value),
    billingInterval: billingIntervalFromMetadata(value),
    currentPeriodEnd: subscriptionPeriodEnd(value),
    cancelAtPeriodEnd: Boolean(objectValue(value, "cancel_at_period_end")),
  });
}

async function generateReportFromCheckoutData(opts: {
  dob: string;
  tob: string;
  pob: string;
  reportType: ReportType;
  lang: "en" | "pl" | "es";
  birthTimeUnknown: boolean;
}) {
  const chart = await computeNatalChart({
    dob: opts.dob,
    tob: opts.tob,
    pob: opts.pob,
  });
  const openai = getOpenAI();

  if (opts.reportType === "natal_basic") {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: buildNatalBasicFreePrompt({
        dob: opts.dob,
        tob: opts.tob,
        pob: opts.pob,
        lang: opts.lang,
        chart,
        birthTimeUnknown: opts.birthTimeUnknown,
      }),
    });
    const aiText = extractText(response);
    if (!aiText.trim()) throw new Error("No content returned from AI.");
    const blurb = buildNatalSampleBlurb(chart, opts.lang);
    return `${blurb}\n\n---\n\n${aiText.trim()}`;
  }

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: buildReportPrompt({
      dob: opts.dob,
      tob: opts.tob,
      pob: opts.pob,
      reportType: opts.reportType,
      lang: opts.lang,
      chart,
      birthTimeUnknown: opts.birthTimeUnknown,
    }),
  });
  const text = extractText(response);
  if (!text) throw new Error("No content returned from AI.");
  return text;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const signature = req.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Missing Stripe webhook secret or signature." },
      { status: 400 },
    );
  }

  let event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    try {
      await persistSubscriptionFromStripeObject(event.data.object);
      return NextResponse.json({ received: true });
    } catch (err) {
      console.error("[stripe/webhook] subscription update failed:", err);
      return NextResponse.json(
        { error: "Subscription update failed." },
        { status: 500 },
      );
    }
  }

  if (event.type === "invoice.paid") {
    try {
      const invoice = event.data.object;
      const customerId = objectId(objectValue(invoice, "customer"));
      const subscriptionId = objectId(objectValue(invoice, "subscription"));
      if (!subscriptionId) throw new Error("Missing subscription id for invoice.");
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (!isProSubscriptionObject(stripeSubscription)) {
        return NextResponse.json({ received: true, ignored: true });
      }
      let email = await resolveSubscriptionEmail({
        email:
          metadataValue(invoice, "email") ??
          metadataValue(stripeSubscription, "email") ??
          customerEmail(invoice),
        customerId,
        subscriptionId,
      });
      if (!email) {
        await persistSubscriptionFromStripeObject(stripeSubscription);
        email = await resolveSubscriptionEmail({
          email: metadataValue(stripeSubscription, "email"),
          customerId: objectId(objectValue(stripeSubscription, "customer")),
          subscriptionId,
        });
      }
      if (!email) throw new Error("Unable to resolve subscription email for invoice.");
      if (!(await claimIdempotencyKey(proWebhookEventKey(event.id), 60 * 60 * 24 * 30))) {
        return NextResponse.json({ received: true, duplicate: true });
      }
      await addTarotTokens(email, 6);
      return NextResponse.json({ received: true });
    } catch (err) {
      console.error("[stripe/webhook] subscription invoice fulfillment failed:", err);
      return NextResponse.json(
        { error: "Subscription invoice fulfillment failed." },
        { status: 500 },
      );
    }
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const sessionId = session.id;
  const metadata = session.metadata;

  if (metadata?.product === "pro_subscription") {
    try {
      if (!(await claimIdempotencyKey(proWebhookEventKey(event.id), 60 * 60 * 24 * 30))) {
        return NextResponse.json({ received: true, duplicate: true });
      }
      const subscriptionId = objectId(session.subscription);
      const customerId = objectId(session.customer);
      if (!subscriptionId || !customerId) {
        throw new Error("Missing subscription or customer id.");
      }
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      const email =
        metadata.email ??
        session.customer_details?.email ??
        session.customer_email ??
        metadataValue(stripeSubscription, "email");
      if (!email) throw new Error("Missing Pro subscription email.");
      await setProSubscription({
        email,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        status: subscriptionStatus(stripeSubscription),
        billingInterval: billingIntervalFromMetadata(stripeSubscription),
        currentPeriodEnd: subscriptionPeriodEnd(stripeSubscription),
        cancelAtPeriodEnd: Boolean(
          objectValue(stripeSubscription, "cancel_at_period_end"),
        ),
      });
      return NextResponse.json({ received: true });
    } catch (err) {
      console.error("[stripe/webhook] pro subscription activation failed:", err);
      return NextResponse.json(
        { error: "Pro subscription activation failed." },
        { status: 500 },
      );
    }
  }

  if (metadata?.product === "tarot_tokens") {
    const email = metadata.email;
    if (!email) {
      return NextResponse.json(
        { error: "Missing tarot token email." },
        { status: 400 },
      );
    }

    const parsedTokens = parseInt(metadata.tokensToAdd ?? "1", 10);
    const tokensToAdd = Number.isFinite(parsedTokens) ? parsedTokens : 1;

    try {
      getWebhookRedisClient();
      if (!(await claimIdempotencyKey(`tarot:webhook:${event.id}`, 60 * 60 * 24 * 30))) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      await addTarotTokens(email, tokensToAdd);
      console.log(`[tarot] Added ${tokensToAdd} tokens for ${email}`);
      return NextResponse.json({ received: true });
    } catch (err) {
      console.error("[stripe/webhook] tarot token fulfillment failed:", err);
      return NextResponse.json(
        { error: "Tarot token fulfillment failed." },
        { status: 500 },
      );
    }
  }

  if (await getReport(sessionId)) {
    console.log("[webhook] cache hit, skipping generation", session.id);
    return NextResponse.json({ received: true, cached: true });
  }

  const langParsed = AppLangSchema.safeParse(session.metadata?.lang ?? "en");
  const lang = langParsed.success ? langParsed.data : "en";
  const parsed = CheckoutPayloadSchema.safeParse({
    email:
      session.metadata?.email ??
      session.customer_details?.email ??
      session.customer_email ??
      "",
    dob: session.metadata?.dob ?? "",
    tob: session.metadata?.tob ?? "",
    pob: session.metadata?.pob ?? "",
    reportType: session.metadata?.reportType ?? "",
    lang,
    birthTimeUnknown: session.metadata?.birthTimeUnknown === "1",
  });

  if (!parsed.success) {
    console.error("[stripe/webhook] missing checkout metadata:", parsed.error.flatten());
    return NextResponse.json(
      { error: "Missing report details." },
      { status: 400 },
    );
  }

  try {
    const report = await generateReportFromCheckoutData({
      dob: parsed.data.dob,
      tob: parsed.data.tob,
      pob: parsed.data.pob,
      reportType: parsed.data.reportType,
      lang: parsed.data.lang,
      birthTimeUnknown: parsed.data.birthTimeUnknown,
    });
    await setReport(sessionId, report);

    const pdfTitle = successUi[parsed.data.lang].reportTitle[parsed.data.reportType];
    const pdfBuffer = await generateReportPdfBuffer(report, pdfTitle);
    const emailResult = await sendReportPdfEmail({
      to: parsed.data.email,
      lang: parsed.data.lang,
      reportType: parsed.data.reportType,
      pdfBuffer,
    });

    if (!emailResult.sent) {
      console.error("[stripe/webhook] report email not sent:", emailResult);
      return NextResponse.json(
        { error: "Report generated but email delivery failed." },
        { status: 500 },
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook] report generation failed:", err);
    return NextResponse.json(
      { error: "Report generation failed." },
      { status: 500 },
    );
  }
}
