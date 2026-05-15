import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAI } from "@/lib/openai";
import { AppLangSchema, CheckoutPayloadSchema } from "@/lib/reportSchema";
import { drawCards } from "@/lib/tarotDeck";
import { sendTarotEmail } from "@/lib/reportEmail";
import {
  buildCelticCrossPrompt,
  buildDailyCardPrompt,
  buildThreeCardPrompt,
  tarotDailyPersonalizationKey,
} from "@/lib/tarotPrompt";
import { calculateNumerologyTarotCard } from "@/lib/tarotNumerology";
import {
  addTarotTokens,
  deductTarotToken,
} from "@/lib/tarotTokenStore";
import {
  currentDailyTarotDate,
  drawDailyCard,
  getCachedDailyInterpretation,
  setCachedDailyInterpretation,
} from "@/lib/tarotDailyStore";
import { getAuthSession } from "@/lib/authSession";

const TarotGeneratePayloadSchema = z.object({
  email: CheckoutPayloadSchema.shape.email.optional(),
  guestId: z.string().trim().min(8).max(120).optional(),
  name: z.string().trim().min(1).max(80),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  spreadType: z.enum(["daily_card", "three_card", "celtic_cross"]),
  topic: z.enum(["love", "finance_career", "health"]).default("love"),
  lang: AppLangSchema.default("en"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = TarotGeneratePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const session = await getAuthSession();
  const { guestId, name, birthDate, spreadType, topic, lang } = parsed.data;
  const email = spreadType === "daily_card" ? undefined : session?.email ?? parsed.data.email;
  const dailyDate = currentDailyTarotDate();

  let tokenDeducted = false;
  let dailyCardClaimed = false;
  try {
    if (spreadType === "daily_card") {
      dailyCardClaimed = true;
    } else {
      if (!email) {
        return NextResponse.json({ error: "Invalid input." }, { status: 400 });
      }
      tokenDeducted = await deductTarotToken(email);
      if (!tokenDeducted) {
        return NextResponse.json({ error: "no_tokens" }, { status: 402 });
      }
    }
  } catch (err) {
    console.error("[tarot/generate] token store unavailable:", err);
    return NextResponse.json(
      { error: "token_store_unavailable" },
      { status: 503 },
    );
  }
  const cardCount = spreadType === "three_card" ? 3 : 10;
  const dailyIdentifier = guestId || email || "anonymous";
  const dailyPersonalizationKey = tarotDailyPersonalizationKey(name);
  const cards =
    spreadType === "daily_card" ? [drawDailyCard(dailyIdentifier, dailyDate)] : drawCards(cardCount);
  const prompt =
    spreadType === "daily_card"
      ? buildDailyCardPrompt(cards, lang, name)
      : spreadType === "three_card"
        ? buildThreeCardPrompt(cards, topic, lang, {
            name,
            birthDate,
            numerologyCard: calculateNumerologyTarotCard(birthDate, lang),
          })
        : buildCelticCrossPrompt(cards, topic, lang, {
            name,
            birthDate,
            numerologyCard: calculateNumerologyTarotCard(birthDate, lang),
          });

  const cachedDailyInterpretation =
    spreadType === "daily_card"
      ? await getCachedDailyInterpretation(cards[0], lang, dailyDate, dailyPersonalizationKey)
      : null;
  if (cachedDailyInterpretation) {
    return NextResponse.json({
      cards,
      interpretation: cachedDailyInterpretation,
      dailyCardClaimed,
    });
  }

  let completion;
  try {
    const openai = getOpenAI();
    completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.85,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    console.error("[tarot/generate] OpenAI generation failed:", err);
    if (tokenDeducted && email) await addTarotTokens(email, 1);
    return NextResponse.json(
      { error: "ai_generation_failed" },
      { status: 502 },
    );
  }
  const interpretation = completion.choices[0]?.message.content ?? "";
  if (!interpretation.trim()) {
    if (tokenDeducted && email) await addTarotTokens(email, 1);
    return NextResponse.json(
      { error: "ai_generation_failed" },
      { status: 502 },
    );
  }
  if (spreadType === "daily_card") {
    await setCachedDailyInterpretation(
      cards[0],
      lang,
      interpretation,
      dailyDate,
      dailyPersonalizationKey,
    );
  }
  if (email) {
    await sendTarotEmail({ email, cards, interpretation, spreadType, topic, lang });
  }

  return NextResponse.json({ cards, interpretation, dailyCardClaimed });
}
