import { Resend } from "resend";
import type { AppLang } from "@/lib/reportSchema";
import { formatResendSendError } from "@/lib/resendFormatError";
import { reportEmailCopy } from "@/lib/uiCopy";

function pdfFilename(reportType: string): string {
  const safe = reportType.replace(/[^a-z0-9_-]/gi, "-").toLowerCase() || "report";
  return `Cosmotips-${safe}.pdf`;
}

export type SendReportPdfResult =
  | { sent: true }
  | { sent: false; reason: "no_api_key" | "no_from" | "send_failed"; detail?: string };

export async function sendReportPdfEmail(opts: {
  to: string;
  lang: AppLang;
  reportType: "natal_basic" | "personality" | "weekly" | "monthly";
  pdfBuffer: Buffer;
}): Promise<SendReportPdfResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.REPORT_EMAIL_FROM?.trim();

  if (!apiKey) {
    console.warn("[reportEmail] RESEND_API_KEY is not set; skipping email.");
    return { sent: false, reason: "no_api_key" };
  }
  if (!from) {
    console.warn("[reportEmail] REPORT_EMAIL_FROM is not set; skipping email.");
    return { sent: false, reason: "no_from" };
  }

  const to = opts.to.trim();
  if (!to.includes("@")) {
    console.error("[reportEmail] invalid recipient (missing @):", JSON.stringify(opts.to));
    return {
      sent: false,
      reason: "send_failed",
      detail: "Invalid recipient",
    };
  }

  const copy = reportEmailCopy[opts.lang];
  const resend = new Resend(apiKey);

  try {
    // Resend serializes the body as JSON — PDF must be base64 string, not a Buffer object.
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: copy.subject,
      html: copy.htmlBody,
      text: copy.textBody,
      attachments: [
        {
          filename: pdfFilename(opts.reportType),
          content: opts.pdfBuffer.toString("base64"),
          contentType: "application/pdf",
        },
      ],
    });

    if (error) {
      const detail = formatResendSendError(error);
      console.error("[reportEmail] Resend error:", detail, error);
      return {
        sent: false,
        reason: "send_failed",
        detail,
      };
    }

    if (!data?.id) {
      console.error("[reportEmail] Resend returned no id:", data);
      return { sent: false, reason: "send_failed", detail: "No message id" };
    }

    return { sent: true };
  } catch (e) {
    const detail = formatResendSendError(e);
    console.error("[reportEmail] Resend send threw:", detail, e);
    return { sent: false, reason: "send_failed", detail };
  }
}
