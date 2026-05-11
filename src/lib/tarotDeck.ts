import type { AppLang } from "@/lib/reportSchema";

export type SpreadType = "daily_card" | "three_card" | "celtic_cross";
export type TarotTopic = "love" | "finance_career" | "health";

export interface TarotCard {
  id: number;
  name: string;
  namePl: string;
  nameEs: string;
  arcana: "major" | "minor";
  imageUrl: string;
  reversed: boolean;
}

const tarotCardImageBaseUrl = "https://cdn.jsdelivr.net/npm/tarot-card-img@0.1.0";

function tarotImagePath(id: number): string {
  if (id <= 21) return `major/${id}m.jpg`;

  const suits = [
    { start: 22, dir: "wands", suffix: "w" },
    { start: 36, dir: "cups", suffix: "c" },
    { start: 50, dir: "swords", suffix: "s" },
    { start: 64, dir: "pentacles", suffix: "p" },
  ] as const;
  const suit = suits.find(({ start }) => id >= start && id < start + 14);
  if (!suit) return "major/0m.jpg";

  const rank = id - suit.start + 1;
  const courtRank: Record<number, string> = {
    11: "p",
    12: "n",
    13: "q",
    14: "k",
  };
  const fileRank = courtRank[rank] ?? String(rank);
  return `${suit.dir}/${fileRank}${suit.suffix}.jpg`;
}

