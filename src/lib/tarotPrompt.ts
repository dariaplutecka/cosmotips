import type { AppLang } from "@/lib/reportSchema";
import {
  celticCrossPositions,
  type SpreadType,
  type TarotCard,
  type TarotTopic,
} from "@/lib/tarotDeck";

const cardNames: Record<AppLang, (card: TarotCard) => string> = {
  en: (card) => (card.reversed ? `${card.name} (Reversed)` : card.name),
  pl: (card) => (card.reversed ? `${card.namePl} (odwrócona)` : card.namePl),
  es: (card) => (card.reversed ? `${card.nameEs} (invertida)` : card.nameEs),
};

const threeCardPositions: Record<AppLang, string[]> = {
  en: ["Past", "Present", "Future"],
  pl: ["Przeszłość", "Teraźniejszość", "Przyszłość"],
  es: ["Pasado", "Presente", "Futuro"],
};

const topicLabels: Record<TarotTopic, Record<AppLang, string>> = {
  love: {
    en: "Love",
    pl: "Miłość",
    es: "Amor",
  },
  finance_career: {
    en: "Finance & Career",
    pl: "Finanse i Kariera",
    es: "Finanzas y Carrera",
  },
  health: {
    en: "Health",
    pl: "Zdrowie",
    es: "Salud",
  },
};

function cardLines(
  cards: TarotCard[],
  positions: string[],
  lang: AppLang,
): string {
  const getName = cardNames[lang];
  return cards
    .map((card, index) => `- ${positions[index] ?? `Card ${index + 1}`}: ${getName(card)}`)
    .join("\n");
}

export function buildThreeCardPrompt(
  cards: TarotCard[],
  lang: AppLang,
): string {
  const cardsBlock = cardLines(cards, threeCardPositions[lang], lang);

  if (lang === "pl") {
    return `Jesteś doświadczoną tarolożką i mistyczką. Wykonaj interpretację rozkładu 3 kart dla osoby pytającej.

Karty:
${cardsBlock}

Napisz głęboką, poetycką interpretację w języku polskim (ok. 400-600 słów). Dla każdej pozycji napisz osobny akapit. Zakończ ogólnym podsumowaniem i przesłaniem. Ton: mistyczny, ciepły, pomocny — nie strasz.`;
  }

  if (lang === "es") {
    return `Eres una tarotista experta y mística. Realiza una interpretación de la tirada de 3 cartas.

Cartas:
${cardsBlock}

Escribe una interpretación profunda y poética en español (aprox. 400-600 palabras). Escribe un párrafo por posición. Termina con un resumen y mensaje general. Tono: místico, cálido, útil — no aterrorices.`;
  }

  return `You are an experienced tarot reader and mystic. Perform a three-card spread interpretation.

Cards:
${cardsBlock}

Write a deep, poetic interpretation in English (approx. 400-600 words). Write a separate paragraph for each position. End with an overall summary and message. Tone: mystical, warm, helpful — not scary.`;
}

export function buildCelticCrossPrompt(
  cards: TarotCard[],
  topic: TarotTopic,
  lang: AppLang,
): string {
  const topicLabel = topicLabels[topic][lang];
  const cardsBlock = cardLines(cards, celticCrossPositions[lang], lang);

  if (lang === "pl") {
    return `Jesteś doświadczoną tarolożką i mistyczką. Wykonaj interpretację rozkładu Krzyża Celtyckiego dla osoby pytającej.

Temat: ${topicLabel}

Karty:
${cardsBlock}

Napisz głęboką, poetycką interpretację w języku polskim (ok. 900-1300 słów). Uwzględnij wszystkie 10 pozycji i pokaż, jak karty tworzą wspólną opowieść wokół tematu. Dla każdej pozycji napisz osobny akapit lub część akapitu z wyraźnym sensem. Zakończ syntetycznym podsumowaniem i przesłaniem. Ton: mistyczny, ciepły, pomocny — nie strasz i nie przedstawiaj kart jako wyroku.`;
  }

  if (lang === "es") {
    return `Eres una tarotista experta y mística. Realiza una interpretación de la Cruz Celta para la persona consultante.

Tema: ${topicLabel}

Cartas:
${cardsBlock}

Escribe una interpretación profunda y poética en español (aprox. 900-1300 palabras). Incluye las 10 posiciones y muestra cómo las cartas forman una historia común alrededor del tema. Para cada posición, escribe un párrafo separado o una parte claramente desarrollada. Termina con una síntesis y un mensaje general. Tono: místico, cálido, útil — no asustes ni presentes las cartas como una sentencia.`;
  }

  return `You are an experienced tarot reader and mystic. Perform a Celtic Cross interpretation for the querent.

Topic: ${topicLabel}

Cards:
${cardsBlock}

Write a deep, poetic interpretation in English (approx. 900-1300 words). Include all 10 positions and show how the cards form one coherent story around the topic. For each position, write a separate paragraph or clearly developed part of a paragraph. End with an overall synthesis and message. Tone: mystical, warm, helpful — not scary, and do not present the cards as a fixed verdict.`;
}

export type { SpreadType, TarotTopic };
