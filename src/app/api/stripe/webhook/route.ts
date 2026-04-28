import { NextResponse } from "next/server";
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

/** pdfmake + Stripe webhook verification need Node (not Edge). */
export const runtime = "nodejs";

/** OpenAI + PDF + Resend can take longer than the default serverless timeout. */
export const maxDuration = 120;

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

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const sessionId = session.id;
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