const rawTarotDeck: Omit<TarotCard, "imageUrl" | "reversed">[] = [
  // Major Arcana (0-21)
  { id: 0, name: "The Fool", namePl: "Głupiec", nameEs: "El Loco", arcana: "major" },
  { id: 1, name: "The Magician", namePl: "Mag", nameEs: "El Mago", arcana: "major" },
  { id: 2, name: "The High Priestess", namePl: "Kapłanka", nameEs: "La Sacerdotisa", arcana: "major" },
  { id: 3, name: "The Empress", namePl: "Cesarzowa", nameEs: "La Emperatriz", arcana: "major" },
  { id: 4, name: "The Emperor", namePl: "Cesarz", nameEs: "El Emperador", arcana: "major" },
  { id: 5, name: "The Hierophant", namePl: "Hierofant", nameEs: "El Hierofante", arcana: "major" },
  { id: 6, name: "The Lovers", namePl: "Kochankowie", nameEs: "Los Amantes", arcana: "major" },
  { id: 7, name: "The Chariot", namePl: "Rydwan", nameEs: "El Carro", arcana: "major" },
  { id: 8, name: "Strength", namePl: "Siła", nameEs: "La Fuerza", arcana: "major" },
  { id: 9, name: "The Hermit", namePl: "Pustelnik", nameEs: "El Ermitaño", arcana: "major" },
  { id: 10, name: "Wheel of Fortune", namePl: "Koło Fortuny", nameEs: "La Rueda de la Fortuna", arcana: "major" },
  { id: 11, name: "Justice", namePl: "Sprawiedliwość", nameEs: "La Justicia", arcana: "major" },
  { id: 12, name: "The Hanged Man", namePl: "Wisielec", nameEs: "El Colgado", arcana: "major" },
  { id: 13, name: "Death", namePl: "Śmierć", nameEs: "La Muerte", arcana: "major" },
  { id: 14, name: "Temperance", namePl: "Umiarkowanie", nameEs: "La Templanza", arcana: "major" },
  { id: 15, name: "The Devil", namePl: "Diabeł", nameEs: "El Diablo", arcana: "major" },
  { id: 16, name: "The Tower", namePl: "Wieża", nameEs: "La Torre", arcana: "major" },
  { id: 17, name: "The Star", namePl: "Gwiazda", nameEs: "La Estrella", arcana: "major" },
  { id: 18, name: "The Moon", namePl: "Księżyc", nameEs: "La Luna", arcana: "major" },
  { id: 19, name: "The Sun", namePl: "Słońce", nameEs: "El Sol", arcana: "major" },
  { id: 20, name: "Judgement", namePl: "Sąd Ostateczny", nameEs: "El Juicio", arcana: "major" },
  { id: 21, name: "The World", namePl: "Świat", nameEs: "El Mundo", arcana: "major" },
  // Minor Arcana - Wands (22-35)
  { id: 22, name: "Ace of Wands", namePl: "As Różdżek", nameEs: "As de Bastos", arcana: "minor" },
  { id: 23, name: "Two of Wands", namePl: "Dwójka Różdżek", nameEs: "Dos de Bastos", arcana: "minor" },
  { id: 24, name: "Three of Wands", namePl: "Trójka Różdżek", nameEs: "Tres de Bastos", arcana: "minor" },
  { id: 25, name: "Four of Wands", namePl: "Czwórka Różdżek", nameEs: "Cuatro de Bastos", arcana: "minor" },
  { id: 26, name: "Five of Wands", namePl: "Piątka Różdżek", nameEs: "Cinco de Bastos", arcana: "minor" },
  { id: 27, name: "Six of Wands", namePl: "Szóstka Różdżek", nameEs: "Seis de Bastos", arcana: "minor" },
  { id: 28, name: "Seven of Wands", namePl: "Siódemka Różdżek", nameEs: "Siete de Bastos", arcana: "minor" },
  { id: 29, name: "Eight of Wands", namePl: "Ósemka Różdżek", nameEs: "Ocho de Bastos", arcana: "minor" },
  { id: 30, name: "Nine of Wands", namePl: "Dziewiątka Różdżek", nameEs: "Nueve de Bastos", arcana: "minor" },
  { id: 31, name: "Ten of Wands", namePl: "Dziesiątka Różdżek", nameEs: "Diez de Bastos", arcana: "minor" },
  { id: 32, name: "Page of Wands", namePl: "Paź Różdżek", nameEs: "Paje de Bastos", arcana: "minor" },
  { id: 33, name: "Knight of Wands", namePl: "Rycerz Różdżek", nameEs: "Caballero de Bastos", arcana: "minor" },
  { id: 34, name: "Queen of Wands", namePl: "Królowa Różdżek", nameEs: "Reina de Bastos", arcana: "minor" },
  { id: 35, name: "King of Wands", namePl: "Król Różdżek", nameEs: "Rey de Bastos", arcana: "minor" },
  // Minor Arcana - Cups (36-49)
  { id: 36, name: "Ace of Cups", namePl: "As Kielichów", nameEs: "As de Copas", arcana: "minor" },
  { id: 37, name: "Two of Cups", namePl: "Dwójka Kielichów", nameEs: "Dos de Copas", arcana: "minor" },
  { id: 38, name: "Three of Cups", namePl: "Trójka Kielichów", nameEs: "Tres de Copas", arcana: "minor" },
  { id: 39, name: "Four of Cups", namePl: "Czwórka Kielichów", nameEs: "Cuatro de Copas", arcana: "minor" },
  { id: 40, name: "Five of Cups", namePl: "Piątka Kielichów", nameEs: "Cinco de Copas", arcana: "minor" },
  { id: 41, name: "Six of Cups", namePl: "Szóstka Kielichów", nameEs: "Seis de Copas", arcana: "minor" },
  { id: 42, name: "Seven of Cups", namePl: "Siódemka Kielichów", nameEs: "Siete de Copas", arcana: "minor" },
  { id: 43, name: "Eight of Cups", namePl: "Ósemka Kielichów", nameEs: "Ocho de Copas", arcana: "minor" },
  { id: 44, name: "Nine of Cups", namePl: "Dziewiątka Kielichów", nameEs: "Nueve de Copas", arcana: "minor" },
  { id: 45, name: "Ten of Cups", namePl: "Dziesiątka Kielichów", nameEs: "Diez de Copas", arcana: "minor" },
  { id: 46, name: "Page of Cups", namePl: "Paź Kielichów", nameEs: "Paje de Copas", arcana: "minor" },
  { id: 47, name: "Knight of Cups", namePl: "Rycerz Kielichów", nameEs: "Caballero de Copas", arcana: "minor" },
  { id: 48, name: "Queen of Cups", namePl: "Królowa Kielichów", nameEs: "Reina de Copas", arcana: "minor" },
  { id: 49, name: "King of Cups", namePl: "Król Kielichów", nameEs: "Rey de Copas", arcana: "minor" },
  // Minor Arcana - Swords (50-63)
  { id: 50, name: "Ace of Swords", namePl: "As Mieczy", nameEs: "As de Espadas", arcana: "minor" },
  { id: 51, name: "Two of Swords", namePl: "Dwójka Mieczy", nameEs: "Dos de Espadas", arcana: "minor" },
  { id: 52, name: "Three of Swords", namePl: "Trójka Mieczy", nameEs: "Tres de Espadas", arcana: "minor" },
  { id: 53, name: "Four of Swords", namePl: "Czwórka Mieczy", nameEs: "Cuatro de Espadas", arcana: "minor" },
  { id: 54, name: "Five of Swords", namePl: "Piątka Mieczy", nameEs: "Cinco de Espadas", arcana: "minor" },
  { id: 55, name: "Six of Swords", namePl: "Szóstka Mieczy", nameEs: "Seis de Espadas", arcana: "minor" },
  { id: 56, name: "Seven of Swords", namePl: "Siódemka Mieczy", nameEs: "Siete de Espadas", arcana: "minor" },
  { id: 57, name: "Eight of Swords", namePl: "Ósemka Mieczy", nameEs: "Ocho de Espadas", arcana: "minor" },
  { id: 58, name: "Nine of Swords", namePl: "Dziewiątka Mieczy", nameEs: "Nueve de Espadas", arcana: "minor" },
  { id: 59, name: "Ten of Swords", namePl: "Dziesiątka Mieczy", nameEs: "Diez de Espadas", arcana: "minor" },
  { id: 60, name: "Page of Swords", namePl: "Paź Mieczy", nameEs: "Paje de Espadas", arcana: "minor" },
  { id: 61, name: "Knight of Swords", namePl: "Rycerz Mieczy", nameEs: "Caballero de Espadas", arcana: "minor" },
  { id: 62, name: "Queen of Swords", namePl: "Królowa Mieczy", nameEs: "Reina de Espadas", arcana: "minor" },
  { id: 63, name: "King of Swords", namePl: "Król Mieczy", nameEs: "Rey de Espadas", arcana: "minor" },
  // Minor Arcana - Pentacles (64-77)
  { id: 64, name: "Ace of Pentacles", namePl: "As Pentakli", nameEs: "As de Oros", arcana: "minor" },
  { id: 65, name: "Two of Pentacles", namePl: "Dwójka Pentakli", nameEs: "Dos de Oros", arcana: "minor" },
  { id: 66, name: "Three of Pentacles", namePl: "Trójka Pentakli", nameEs: "Tres de Oros", arcana: "minor" },
  { id: 67, name: "Four of Pentacles", namePl: "Czwórka Pentakli", nameEs: "Cuatro de Oros", arcana: "minor" },
  { id: 68, name: "Five of Pentacles", namePl: "Piątka Pentakli", nameEs: "Cinco de Oros", arcana: "minor" },
  { id: 69, name: "Six of Pentacles", namePl: "Szóstka Pentakli", nameEs: "Seis de Oros", arcana: "minor" },
  { id: 70, name: "Seven of Pentacles", namePl: "Siódemka Pentakli", nameEs: "Siete de Oros", arcana: "minor" },
  { id: 71, name: "Eight of Pentacles", namePl: "Ósemka Pentakli", nameEs: "Ocho de Oros", arcana: "minor" },
  { id: 72, name: "Nine of Pentacles", namePl: "Dziewiątka Pentakli", nameEs: "Nueve de Oros", arcana: "minor" },
  { id: 73, name: "Ten of Pentacles", namePl: "Dziesiątka Pentakli", nameEs: "Diez de Oros", arcana: "minor" },
  { id: 74, name: "Page of Pentacles", namePl: "Paź Pentakli", nameEs: "Paje de Oros", arcana: "minor" },
  { id: 75, name: "Knight of Pentacles", namePl: "Rycerz Pentakli", nameEs: "Caballero de Oros", arcana: "minor" },
  { id: 76, name: "Queen of Pentacles", namePl: "Królowa Pentakli", nameEs: "Reina de Oros", arcana: "minor" },
  { id: 77, name: "King of Pentacles", namePl: "Król Pentakli", nameEs: "Rey de Oros", arcana: "minor" },
];

