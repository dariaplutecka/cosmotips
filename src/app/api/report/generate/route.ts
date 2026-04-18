import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getOpenAI } from "@/lib/openai";
import {
  AppLangSchema,
  CheckoutPayloadSchema,
} from "@/lib/reportSchema";
import { buildNatalBasicFreePrompt, buildReportPrompt } from "@/lib/reportPrompts";
import { computeNatalChart } from "@/lib/natalChart";
import { buildNatalSampleBlurb } from "@/lib/natalSampleBlurb";
import { generateReportPdfBuffer } from "@/lib/reportPdf";
import { sendReportPdfEmail } from "@/lib/reportEmail";
import { successUi } from "@/lib/uiCopy";

/** pdfmake + vfs_fonts need Node (not Edge). */
export const runtime = "nodejs";

/** OpenAI + PDF + Resend może przekroczyć domyślny limit czasu funkcji (np. Vercel Hobby ~10 s). */
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

type EmailPdfPayload = {
  status: "sent" | "skipped" | "failed";
  skipReason?: "no_api_key" | "no_from";
};

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

  const freeNatalBasic =
    searchParams.get("fnb") === "1" && sessionId.startsWith("fnb_");

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
  } else if (freeNatalBasic) {
    email = searchParams.get("email") ?? "";
    dob = searchParams.get("dob") ?? "";
    tob = searchParams.get("tob") ?? "";
    pob = searchParams.get("pob") ?? "";
    reportTypeRaw = searchParams.get("reportType") ?? "";
    langRaw = searchParams.get("lang") ?? "en";
    if (reportTypeRaw !== "natal_basic") {
      return NextResponse.json(
        { error: "Invalid free natal session." },
        { status: 400 },
      );
    }
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

  if (parsed.data.reportType === "natal_basic") {
    const openai = getOpenAI();
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: buildNatalBasicFreePrompt({
        dob: parsed.data.dob,
        tob: parsed.data.tob,
        pob: parsed.data.pob,
        lang: parsed.data.lang,
        chart,
      }),
    });
    const aiText = extractText(response);
    if (!aiText.trim()) {
      return NextResponse.json(
        { error: "No content returned from AI." },
        { status: 502 },
      );
    }
    const blurb = buildNatalSampleBlurb(chart, parsed.data.lang);
    const report = `${blurb}\n\n---\n\n${aiText.trim()}`;

    const pdfTitle = successUi[parsed.data.lang].reportTitle.natal_basic;
    let emailPdf: EmailPdfPayload = { status: "skipped" };
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateReportPdfBuffer(report, pdfTitle);
    } catch (pdfErr) {
      console.error("[report/generate] natal_basic PDF build failed:", pdfErr);
      emailPdf = { status: "failed" };
      return NextResponse.json({
        report,
        meta: {
          email: parsed.data.email,
          dob: parsed.data.dob,
          tob: parsed.data.tob,
          pob: parsed.data.pob,
          reportType: parsed.data.reportType,
          lang: parsed.data.lang,
        },
        emailPdf,
      });
    }
    try {
      const emailResult = await sendReportPdfEmail({
        to: parsed.data.email,
        lang: parsed.data.lang,
        reportType: "natal_basic",
        pdfBuffer,
      });
      if (emailResult.sent) {
        emailPdf = { status: "sent" };
      } else if (emailResult.reason === "send_failed") {
        console.error(
          "[report/generate] natal_basic Resend send_failed:",
          emailResult.detail ?? "(no detail)",
        );
        emailPdf = { status: "failed" };
      } else if (emailResult.reason === "no_api_key") {
        emailPdf = { status: "skipped", skipReason: "no_api_key" };
      } else if (emailResult.reason === "no_from") {
        emailPdf = { status: "skipped", skipReason: "no_from" };
      }
    } catch (emailErr) {
      console.error("[report/generate] natal_basic sendReportPdfEmail threw:", emailErr);
      emailPdf = { status: "failed" };
    }

    return NextResponse.json({
      report,
      meta: {
        email: parsed.data.email,
        dob: parsed.data.dob,
        tob: parsed.data.tob,
        pob: parsed.data.pob,
        reportType: parsed.data.reportType,
        lang: parsed.data.lang,
      },
      emailPdf,
    });
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

  let emailPdf: EmailPdfPayload = { status: "skipped" };
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateReportPdfBuffer(text, pdfTitle);
  } catch (pdfErr) {
    console.error("[report/generate] paid PDF build failed:", pdfErr);
    emailPdf = { status: "failed" };
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
      emailPdf,
    });
  }
  try {
    const emailResult = await sendReportPdfEmail({
      to: parsed.data.email,
      lang: parsed.data.lang,
      reportType: parsed.data.reportType,
      pdfBuffer,
    });
    if (emailResult.sent) {
      emailPdf = { status: "sent" };
    } else if (emailResult.reason === "send_failed") {
      console.error(
        "[report/generate] paid Resend send_failed:",
        emailResult.detail ?? "(no detail)",
      );
      emailPdf = { status: "failed" };
    } else if (emailResult.reason === "no_api_key") {
      emailPdf = { status: "skipped", skipReason: "no_api_key" };
    } else if (emailResult.reason === "no_from") {
      emailPdf = { status: "skipped", skipReason: "no_from" };
    }
  } catch (emailErr) {
    console.error("[report/generate] paid sendReportPdfEmail threw:", emailErr);
    emailPdf = { status: "failed" };
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
    emailPdf,
  });
}
