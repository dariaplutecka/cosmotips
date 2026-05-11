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

const celticCrossPositionMeanings: Record<AppLang, string[]> = {
  en: [
    "Essence of the Situation: the core of the situation, the main theme or challenge facing the querent.",
    "Challenge / Opposing Force: the main obstacle, tension, or opposing force on the querent's current path; this card crosses the central card.",
    "Hidden Foundation: the foundation, deep basis, or root cause of the question or issue; placed below the cross.",
    "Past Influences: recent past events influencing the current situation; placed to the left of the cross.",
    "Conscious Aspirations: the potential future, conscious aim, or best possible outcome in the situation; placed above the cross.",
    "Near-Term Development: events likely to emerge in the near future; placed to the right of the cross.",
    "Inner Self-Image: how the querent sees themselves in relation to the question; bottom of the vertical column.",
    "Environmental Influences: outside influences, how others perceive the querent, or forces active in the environment; above the self-image card.",
    "Hopes and Fears: the deeper emotional layer, showing what the querent hopes for or fears regarding the question; above the environmental influences card.",
    "Potential Outcome: the probable result if the current trajectory remains unchanged; top of the vertical column.",
  ],
  pl: [
    "Istota sytuacji: sedno sytuacji, główny temat lub wyzwanie, przed którym stoi osoba wróżąca.",
    "Wyzwanie / Siła przeciwna: główna przeszkoda lub przeciwstawna siła na obecnej drodze osoby wróżącej; karta ułożona poziomo w poprzek karty centralnej.",
    "Ukryty fundament: podstawa, głęboki fundament lub źródło pytania albo problemu; pozycja na dole krzyża.",
    "Wpływy przeszłości: wydarzenia z niedawnej przeszłości, które wpływają na obecną sytuację; pozycja po lewej stronie krzyża.",
    "Świadome dążenia: potencjalna przyszłość, świadomy kierunek lub najlepszy wynik w danej sytuacji; pozycja na górze krzyża.",
    "Najbliższy rozwój wydarzeń: zapowiedź wydarzeń w najbliższej przyszłości; pozycja po prawej stronie krzyża.",
    "Wewnętrzny obraz siebie: sposób, w jaki pytający postrzega siebie w odniesieniu do pytania; początek pionowej kolumny, na dole.",
    "Wpływy otoczenia: wpływy zewnętrzne, sposób, w jaki inni postrzegają osobę pytającą, lub siły działające w środowisku; nad kartą wewnętrznego obrazu siebie.",
    "Nadzieje i lęki: głębsza warstwa emocjonalna, pokazująca, czego kwerent ma nadzieję lub czego się obawia w związku z zapytaniem; nad kartą wpływów otoczenia.",
    "Potencjalny rezultat: prawdopodobny rezultat, jeśli obecna trajektoria pozostanie niezmieniona; na górze pionowej kolumny.",
  ],
  es: [
    "Esencia de la situación: el núcleo de la situación, el tema principal o el desafío que enfrenta la persona consultante.",
    "Desafío / Fuerza opuesta: el obstáculo principal, tensión o fuerza contraria en el camino actual de la persona consultante; esta carta cruza la carta central.",
    "Fundamento oculto: la base, fundamento profundo o causa raíz de la pregunta o problema; colocada debajo de la cruz.",
    "Influencias del pasado: acontecimientos recientes del pasado que influyen en la situación actual; colocada a la izquierda de la cruz.",
    "Aspiraciones conscientes: futuro potencial, objetivo consciente o mejor resultado posible en la situación; colocada encima de la cruz.",
    "Desarrollo próximo: acontecimientos probables en el futuro cercano; colocada a la derecha de la cruz.",
    "Imagen interna de sí: cómo la persona consultante se percibe a sí misma en relación con la pregunta; al inicio de la columna vertical, abajo.",
    "Influencias del entorno: influencias externas, cómo otros perciben a la persona consultante o fuerzas activas en el entorno; encima de la carta de imagen interna.",
    "Esperanzas y miedos: capa emocional profunda que muestra lo que la persona espera o teme respecto a la consulta; encima de la carta de influencias del entorno.",
    "Resultado potencial: resultado probable si la trayectoria actual permanece sin cambios; en la parte superior de la columna vertical.",
  ],
};

function celticCrossMeaningsBlock(lang: AppLang): string {
  return celticCrossPositionMeanings[lang]
    .map((meaning, index) => `${index + 1}. ${meaning}`)
    .join("\n");
}

