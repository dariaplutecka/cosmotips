import { Resend } from "resend";
import type { AppLang } from "@/lib/reportSchema";
import { formatResendSendError } from "@/lib/resendFormatError";
import { reportEmailCopy, tarotCopy } from "@/lib/uiCopy";
import {
  parseMarkdownBlocks,
  type MarkdownBlock,
} from "@/lib/reportMarkdownBlocks";
import {
  celticCrossPositions,
  type SpreadType,
  type TarotCard,
  type TarotTopic,
} from "@/lib/tarotDeck";

function pdfFilename(reportType: string): string {
  const safe = reportType.replace(/[^a-z0-9_-]/gi, "-").toLowerCase() || "report";
  return `Cosmotips-${safe}.pdf`;
}

export type SendReportPdfResult =
  | { sent: true }
  | { sent: false; reason: "no_api_key" | "no_from" | "send_failed"; detail?: string };

export type SendTarotEmailResult = SendReportPdfResult;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function tarotEmailTitle(lang: AppLang): string {
  if (lang === "pl") return "Twój rozkład tarota";
  if (lang === "es") return "Tu lectura de tarot";
  return "Your tarot reading";
}

function tarotFooterText(lang: AppLang): string {
  if (lang === "pl") return "Wróć do CosmoTips";
  if (lang === "es") return "Volver a CosmoTips";
  return "Back to CosmoTips";
}

function tarotCardName(card: TarotCard, lang: AppLang): string {
  if (lang === "pl") {
    return card.reversed ? `${card.namePl} (odwrócona)` : card.namePl;
  }
  if (lang === "es") {
    return card.reversed ? `${card.nameEs} (invertida)` : card.nameEs;
  }
  return card.reversed ? `${card.name} (Reversed)` : card.name;
}

function tarotCardEmoji(card: TarotCard): string {
  if (card.arcana === "major") return "✦";
  if (card.name.includes("Wands")) return "🔥";
  if (card.name.includes("Cups")) return "💧";
  if (card.name.includes("Swords")) return "⚔️";
  return "🪙";
}

function tarotTopicLabel(topic: TarotTopic, lang: AppLang): string {
  if (topic === "love") {
    if (lang === "pl") return "Miłość i relacje";
    if (lang === "es") return "Amor y relaciones";
    return "Love & Relationships";
  }
  if (topic === "finance_career") {
    if (lang === "pl") return "Kariera i finanse";
    if (lang === "es") return "Carrera y finanzas";
    return "Career & Finance";
  }
  if (lang === "pl") return "Zdrowie";
  if (lang === "es") return "Salud";
  return "Health";
}

function tarotPositions(spreadType: SpreadType, lang: AppLang): string[] {
  if (spreadType === "daily_card") {
    if (lang === "pl") return ["Karta dnia"];
    if (lang === "es") return ["Carta del Día"];
    return ["Card of the Day"];
  }
  if (spreadType === "celtic_cross") return celticCrossPositions[lang];
  if (lang === "pl") return ["Przeszłość", "Teraźniejszość", "Przyszłość"];
  if (lang === "es") return ["Pasado", "Presente", "Futuro"];
  return ["Past", "Present", "Future"];
}