export const tarotDeck: Omit<TarotCard, "reversed">[] = rawTarotDeck.map((card) => ({
  ...card,
  imageUrl: `${tarotCardImageBaseUrl}/${tarotImagePath(card.id)}`,
}));

export function drawCards(n: number): TarotCard[] {
  const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map((card) => ({
    ...card,
    reversed: Math.random() < 0.3,
  }));
}

export const celticCrossPositions: Record<AppLang, string[]> = {
  en: [
    "Essence of the Situation",
    "Challenge / Opposing Force",
    "Hidden Foundation",
    "Past Influences",
    "Conscious Aspirations",
    "Near-Term Development",
    "Inner Self-Image",
    "Environmental Influences",
    "Hopes and Fears",
    "Potential Outcome",
  ],
  pl: [
    "Istota sytuacji",
    "Wyzwanie / Siła przeciwna",
    "Ukryty fundament",
    "Wpływy przeszłości",
    "Świadome dążenia",
    "Najbliższy rozwój wydarzeń",
    "Wewnętrzny obraz siebie",
    "Wpływy otoczenia",
    "Nadzieje i lęki",
    "Potencjalny rezultat",
  ],
  es: [
    "Esencia de la situación",
    "Desafío / Fuerza opuesta",
    "Fundamento oculto",
    "Influencias del pasado",
    "Aspiraciones conscientes",
    "Desarrollo próximo",
    "Imagen interna de sí",
    "Influencias del entorno",
    "Esperanzas y miedos",
    "Resultado potencial",
  ],
};
