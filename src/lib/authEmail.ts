import { Resend } from "resend";
import type { AppLang } from "@/lib/reportSchema";
import { formatResendSendError } from "@/lib/resendFormatError";

function subject(lang: AppLang): string {
  if (lang === "pl") return "Twój link logowania do CosmoTips";
  if (lang === "es") return "Tu enlace de acceso a CosmoTips";
  return "Your CosmoTips sign-in link";
}

function cta(lang: AppLang): string {
  if (lang === "pl") return "Zaloguj się do CosmoTips";
  if (lang === "es") return "Iniciar sesión en CosmoTips";
  return "Sign in to CosmoTips";
}

function intro(lang: AppLang): string {
  if (lang === "pl") {
    return "Kliknij poniższy przycisk, aby bezpiecznie zalogować się do CosmoTips. Link wygaśnie za 15 minut.";
  }
  if (lang === "es") {
    return "Haz clic en el botón para iniciar sesión de forma segura en CosmoTips. El enlace caduca en 15 minutos.";
  }
  return "Click the button below to securely sign in to CosmoTips. This link expires in 15 minutes.";
}

export async function sendMagicLinkEmail(opts: {
  email: string;
  url: string;
  lang: AppLang;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.REPORT_EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    throw new Error("Email delivery is not configured.");
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: opts.email,
    subject: subject(opts.lang),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f1635">
        <h1 style="margin:0 0 16px;color:#5b21b6">CosmoTips</h1>
        <p>${intro(opts.lang)}</p>
        <p>
          <a href="${opts.url}" style="display:inline-block;border-radius:999px;background:#8b5cf6;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">
            ${cta(opts.lang)}
          </a>
        </p>
        <p style="font-size:12px;color:#6b7280">If you did not request this link, you can ignore this email.</p>
      </div>
    `,
    text: `${intro(opts.lang)}\n\n${opts.url}`,
  });

  if (result.error) {
    throw new Error(formatResendSendError(result.error));
  }
}