function markdownHeadingsBlock(headings: string[]): string {
  return headings.map((heading) => `## ${heading}`).join("\n");
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

Obowiązkowe nagłówki Markdown H2, dokładnie w tej kolejności:
${markdownHeadingsBlock(threeCardPositions.pl)}

Napisz głęboką, poetycką interpretację w języku polskim (ok. 400-600 słów). Pisz jako tarolożka w pierwszej osobie i zwracaj się bezpośrednio do osoby pytającej: „Widzę…”, „Czuję…”, „Pokazuję Ci…”, „Twoja przeszłość pokazuje…”. Dla każdej pozycji użyj podanego nagłówka H2 i odnoś znaczenie kart do wskazanego obszaru analizy. Uwzględnij numerologiczną kartę osoby jako stały filtr temperamentu, potencjału i lekcji życiowej, ale nie rób z niej osobnej sekcji technicznej. Zakończ ogólnym podsumowaniem i przesłaniem. Ton: mistyczny, ciepły, pomocny — nie strasz.`;
  }

  if (lang === "es") {
    return `Eres una tarotista experta y mística. Realiza una interpretación de la tirada de 3 cartas.

Área de análisis: ${topicLabel}
Persona consultante: ${profile.name}
Fecha de nacimiento: ${profile.birthDate}
Carta numerológica personal: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Cartas:
${cardsBlock}

Encabezados Markdown H2 obligatorios, exactamente en este orden:
${markdownHeadingsBlock(threeCardPositions.es)}

Escribe una interpretación profunda y poética en español (aprox. 400-600 palabras). Escribe como tarotista en primera persona y dirígete directamente a la persona consultante: “Veo…”, “Siento…”, “Te muestro…”, “Tu pasado revela…”. Para cada posición usa el encabezado H2 indicado y conecta el significado de las cartas con el área indicada. Integra la carta numerológica personal como un filtro de temperamento, potencial y aprendizaje vital, sin convertirla en una sección técnica separada. Termina con un resumen y mensaje general. Tono: místico, cálido, útil — no aterrorices.`;
  }

  return `You are an experienced tarot reader and mystic. Perform a three-card spread interpretation.

Area of analysis: ${topicLabel}
Querent: ${profile.name}
Birth date: ${profile.birthDate}
Personal numerology tarot card: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Cards:
${cardsBlock}

Required Markdown H2 headings, exactly in this order:
${markdownHeadingsBlock(threeCardPositions.en)}

Write a deep, poetic interpretation in English (approx. 400-600 words). Write as the tarot reader in first person and address the querent directly: “I see…”, “I sense…”, “I am showing you…”, “Your past reveals…”. For each position, use the listed H2 heading and connect the card meanings to the selected area of analysis. Integrate the personal numerology tarot card as a steady lens for temperament, potential, and life lesson, but do not turn it into a separate technical section. End with an overall summary and message. Tone: mystical, warm, helpful — not scary.`;
}

export function buildDailyCardPrompt(cards: TarotCard[], lang: AppLang): string {
  const cardsBlock = cardLines(cards, dailyCardPositions[lang], lang);

  if (lang === "pl") {
    return `Jesteś doświadczoną tarolożką i mistyczką. Wykonaj interpretację Karty dnia dla osoby pytającej.

Karta:
${cardsBlock}

Napisz ciepłą, poetycką interpretację w języku polskim (ok. 250-350 słów). Pisz jako tarolożka w pierwszej osobie i zwracaj się bezpośrednio do osoby pytającej: „Widzę…”, „Czuję…”, „Pokazuję Ci…”. Wyjaśnij główne przesłanie karty na dzisiaj, jej energię, praktyczną wskazówkę i krótką afirmację. Ton: mistyczny, wspierający, pomocny — nie strasz i nie przedstawiaj karty jako wyroku.`;
  }

  if (lang === "es") {
    return `Eres una tarotista experta y mística. Realiza una interpretación de la Carta del Día para la persona consultante.

Carta:
${cardsBlock}

Escribe una interpretación cálida y poética en español (aprox. 250-350 palabras). Escribe como tarotista en primera persona y dirígete directamente a la persona consultante: “Veo…”, “Siento…”, “Te muestro…”. Explica el mensaje principal de la carta para hoy, su energía, una guía práctica y una breve afirmación. Tono: místico, amable, útil — no asustes ni presentes la carta como una sentencia.`;
  }

  return `You are an experienced tarot reader and mystic. Perform a Card of the Day interpretation for the querent.

Card:
${cardsBlock}

Write a warm, poetic interpretation in English (approx. 250-350 words). Write as the tarot reader in first person and address the querent directly: “I see…”, “I sense…”, “I am showing you…”. Explain the card's main message for today, its energy, one practical guidance point, and a short affirmation. Tone: mystical, supportive, helpful — not scary, and do not present the card as a fixed verdict.`;
}

