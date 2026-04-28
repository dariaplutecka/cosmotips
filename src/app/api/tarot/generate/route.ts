import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { getOpenAI } from "@/lib/openai";
import { AppLangSchema, CheckoutPayloadSchema } from "@/lib/reportSchema";
import { drawCards, type SpreadType, type TarotCard, type TarotTopic } from "@/lib/tarotDeck";
import {
  buildCelticCrossPrompt,
  buildThreeCardPrompt,
} from "@/lib/tarotPrompt";
import {
  deductTarotToken,
  getTarotBalance,
} from "@/lib/tarotTokenStore";
import { tarotCopy } from "@/lib/uiCopy";

const TarotGeneratePayloadSchema = z.object({
  email: CheckoutPayloadSchema.shape.email,
  spreadType: z.enum(["three_card", "celtic_cross"]),
  topic: z.enum(["love", "finance_career", "health"]).default("love"),
  lang: AppLangSchema.default("en"),
});

type TarotEmailOpts = {
  email: string;
  cards: TarotCard[];
  interpretation: string;
  spreadType: SpreadType;
  topic: TarotTopic;
  lang: "en" | "pl" | "es";
};

function cardName(card: TarotCard, lang: "en" | "pl" | "es") {
  if (lang === "pl") {
    return card.reversed ? `${card.namePl} (odwrócona)` : card.namePl;
  }
  if (lang === "es") {
    return card.reversed ? `${card.nameEs} (invertida)` : card.nameEs;
  }
  return card.reversed ? `${card.name} (Reversed)` : card.name;
}

async function sendTarotEmail(opts: TarotEmailOpts): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.REPORT_EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    console.warn("[tarot/generate] Resend is not configured; skipping tarot email.");
    return;
  }

  const copy = tarotCopy[opts.lang];
  const spreadName =
    opts.spreadType === "three_card" ? copy.threeCard : copy.celticCross;
  const cardsText = opts.cards
    .map((card, index) => `${index + 1}. ${cardName(card, opts.lang)}`)
    .join("\n");
  const text = `${spreadName}\n\n${cardsText}\n\n${opts.interpretation}`;
  const html = `
    <h1>${copy.pageTitle}</h1>
    <h2>${spreadName}</h2>
    <p>${opts.cards.map((card) => cardName(card, opts.lang)).join(" · ")}</p>
    ${opts.interpretation
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${paragraph.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
      .join("")}
  `;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: opts.email,
    subject: copy.pageTitle,
    html,
    text,
  });

  if (error) {
    console.error("[tarot/generate] Resend tarot email error:", error);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = TarotGeneratePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { email, spreadType, topic, lang } = parsed.data;

  const balance = await getTarotBalance(email);
  if (balance <= 0) {
    return NextResponse.json({ error: "no_tokens" }, { status: 402 });
  }

  const cardCount = spreadType === "three_card" ? 3 : 10;
  const cards = drawCards(cardCount);
  const prompt =
    spreadType === "three_card"
      ? buildThreeCardPrompt(cards, lang)
      : buildCelticCrossPrompt(cards, topic, lang);

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.85,
    messages: [{ role: "user", content: prompt }],
  });
  const interpretation = completion.choices[0]?.message.content ?? "";
  if (!interpretation.trim()) {
    return NextResponse.json(
      { error: "No content returned from AI." },
      { status: 502 },
    );
  }

  const success = await deductTarotToken(email);
  if (!success) {
    return NextResponse.json({ error: "no_tokens" }, { status: 402 });
  }

  await sendTarotEmail({ email, cards, interpretation, spreadType, topic, lang });

  return NextResponse.json({ cards, interpretation });
}
