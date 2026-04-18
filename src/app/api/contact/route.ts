import { Resend } from "resend";
import { z } from "zod";
import { formatResendSendError } from "@/lib/resendFormatError";

export const runtime = "nodejs";

const BodySchema = z.object({
  name: z.string().max(120).optional(),
  email: z.string().email().max(254),
  message: z.string().min(10).max(8000),
  lang: z.enum(["en", "pl", "es"]),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const name = parsed.data.name?.trim() || "";
  const { email, message, lang } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.REPORT_EMAIL_FROM?.trim();
  const inbox =
    process.env.CONTACT_INBOX_EMAIL?.trim() || "raporty@cosmotips.eu";

  if (!apiKey || !from) {
    return Response.json({ ok: false, reason: "not_configured" as const });
  }

  const subject =
    lang === "pl"
      ? "[CosmoTips] Wiadomość z formularza kontaktowego"
      : lang === "es"
        ? "[CosmoTips] Mensaje desde el formulario de contacto"
        : "[CosmoTips] Contact form message";

  const displayName = name || "—";
  const html = `<p><strong>Reply-To:</strong> ${escapeHtml(email)}</p>
<p><strong>Name:</strong> ${escapeHtml(displayName)}</p>
<p><strong>Lang:</strong> ${escapeHtml(lang)}</p>
<hr/>
<div style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:15px;line-height:1.5">${escapeHtml(message)}</div>`;

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: inbox,
    replyTo: email,
    subject,
    html,
    text: `From: ${email}\nName: ${displayName}\nLang: ${lang}\n\n${message}`,
  });

  if (error) {
    console.error("[api/contact] Resend:", formatResendSendError(error), error);
    return Response.json(
      { ok: false, reason: "send_failed" as const },
      { status: 502 },
    );
  }

  if (!data?.id) {
    console.error("[api/contact] No message id:", data);
    return Response.json(
      { ok: false, reason: "send_failed" as const },
      { status: 502 },
    );
  }

  return Response.json({ ok: true as const, id: data.id });
}
