import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getOpenAI } from "@/lib/openai";
import {
  AppLangSchema,
  CheckoutPayloadSchema,
} from "@/lib/reportSchema";
import { buildReportPrompt } from "@/lib/reportPrompts";
import { computeNatalChart } from "@/lib/natalChart";
import { generateReportPdfBuffer } from "@/lib/reportPdf";
import { sendReportPdfEmail } from "@/lib/reportEmail";
import { successUi } from "@/lib/uiCopy";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id." },
      { status: 400 },
    );
  }

  const skipPaymentForDev =
    sessionId.startsWith("dev_") &&
    (process.env.STRIPE_MODE ?? "test") !== "live";

  let email = "";
  let dob = "";
  let tob = "";
  let pob = "";
  let reportTypeRaw = "";
  let langRaw = "";

  if (skipPaymentForDev) {
    email = searchParams.get("email") ?? "";
    dob = searchParams.get("dob") ?? "";
    tob = searchParams.get("tob") ?? "";
    pob = searchParams.get("pob") ?? "";
    reportTypeRaw = searchParams.get("reportType") ?? "";
    langRaw = searchParams.get("lang") ?? "en";
  } else {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed." },
        { status: 402 },
      );
    }

    email =
      session.metadata?.email ??
      session.customer_details?.email ??
      session.customer_email ??
      "";
    dob = session.metadata?.dob ?? "";
    tob = session.metadata?.tob ?? "";
    pob = session.metadata?.pob ?? "";
    reportTypeRaw = session.metadata?.reportType ?? "";
    langRaw = session.metadata?.lang ?? "en";
  }

  const langParsed = AppLangSchema.safeParse(langRaw);
  const lang = langParsed.success ? langParsed.data : "en";

  const parsed = CheckoutPayloadSchema.safeParse({
    email,
    dob,
    tob,
    pob,
    reportType: reportTypeRaw,
    lang,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing report details." },
      { status: 400 },
    );
  }

  let chart;
  try {
    chart = await computeNatalChart({
      dob: parsed.data.dob,
      tob: parsed.data.tob,
      pob: parsed.data.pob,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Chart computation failed.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const openai = getOpenAI();
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: buildReportPrompt({
      dob: parsed.data.dob,
      tob: parsed.data.tob,
      pob: parsed.data.pob,
      reportType: parsed.data.reportType,
      lang: parsed.data.lang,
      chart,
    }),
  });

  const text = extractText(response);
  if (!text) {
    return NextResponse.json(
      { error: "No content returned from AI." },
      { status: 502 },
    );
  }

  const pdfTitle =
    successUi[parsed.data.lang].reportTitle[parsed.data.reportType];

  let emailPdfStatus: "sent" | "skipped" | "failed" = "skipped";
  try {
    const pdfBuffer = await generateReportPdfBuffer(text, pdfTitle);
    const emailResult = await sendReportPdfEmail({
      to: parsed.data.email,
      lang: parsed.data.lang,
      reportType: parsed.data.reportType,
      pdfBuffer,
    });
    if (emailResult.sent) emailPdfStatus = "sent";
    else if (emailResult.reason === "send_failed") emailPdfStatus = "failed";
  } catch (e) {
    console.error("[report/generate] PDF or email:", e);
    emailPdfStatus = "failed";
  }

  return NextResponse.json({
    report: text,
    meta: {
      email: parsed.data.email,
      dob: parsed.data.dob,
      tob: parsed.data.tob,
      pob: parsed.data.pob,
      reportType: parsed.data.reportType,
      lang: parsed.data.lang,
    },
    emailPdf: { status: emailPdfStatus },
  });
}
