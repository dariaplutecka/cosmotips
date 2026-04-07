import { Resend } from "resend";
import type { AppLang } from "@/lib/reportSchema";
import { reportEmailCopy } from "@/lib/uiCopy";

function pdfFilename(reportType: string): string {
  const safe = reportType.replace(/[^a-z0-9_-]/gi, "-").toLowerCase() || "report";
  return `astroapka-${safe}.pdf`;
}

export type SendReportPdfResult =
  | { sent: true }
  | { sent: false; reason: "no_api_key" | "no_from" | "send_failed"; detail?: string };

export async function sendReportPdfEmail(opts: {
  to: string;
  lang: AppLang;
  reportType: "personality" | "weekly" | "monthly";
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

  const copy = reportEmailCopy[opts.lang];
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: copy.subject,
    html: copy.htmlBody,
    text: copy.textBody,
    attachments: [
      {
        filename: pdfFilename(opts.reportType),
        content: opts.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  if (error) {
    console.error("[reportEmail] Resend error:", error);
    return {
      sent: false,
      reason: "send_failed",
      detail: error.message,
    };
  }

  if (!data?.id) {
    console.error("[reportEmail] Resend returned no id:", data);
    return { sent: false, reason: "send_failed", detail: "No message id" };
  }

  return { sent: true };
}