function tarotCardsHtml(
  cards: TarotCard[],
  spreadType: SpreadType,
  lang: AppLang,
): string {
  const positions = tarotPositions(spreadType, lang);
  if (spreadType === "daily_card") {
    const card = cards[0];
    if (!card) return "";
    return `
      <div style="display:block;margin:22px 0 26px;text-align:center;">
        <div style="display:inline-block;width:260px;max-width:100%;vertical-align:top;border:1px solid rgba(201,168,76,0.42);border-radius:22px;background:#241744;padding:22px 16px;">
          <div style="font-size:34px;line-height:1;margin-bottom:12px;">${tarotCardEmoji(card)}</div>
          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#c9a84c;margin-bottom:10px;">${escapeHtml(positions[0] ?? "")}</div>
          <div style="font-size:19px;font-weight:700;color:#fff7dd;">${escapeHtml(tarotCardName(card, lang))}</div>
        </div>
      </div>
    `;
  }
  if (spreadType === "three_card") {
    return `
      <div style="display:block;margin:22px 0 26px;text-align:center;">
        ${cards
          .map(
            (card, index) => `
              <div style="display:inline-block;width:30%;min-width:145px;margin:0 1%;vertical-align:top;border:1px solid rgba(201,168,76,0.42);border-radius:18px;background:#241744;padding:16px 12px;">
                <div style="font-size:26px;line-height:1;margin-bottom:10px;">${tarotCardEmoji(card)}</div>
                <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#c9a84c;margin-bottom:8px;">${escapeHtml(positions[index] ?? "")}</div>
                <div style="font-size:16px;font-weight:700;color:#fff7dd;">${escapeHtml(tarotCardName(card, lang))}</div>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  return `
    <ol style="margin:20px 0 26px;padding:0;list-style:none;">
      ${cards
        .map(
          (card, index) => `
            <li style="margin:0 0 10px;padding:13px 15px;border:1px solid rgba(201,168,76,0.34);border-radius:14px;background:#241744;color:#f5ecff;">
              <span style="color:#c9a84c;font-weight:700;">${tarotCardEmoji(card)} ${escapeHtml(positions[index] ?? "")}</span>
              <span style="color:#5d527a;"> · </span>
              <strong style="color:#fff7dd;">${escapeHtml(tarotCardName(card, lang))}</strong>
            </li>
          `,
        )
        .join("")}
    </ol>
  `;
}

function markdownBlocksToTarotEmailHtml(blocks: MarkdownBlock[]): string {
  const h2Style =
    "margin:26px 0 10px;color:#e9ddff;font-size:1.125rem;font-weight:600;line-height:1.35;font-family:Arial,Helvetica,sans-serif;";
  const parts: string[] = [];

  function walk(tokens: MarkdownBlock[]): void {
    for (const token of tokens) {
      switch (token.type) {
        case "heading":
          parts.push(`<h2 style="${h2Style}">${escapeHtml(token.text)}</h2>`);
          break;
        case "paragraph":
          parts.push(
            `<p style="margin:0 0 16px;color:#f2ecff;font-size:16px;line-height:1.75;">${escapeHtml(token.text).replace(/\n/g, "<br />")}</p>`,
          );
          break;
        case "list": {
          const tag = token.ordered ? "ol" : "ul";
          const items = token.items
            .map((item) => `<li style="margin:0 0 6px;">${escapeHtml(item)}</li>`)
            .join("");
          parts.push(
            `<${tag} style="margin:0 0 16px;padding-left:22px;color:#f2ecff;font-size:16px;line-height:1.75;">${items}</${tag}>`,
          );
          break;
        }
        case "hr":
          parts.push(
            `<div role="presentation" style="height:1px;background:rgba(201,168,76,0.35);margin:18px 0;"></div>`,
          );
          break;
        case "code":
          parts.push(
            `<pre style="font-size:13px;line-height:1.5;color:#e0d8f4;margin:0 0 16px;padding:12px;border-radius:12px;background:#1f1538;white-space:pre-wrap;font-family:ui-monospace,monospace;">${escapeHtml(token.text)}</pre>`,
          );
          break;
        case "blockquote":
          if (token.blocks.length) {
            parts.push(
              `<blockquote style="margin:0 0 16px;padding:0 0 0 14px;border-left:3px solid rgba(167,139,250,0.55);">${markdownBlocksToTarotEmailHtml(token.blocks)}</blockquote>`,
            );
          } else {
            parts.push(
              `<blockquote style="margin:0 0 16px;padding:0 0 0 14px;border-left:3px solid rgba(167,139,250,0.55);color:#ddd6fe;font-size:16px;line-height:1.75;"><p style="margin:0;">${escapeHtml(token.text)}</p></blockquote>`,
            );
          }
          break;
        default:
          break;
      }
    }
  }

  walk(blocks);
  return parts.join("");
}

function markdownBlocksToTarotPlainText(blocks: MarkdownBlock[]): string {
  const lines: string[] = [];
  for (const token of blocks) {
    switch (token.type) {
      case "heading":
        lines.push(token.text);
        lines.push("");
        break;
      case "paragraph":
        lines.push(token.text);
        lines.push("");
        break;
      case "list": {
        let n = Number.isFinite(token.start) ? token.start : 1;
        for (const item of token.items) {
          lines.push(token.ordered ? `${n++}. ${item}` : `- ${item}`);
        }
        lines.push("");
        break;
      }
      case "hr":
        lines.push("—");
        lines.push("");
        break;
      case "code":
        lines.push(token.text);
        lines.push("");
        break;
      case "blockquote":
        if (token.blocks.length) {
          lines.push(markdownBlocksToTarotPlainText(token.blocks));
          lines.push("");
        } else if (token.text) {
          lines.push(token.text);
          lines.push("");
        }
        break;
      default:
        break;
    }
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function tarotInterpretationHtml(interpretation: string): string {
  return markdownBlocksToTarotEmailHtml(parseMarkdownBlocks(interpretation));
}

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

export async function sendTarotEmail(opts: {
  email: string;
  cards: TarotCard[];
  interpretation: string;
  spreadType: SpreadType;
  topic: TarotTopic;
  lang: AppLang;
}): Promise<SendTarotEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.REPORT_EMAIL_FROM?.trim();

  if (!apiKey) {
    console.warn("[tarotEmail] RESEND_API_KEY is not set; skipping email.");
    return { sent: false, reason: "no_api_key" };
  }
  if (!from) {
    console.warn("[tarotEmail] REPORT_EMAIL_FROM is not set; skipping email.");
    return { sent: false, reason: "no_from" };
  }

  const to = opts.email.trim();
  if (!to.includes("@")) {
    return { sent: false, reason: "send_failed", detail: "Invalid recipient" };
  }

  const copy = tarotCopy[opts.lang];
  const title = tarotEmailTitle(opts.lang);
  const spreadName =
    opts.spreadType === "daily_card"
      ? copy.dailyCard
      : opts.spreadType === "three_card"
        ? copy.threeCard
        : copy.celticCross;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "https://cosmotips.vercel.app";
  const positions = tarotPositions(opts.spreadType, opts.lang);
  const spreadContext =
    opts.spreadType === "daily_card"
      ? spreadName
      : `${spreadName} · ${tarotTopicLabel(opts.topic, opts.lang)}`;
  const cardsText = opts.cards
    .map(
      (card, index) =>
        `${positions[index] ?? index + 1}: ${tarotCardName(card, opts.lang)}`,
    )
    .join("\n");
  const interpretationPlain = markdownBlocksToTarotPlainText(
    parseMarkdownBlocks(opts.interpretation),
  );
  const text = `${title}\n${spreadContext}\n\n${cardsText}\n\n${interpretationPlain}\n\nCosmoTips — ${baseUrl}`;
  const html = `
    <div style="margin:0;padding:0;background:#1a1033;color:#f7f0ff;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:720px;margin:0 auto;padding:34px 20px;">
        <div style="border:1px solid rgba(201,168,76,0.34);border-radius:26px;background:linear-gradient(180deg,#241744 0%,#1a1033 100%);padding:30px;box-shadow:0 18px 60px rgba(0,0,0,0.35);">
          <div style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a84c;font-weight:700;">CosmoTips</div>
          <h1 style="margin:10px 0 8px;color:#fff7dd;font-size:30px;line-height:1.18;">${escapeHtml(title)}</h1>
          <p style="margin:0 0 18px;color:#d8cdeb;font-size:15px;line-height:1.6;">${escapeHtml(spreadContext)}</p>
          ${tarotCardsHtml(opts.cards, opts.spreadType, opts.lang)}
          <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.7),transparent);margin:6px 0 24px;"></div>
          <div>${tarotInterpretationHtml(opts.interpretation)}</div>
          <div style="margin-top:30px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.1);color:#b9acd3;font-size:13px;line-height:1.6;">
            <strong style="color:#fff7dd;">CosmoTips</strong><br />
            <a href="${escapeHtml(baseUrl)}" style="color:#c9a84c;text-decoration:none;">${escapeHtml(tarotFooterText(opts.lang))}</a>
          </div>
        </div>
      </div>
    </div>
  `;

  const resend = new Resend(apiKey);
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: title,
      html,
      text,
    });
    if (error) {
      const detail = formatResendSendError(error);
      console.error("[tarotEmail] Resend error:", detail, error);
      return { sent: false, reason: "send_failed", detail };
    }
    if (!data?.id) {
      return { sent: false, reason: "send_failed", detail: "No message id" };
    }
    return { sent: true };
  } catch (e) {
    const detail = formatResendSendError(e);
    console.error("[tarotEmail] Resend send threw:", detail, e);
    return { sent: false, reason: "send_failed", detail };
  }
}
