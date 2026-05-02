import type { AppLang } from "@/lib/reportSchema";
import { tarotDeck } from "@/lib/tarotDeck";

export type NumerologyTarotCard = {
  number: number;
  name: string;
};

function localizedCardName(cardId: number, lang: AppLang): string {
  const card = tarotDeck.find((item) => item.id === cardId);
  if (!card) return lang === "pl" ? "Głupiec" : lang === "es" ? "El Loco" : "The Fool";
  if (lang === "pl") return card.namePl;
  if (lang === "es") return card.nameEs;
  return card.name;
}

function reduceToMajorArcana(value: number): number {
  let current = value;
  while (current > 22) {
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current === 22 ? 0 : current;
}

export function calculateNumerologyTarotCard(
  birthDate: string,
  lang: AppLang,
): NumerologyTarotCard {
  const digitSum = birthDate
    .replace(/\D/g, "")
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);
  const cardId = reduceToMajorArcana(digitSum);
  return {
    number: cardId === 0 ? 22 : cardId,
    name: localizedCardName(cardId, lang),
  };
}