export function buildCelticCrossPrompt(
  cards: TarotCard[],
  topic: TarotTopic,
  lang: AppLang,
  profile: TarotQuerentProfile,
): string {
  const topicLabel = topicLabels[topic][lang];
  const cardsBlock = cardLines(cards, celticCrossPositions[lang], lang);
  const meaningsBlock = celticCrossMeaningsBlock(lang);

  if (lang === "pl") {
    return `Jesteś doświadczoną tarolożką i mistyczką. Wykonaj interpretację rozkładu Krzyża Celtyckiego dla osoby pytającej.

Temat: ${topicLabel}
Osoba pytająca: ${profile.name}
Data urodzenia: ${profile.birthDate}
Numerologiczna karta osoby: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Karty:
${cardsBlock}

Znaczenie pozycji:
${meaningsBlock}

Obowiązkowe nagłówki Markdown H2, dokładnie w tej kolejności:
${markdownHeadingsBlock(celticCrossPositions.pl)}

Napisz głęboką, poetycką interpretację w języku polskim (ok. 900-1300 słów). Pisz jako tarolożka w pierwszej osobie i zwracaj się bezpośrednio do osoby pytającej: „Widzę…”, „Czuję…”, „Stoisz przed…”, „Ta karta pokazuje mi…”. Interpretuj karty dokładnie według podanej kolejności i znaczeń pozycji Krzyża Celtyckiego. Uwzględnij wszystkie 10 pozycji i pokaż, jak karty tworzą wspólną opowieść wokół tematu. Dla każdej z 10 pozycji użyj podanego nagłówka H2 opisującego jej znaczenie. Wpleć numerologiczną kartę osoby jako tło osobowości, potencjału i lekcji życiowej, które pomaga odczytać rozkład bardziej indywidualnie. Zakończ syntetycznym podsumowaniem i przesłaniem. Ton: mistyczny, ciepły, pomocny — nie strasz i nie przedstawiaj kart jako wyroku.`;
  }

  if (lang === "es") {
    return `Eres una tarotista experta y mística. Realiza una interpretación de la Cruz Celta para la persona consultante.

Tema: ${topicLabel}
Persona consultante: ${profile.name}
Fecha de nacimiento: ${profile.birthDate}
Carta numerológica personal: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Cartas:
${cardsBlock}

Significado de las posiciones:
${meaningsBlock}

Encabezados Markdown H2 obligatorios, exactamente en este orden:
${markdownHeadingsBlock(celticCrossPositions.es)}

Escribe una interpretación profunda y poética en español (aprox. 900-1300 palabras). Escribe como tarotista en primera persona y dirígete directamente a la persona consultante: “Veo…”, “Siento…”, “Estás ante…”, “Esta carta me muestra…”. Interpreta las cartas exactamente según el orden y los significados indicados para la Cruz Celta. Incluye las 10 posiciones y muestra cómo las cartas forman una historia común alrededor del tema. Para cada una de las 10 posiciones, usa el encabezado H2 indicado que describe su significado. Integra la carta numerológica personal como trasfondo de personalidad, potencial y aprendizaje vital para hacer la lectura más individual. Termina con una síntesis y un mensaje general. Tono: místico, cálido, útil — no asustes ni presentes las cartas como una sentencia.`;
  }

  return `You are an experienced tarot reader and mystic. Perform a Celtic Cross interpretation for the querent.

Topic: ${topicLabel}
Querent: ${profile.name}
Birth date: ${profile.birthDate}
Personal numerology tarot card: ${profile.numerologyCard.name} (${profile.numerologyCard.number})

Cards:
${cardsBlock}

Position meanings:
${meaningsBlock}

Required Markdown H2 headings, exactly in this order:
${markdownHeadingsBlock(celticCrossPositions.en)}

Write a deep, poetic interpretation in English (approx. 900-1300 words). Write as the tarot reader in first person and address the querent directly: “I see…”, “I sense…”, “You stand before…”, “This card shows me…”. Interpret the cards exactly according to the listed Celtic Cross order and position meanings. Include all 10 positions and show how the cards form one coherent story around the topic. For each of the 10 positions, use the listed H2 heading that describes its meaning. Weave the personal numerology tarot card in as a background of personality, potential, and life lesson that makes the reading more individual. End with an overall synthesis and message. Tone: mystical, warm, helpful — not scary, and do not present the cards as a fixed verdict.`;
}

export type { SpreadType, TarotTopic };
