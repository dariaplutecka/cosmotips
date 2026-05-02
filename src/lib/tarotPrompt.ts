import type { AppLang } from "@/lib/reportSchema";
import {
  celticCrossPositions,
  type SpreadType,
  type TarotCard,
  type TarotTopic,
} from "@/lib/tarotDeck";
import type { NumerologyTarotCard } from "@/lib/tarotNumerology";

export type TarotQuerentProfile = {
  name: string;
  birthDate: string;
  numerologyCard: NumerologyTarotCard;
};

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

const dailyCardPositions: Record<AppLang, string[]> = {
  en: ["Card of the Day"],
  pl: ["Karta dnia"],
  es: ["Carta del Día"],
};

const topicLabels: Record<TarotTopic, Record<AppLang, string>> = {
  love: {
    en: "Love & Relationships",
    pl: "Miłość i relacje",
    es: "Amor y relaciones",
  },
  finance_career: {
    en: "Career & Finance",
    pl: "Kariera i finanse",
    es: "Carrera y finanzas",
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
  topic: TarotTopic,
  lang: AppLang,
  profile: TarotQuerentProfile,
): string {
  const topicLabel = topicLabels[topic][lang];
  const cardsBlock = cardLines(cards, threeCardPositions[lang], lang);

  if (lang === "pl") {
    return `Jesteś doświadczoną tarolożką i mistyczką. Wykonaj interpretację rozkładu 3 kart dla osoby pytającej.

Obszar analizy: ${topicLabel}
Osoba pytająca: ${profile.name}
Data urodzenia: ${profile.birthDate}
Numerologiczna karta osoby: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Karty:
${cardsBlock}

Napisz głęboką, poetycką interpretację w języku polskim (ok. 400-600 słów). Dla każdej pozycji napisz osobny akapit i odnoś znaczenie kart do wskazanego obszaru analizy. Uwzględnij numerologiczną kartę osoby jako stały filtr temperamentu, potencjału i lekcji życiowej, ale nie rób z niej osobnej sekcji technicznej. Zakończ ogólnym podsumowaniem i przesłaniem. Ton: mistyczny, ciepły, pomocny — nie strasz.`;
  }

  if (lang === "es") {
    return `Eres una tarotista experta y mística. Realiza una interpretación de la tirada de 3 cartas.

Área de análisis: ${topicLabel}
Persona consultante: ${profile.name}
Fecha de nacimiento: ${profile.birthDate}
Carta numerológica personal: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Cartas:
${cardsBlock}

Escribe una interpretación profunda y poética en español (aprox. 400-600 palabras). Escribe un párrafo por posición y conecta el significado de las cartas con el área indicada. Integra la carta numerológica personal como un filtro de temperamento, potencial y aprendizaje vital, sin convertirla en una sección técnica separada. Termina con un resumen y mensaje general. Tono: místico, cálido, útil — no aterrorices.`;
  }

  return `You are an experienced tarot reader and mystic. Perform a three-card spread interpretation.

Area of analysis: ${topicLabel}
Querent: ${profile.name}
Birth date: ${profile.birthDate}
Personal numerology tarot card: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Cards:
${cardsBlock}

Write a deep, poetic interpretation in English (approx. 400-600 words). Write a separate paragraph for each position and connect the card meanings to the selected area of analysis. Integrate the personal numerology tarot card as a steady lens for temperament, potential, and life lesson, but do not turn it into a separate technical section. End with an overall summary and message. Tone: mystical, warm, helpful — not scary.`;
}

export function buildDailyCardPrompt(cards: TarotCard[], lang: AppLang): string {
  const cardsBlock = cardLines(cards, dailyCardPositions[lang], lang);

  if (lang === "pl") {
    return `Jesteś doświadczoną tarolożką i mistyczką. Wykonaj interpretację Karty dnia dla osoby pytającej.

Karta:
${cardsBlock}

Napisz ciepłą, poetycką interpretację w języku polskim (ok. 250-350 słów). Wyjaśnij główne przesłanie karty na dzisiaj, jej energię, praktyczną wskazówkę i krótką afirmację. Ton: mistyczny, wspierający, pomocny — nie strasz i nie przedstawiaj karty jako wyroku.`;
  }

  if (lang === "es") {
    return `Eres una tarotista experta y mística. Realiza una interpretación de la Carta del Día para la persona consultante.

Carta:
${cardsBlock}

Escribe una interpretación cálida y poética en español (aprox. 250-350 palabras). Explica el mensaje principal de la carta para hoy, su energía, una guía práctica y una breve afirmación. Tono: místico, amable, útil — no asustes ni presentes la carta como una sentencia.`;
  }

  return `You are an experienced tarot reader and mystic. Perform a Card of the Day interpretation for the querent.

Card:
${cardsBlock}

Write a warm, poetic interpretation in English (approx. 250-350 words). Explain the card's main message for today, its energy, one practical guidance point, and a short affirmation. Tone: mystical, supportive, helpful — not scary, and do not present the card as a fixed verdict.`;
}

export function buildCelticCrossPrompt(
  cards: TarotCard[],
  topic: TarotTopic,
  lang: AppLang,
  profile: TarotQuerentProfile,
): string {
  const topicLabel = topicLabels[topic][lang];
  const cardsBlock = cardLines(cards, celticCrossPositions[lang], lang);

  if (lang === "pl") {
    return `Jesteś doświadczoną tarolożką i mistyczką. Wykonaj interpretację rozkładu Krzyża Celtyckiego dla osoby pytającej.

Temat: ${topicLabel}
Osoba pytająca: ${profile.name}
Data urodzenia: ${profile.birthDate}
Numerologiczna karta osoby: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Karty:
${cardsBlock}

Napisz głęboką, poetycką interpretację w języku polskim (ok. 900-1300 słów). Uwzględnij wszystkie 10 pozycji i pokaż, jak karty tworzą wspólną opowieść wokół tematu. Wpleć numerologiczną kartę osoby jako tło osobowości, potencjału i lekcji życiowej, które pomaga odczytać rozkład bardziej indywidualnie. Dla każdej pozycji napisz osobny akapit lub część akapitu z wyraźnym sensem. Zakończ syntetycznym podsumowaniem i przesłaniem. Ton: mistyczny, ciepły, pomocny — nie strasz i nie przedstawiaj kart jako wyroku.`;
  }

  if (lang === "es") {
    return `Eres una tarotista experta y mística. Realiza una interpretación de la Cruz Celta para la persona consultante.

Tema: ${topicLabel}
Persona consultante: ${profile.name}
Fecha de nacimiento: ${profile.birthDate}
Carta numerológica personal: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Cartas:
${cardsBlock}

Escribe una interpretación profunda y poética en español (aprox. 900-1300 palabras). Incluye las 10 posiciones y muestra cómo las cartas forman una historia común alrededor del tema. Integra la carta numerológica personal como trasfondo de personalidad, potencial y aprendizaje vital para hacer la lectura más individual. Para cada posición, escribe un párrafo separado o una parte claramente desarrollada. Termina con una síntesis y un mensaje general. Tono: místico, cálido, útil — no asustes ni presentes las cartas como una sentencia.`;
  }

  return `You are an experienced tarot reader and mystic. Perform a Celtic Cross interpretation for the querent.

Topic: ${topicLabel}
Querent: ${profile.name}
Birth date: ${profile.birthDate}
Personal numerology tarot card: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Cards:
${cardsBlock}

Write a deep, poetic interpretation in English (approx. 900-1300 words). Include all 10 positions and show how the cards form one coherent story around the topic. Weave the personal numerology tarot card in as a background of personality, potential, and life lesson that makes the reading more individual. For each position, write a separate paragraph or clearly developed part of a paragraph. End with an overall synthesis and message. Tone: mystical, warm, helpful — not scary, and do not present the cards as a fixed verdict.`;
}

export type { SpreadType, TarotTopic };
