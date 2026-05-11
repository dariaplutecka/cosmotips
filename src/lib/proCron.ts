import type { AppLang, ReportType } from "@/lib/reportSchema";
import { generateAstrologyReportText } from "@/lib/reportGeneration";
import { generateReportPdfBuffer } from "@/lib/reportPdf";
import { sendReportPdfEmail } from "@/lib/reportEmail";
import {
  getProSubscriberProfile,
  isProSubscriber,
  listActiveProSubscriberEmails,
} from "@/lib/subscriptionStore";
import {
  claimIdempotencyKey,
  proDeliveryKey,
  releaseIdempotencyKey,
} from "@/lib/proDeliveryStore";
import { successUi } from "@/lib/uiCopy";

export function assertCronAuthorized(request: Request): Response | null {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export function currentWeeklyPeriod(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function currentMonthlyPeriod(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function runProReportDelivery(opts: {
  kind: "weekly" | "monthly";
  reportType: Extract<ReportType, "weekly" | "monthly">;
  period: string;
}) {
  const emails = await listActiveProSubscriberEmails();
  const results: Array<{ email: string; status: "sent" | "skipped" | "failed"; error?: string }> =
    [];

  for (const email of emails) {
    try {
      if (!(await isProSubscriber(email))) {
        results.push({ email, status: "skipped" });
        continue;
      }
      const profile = await getProSubscriberProfile(email);
      if (!profile) {
        results.push({ email, status: "failed", error: "Missing profile" });
        continue;
      }
      const claimKey = proDeliveryKey(opts.kind, opts.period, email);
      if (!(await claimIdempotencyKey(claimKey, 60 * 60 * 24 * 60))) {
        results.push({ email, status: "skipped" });
        continue;
      }

      const lang: AppLang = profile.lang;
      const report = await generateAstrologyReportText({
        dob: profile.dob,
        tob: profile.tob,
        pob: profile.pob,
        reportType: opts.reportType,
        lang,
        birthTimeUnknown: profile.birthTimeUnknown,
      });
      const pdfTitle = successUi[lang].reportTitle[opts.reportType];
      const pdfBuffer = await generateReportPdfBuffer(report, pdfTitle);
      const emailResult = await sendReportPdfEmail({
        to: email,
        lang,
        reportType: opts.reportType,
        pdfBuffer,
      });
      if (!emailResult.sent) {
        await releaseIdempotencyKey(claimKey);
        results.push({ email, status: "failed", error: emailResult.reason });
        continue;
      }
      results.push({ email, status: "sent" });
    } catch (err) {
      console.error(`[proCron] ${opts.kind} delivery failed for ${email}:`, err);
      try {
        await releaseIdempotencyKey(proDeliveryKey(opts.kind, opts.period, email));
      } catch (releaseErr) {
        console.error(`[proCron] failed to release idempotency key for ${email}:`, releaseErr);
      }
      results.push({
        email,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return {
    period: opts.period,
    total: emails.length,
    sent: results.filter((r) => r.status === "sent").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  };
}
