import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAI } from "@/lib/openai";
import { AppLangSchema, CheckoutPayloadSchema } from "@/lib/reportSchema";
import { drawCards } from "@/lib/tarotDeck";
import { sendTarotEmail } from "@/lib/reportEmail";
import {
  buildCelticCrossPrompt,
  buildThreeCardPrompt,
} from "@/lib/tarotPrompt";
import {
  deductTarotToken,
  getTarotBalance,
} from "@/lib/tarotTokenStore";

const TarotGeneratePayloadSchema = z.object({
  email: CheckoutPayloadSchema.shape.email,
  spreadType: z.enum(["three_card", "celtic_cross"]),
  topic: z.enum(["love", "finance_career", "health"]).default("love"),
  lang: AppLangSchema.default("en"),
});

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
