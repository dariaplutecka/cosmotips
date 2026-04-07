import type { AppLang } from "@/lib/reportSchema";
import type { ForecastWindows } from "@/lib/forecastWindow";
import {
  formatForecastDayHeading,
  getForecastWindows,
  REPORT_TIMEZONE,
} from "@/lib/forecastWindow";
import type { NatalChartPayload } from "@/lib/natalChart";
import { natalChartSummaryJson } from "@/lib/natalChart";

type ReportType = "personality" | "weekly" | "monthly";

const weeklyDayBullet: Record<AppLang, string> = {
  pl: `- 2–4 zdania wyłącznie o tym jednym dniu (data w nagłówku); mapa urodzeniowa i tranzyty.`,
  en: `- 2–4 sentences for this calendar day only (date in the heading); natal chart and transits.`,
  es: `- 2–4 frases solo para este día (fecha en el encabezado); carta natal y tránsitos.`,
};

function weeklyDayOutlineBlocks(fw: ForecastWindows, lang: AppLang): string[] {
  const lines: string[] = [];
  const bullet = weeklyDayBullet[lang];
  for (const iso of fw.weeklyDates) {
    lines.push(`## ${formatForecastDayHeading(iso, lang)} (${iso})`);
    lines.push(bullet);
    lines.push(``);
  }
  return lines;
}

function monthlySegmentOutlineBlocks(fw: ForecastWindows, lang: AppLang): string[] {
  const lines: string[] = [];
  fw.monthlySegments.forEach((seg, i) => {
    const n = i + 1;
    if (lang === "pl") {
      lines.push(`## Etap ${n}: ${seg.start} – ${seg.end}`);
      lines.push(
        `- 3–5 zdań tylko dla tego przedziału; cała prognoza obejmuje 30 dni od ${fw.monthly.start} do ${fw.monthly.end}.`,
      );
    } else if (lang === "es") {
      lines.push(`## Parte ${n}: ${seg.start} – ${seg.end}`);
      lines.push(
        `- 3–5 frases solo para este tramo; el informe completo cubre 30 días desde ${fw.monthly.start} hasta ${fw.monthly.end}.`,
      );
    } else {
      lines.push(`## Part ${n}: ${seg.start} – ${seg.end}`);
      lines.push(
        `- 3–5 sentences for this date range only; full forecast covers 30 days from ${fw.monthly.start} through ${fw.monthly.end}.`,
      );
    }
    lines.push(``);
  });
  return lines;
}

function chartContextLines(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  lang: AppLang,
): string[] {
  const lat = chart.latitude.toFixed(4);
  const lon = chart.longitude.toFixed(4);
  const asc = chart.ascendantDeg.toFixed(1);
  if (lang === "pl") {
    return [
      `W sekcji „Wykres Natalny” (lub jej odpowiedniku w danym języku) powtórz: data ${dob}, godzina ${tob}, miejsce ${pob}.`,
      `Dodaj jednym zdaniem: strefa czasowa mapy: ${chart.timezone}; współrzędne przybliżone: szer. ${lat}°, dług. ${lon}° (jak po geokodowaniu).`,
      `Ascendent z ephemeridy: ok. ${asc}°. Krótko (2–4 zdania) zreferuj do JSON poniżej: Słońce, Księżyc, planety — bez zaprzeczania liczbom z JSON.`,
    ];
  }
  if (lang === "es") {
    return [
      `En la sección de carta natal, repite: fecha ${dob}, hora ${tob}, lugar ${pob}.`,
      `Una frase: zona horaria de la carta: ${chart.timezone}; coordenadas aprox. lat ${lat}°, lon ${lon}°.`,
      `Ascendente (~${asc}°). En 2–4 frases resume Sol, Luna y planetas según el JSON — sin contradecirlo.`,
    ];
  }
  return [
    `In the Natal chart section, repeat: date ${dob}, time ${tob}, place ${pob}.`,
    `One sentence: chart timezone ${chart.timezone}; approximate coordinates lat ${lat}°, lon ${lon}°.`,
    `Ascendant (~${asc}°). In 2–4 sentences summarize Sun, Moon, and planets per the JSON — do not contradict it.`,
  ];
}

function plPersonalityOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "pl");
  return [
    `Zacznij dokument od dokładnie tego tytułu:`,
    `# Opis Osobowościowy`,
    ``,
    `Potem użyj W TEJ KOLEJNOŚCI wyłącznie nagłówków poziomu ## (dokładna treść nagłówka — bez numeracji):`,
    ``,
    `## Wykres Natalny`,
    ...cc.map((l) => `- ${l}`),
    `- Wymień 5–8 głównych aspektów (orb ~6°) między ciałami z JSON.`,
    ``,
    `## Znak Słońca`,
    `- Znak i okoliczność (stopień, jeśli wynika z mapy); 2–3 zdania + aspekty dotykające Słońca.`,
    ``,
    `## Znak Ascendentu`,
    `- Odnieś się do Ascendentu (~${chart.ascendantDeg.toFixed(1)}°) i jego znaku; 2–4 zdania.`,
    ``,
    `## Znak Księżyca`,
    `- Znak Księżyca z mapy; emocje, potrzeby, reakcje — konkretnie z mapy, nie ogólnik.`,
    ``,
    `## Merkury — umysł i komunikacja`,
    `- Jeden akapit (3–5 zdań): Merkury w mapie (znak, aspekty); umysł i komunikacja.`,
    ``,
    `## Wenus — miłość i wartości`,
    `- Jeden akapit: Wenus w mapie; wartości i styl dawania/odbierania miłości.`,
    ``,
    `## Mars — energia i działanie`,
    `- Jeden akapit: Mars w mapie; energia, inicjatywa, sposób dochodzenia do celów.`,
    ``,
    `## Jowisz — wzrost i szczęście`,
    `- Jeden akapit: Jowisz w mapie; ekspansja, sens szczęścia, przekonania.`,
    ``,
    `## Saturn — lekcje i struktura`,
    `- Jeden akapit: Saturn w mapie; granice, dojrzałość, długofalowe lekcje.`,
    ``,
    `## Mocne strony i talenty`,
    `- Lista punktowana (6–10 punktów); każdy punkt = konkretny czynnik mapy (planeta, aspekt, kombinacja).`,
    ``,
    `## Wyzwania i cienie`,
    `- Lista punktowana (5–8 punktów); każdy punkt = czynnik mapy, bez stygmatyzacji.`,
    ``,
    `## Ścieżka życiowa i misja`,
    `- 1 akapit syntetyczny (np. oś Słońce–Księżyc–Ascendent–Saturn–Jowisz); bez wymyślania Węzłów Księżycowych, jeśli nie ma ich w JSON.`,
    ``,
    `## Miłość i relacje`,
    `- 1 akapit o Wenus i Księżycu w kontekście relacji; odniesienie do domów (np. całoznakowych od Ascendentu) jeśli pomaga.`,
    ``,
    `## Kariera i powołanie`,
    `- 1 akapit (Saturn, MC nie liczysz numerycznie — opisz powołanie przez planety i aspekty z mapy).`,
    ``,
    `## Podsumowanie — portret duszy`,
    `- 2–3 zdania domykające; spójne z całością mapy.`,
  ];
}

function plMonthlyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "pl");
  return [
    `Zacznij od:`,
    `# Prognoza Miesięczna`,
    ``,
    `KRYTYCZNE: Pisz WYŁĄCZNIE o 30 kolejnych dniach kalendarzowych od daty generowania: od ${fw.monthly.start} do ${fw.monthly.end} włącznie (strefa ${fw.timezone}). To nie jest „miesiąc kalendarzowy” od 1. do ostatniego dnia miesiąca — liczy się wyłącznie ten zakres.`,
    ``,
    `Nagłówki ## w tej kolejności:`,
    ``,
    `## Wykres Natalny`,
    ...cc.map((l) => `- ${l}`),
    `- Krótko przypomnij układ potrzebny do tranzytów w tym miesiącu.`,
    ``,
    `## Ogólna energia 30 dni`,
    `- 2–4 zdania nastroju całego okresu względem mapy urodzeniowej; tylko ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    `## Kluczowe tranzyty (30 dni)`,
    `- Lista 4–7 punktów: tranzyty względem natalu (mogą być przybliżone, jeśli oznaczysz „około”); wyłącznie ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    ...monthlySegmentOutlineBlocks(fw, "pl"),
    ``,
    `## Miłość i relacje (ten 30-dniowy okres)`,
    `- Jeden akapit; wyłącznie ${fw.monthly.start}–${fw.monthly.end}; bez diagnoz.`,
    ``,
    `## Praca i finanse (ten 30-dniowy okres)`,
    `- Jeden akapit; ten sam zakres dat; bez porad inwestycyjnych.`,
    ``,
    `## Zdrowie i energia (ten 30-dniowy okres)`,
    `- Jeden akapit o energii i rytmie (bez diagnoz medycznych); ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    `## Najlepsze dni w tym okresie`,
    `- Lista 3–5 dat (YYYY-MM-DD w ${fw.timezone}) z jednym zdaniem uzasadnienia każdej z mapy.`,
    ``,
    `## Dni wymagające ostrożności (w tym okresie)`,
    `- Lista 2–4 dat (YYYY-MM-DD) z krótką wskazówką, bez straszenia.`,
    ``,
    `## Afirmacja na ten okres`,
    `- Jedna afirmacja w pierwszej osobie, zgodna z tematem 30 dni i mapą.`,
  ];
}

function plWeeklyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "pl");
  return [
    `Zacznij od:`,
    `# 🗓️ Prognoza Tygodniowa`,
    ``,
    `KRYTYCZNE: Pisz WYŁĄCZNIE o 7 kolejnych dniach od daty generowania: od ${fw.weekly.start} do ${fw.weekly.end} włącznie (strefa ${fw.timezone}). Nie używaj „poniedziałek–niedziela” jako domyślnego tygodnia — liczy się wyłącznie ten zakres dat.`,
    ``,
    `Nagłówki ## w tej kolejności:`,
    ``,
    `## Wykres Natalny`,
    ...cc.map((l) => `- ${l}`),
    `- Jedno zdanie: dlaczego ta mapa ma znaczenie dla tego tygodnia.`,
    ``,
    `## Ogólny ton 7 dni`,
    `- 2–4 zdania syntetycznie na cały zakres ${fw.weekly.start}–${fw.weekly.end}; bez przypisywania treści do pon–niedz kalendarzowych poza tymi datami.`,
    ``,
    ...weeklyDayOutlineBlocks(fw, "pl"),
    `## Miłość i relacje`,
    `- Jeden krótki akapit; tylko ${fw.weekly.start}–${fw.weekly.end}.`,
    ``,
    `## Praca i projekty`,
    `- Jeden krótki akapit; ten sam tydzień.`,
    ``,
    `## Energia i samopoczucie`,
    `- Jeden krótki akapit (bez porad medycznych); ten sam tydzień.`,
    ``,
    `## Najlepszy dzień tygodnia`,
    `- Nazwij jeden dzień (z datą YYYY-MM-DD w ${fw.timezone}) i uzasadnij z mapy/tranzytów.`,
    ``,
    `## Wyzwanie tygodnia`,
    `- 1 akapit: realne napięcie z mapy, konstruktywnie.`,
    ``,
    `## Pytanie do refleksji`,
    `- Jedno pytanie otwarte, powiązane z tematem tygodnia i mapą.`,
  ];
}

function enPersonalityOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "en");
  return [
    `Start the document with this exact title:`,
    `# Personality portrait`,
    ``,
    `Then use ONLY these ## headings, in this order:`,
    ``,
    `## Natal chart`,
    ...cc.map((l) => `- ${l}`),
    `- List 5–8 major aspects (~6° orb) between bodies from the JSON.`,
    ``,
    `## Sun sign`,
    `## Ascendant sign`,
    `## Moon sign`,
    `## Mercury — mind & communication`,
    `- One paragraph (3–5 sentences), JSON-grounded.`,
    ``,
    `## Venus — love & values`,
    `- One paragraph.`,
    ``,
    `## Mars — energy & action`,
    `- One paragraph.`,
    ``,
    `## Jupiter — growth & luck`,
    `- One paragraph.`,
    ``,
    `## Saturn — lessons & structure`,
    `- One paragraph.`,
    ``,
    `## Strengths & talents`,
    `- 6–10 bullets; each names a specific chart factor.`,
    ``,
    `## Challenges & shadows`,
    `- 5–8 bullets; chart-based, non-judgmental.`,
    ``,
    `## Life path & purpose`,
    `- One synthesizing paragraph (e.g. Sun–Moon–Asc–Saturn–Jupiter). Do not invent lunar nodes if not in JSON.`,
    ``,
    `## Love & relationships`,
    `## Career & calling`,
    `One paragraph each, tied to Venus/Moon and vocational planets/aspects.`,
    ``,
    `## Summary — portrait of the soul`,
    `- 2–3 closing sentences consistent with the chart.`,
  ];
}

function enMonthlyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "en");
  return [
    `Start with:`,
    `# Monthly forecast`,
    ``,
    `CRITICAL: Write ONLY about 30 consecutive calendar days from the generation date: ${fw.monthly.start} through ${fw.monthly.end} inclusive (${fw.timezone}). This is NOT “the calendar month from the 1st to the last day of a month” — only this exact range.`,
    ``,
    `## Natal chart`,
    ...cc.map((l) => `- ${l}`),
    `- Brief note on what matters for transits this month.`,
    ``,
    `## Overall energy (30-day window)`,
    `- 2–4 sentences vs the natal chart; only ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    `## Key transits (30 days)`,
    `- 4–7 transit bullets vs natal (approximate OK if labeled); only ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    ...monthlySegmentOutlineBlocks(fw, "en"),
    ``,
    `## Love & relationships (this 30-day period)`,
    `- One paragraph; only ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    `## Work & finances (this 30-day period)`,
    `- One paragraph; same date range; no investment advice.`,
    ``,
    `## Health & energy (this 30-day period)`,
    `- One paragraph on rhythm/energy only; no medical diagnosis.`,
    ``,
    `## Best days in this window`,
    `- 3–5 dates (YYYY-MM-DD, ${fw.timezone}) with one-sentence rationale each.`,
    ``,
    `## Days requiring caution (in this window)`,
    `- 2–4 dates with gentle guidance.`,
    ``,
    `## Affirmation for this period`,
    `- One first-person affirmation aligned with the chart and these 30 days.`,
  ];
}

function enWeeklyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "en");
  return [
    `Start with:`,
    `# 🗓️ Weekly forecast`,
    ``,
    `CRITICAL: Write ONLY about 7 consecutive days from the generation date: ${fw.weekly.start} through ${fw.weekly.end} inclusive (${fw.timezone}). Do NOT default to Monday–Sunday; only these dates matter.`,
    ``,
    `## Natal chart`,
    ...cc.map((l) => `- ${l}`),
    `- One sentence linking the chart to this week.`,
    ``,
    `## Overall tone (7-day window)`,
    `- 2–4 sentences summarizing the whole span ${fw.weekly.start}–${fw.weekly.end}; do not anchor to Mon–Sun outside these dates.`,
    ``,
    ...weeklyDayOutlineBlocks(fw, "en"),
    `## Love & relationships`,
    `- One short paragraph.`,
    ``,
    `## Work & projects`,
    `- One short paragraph.`,
    ``,
    `## Energy & wellbeing`,
    `- One short paragraph; no medical advice.`,
    ``,
    `## Best day of the week`,
    `- Name the day with YYYY-MM-DD (${fw.timezone}) and justify.`,
    ``,
    `## Challenge of the week`,
    `- One constructive paragraph on the main tension of the week.`,
    ``,
    `## Reflection question`,
    `- One open question tied to the week and chart.`,
  ];
}

function esPersonalityOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "es");
  return [
    `Empieza con:`,
    `# Retrato de personalidad`,
    ``,
    `Solo estos encabezados ##, en este orden:`,
    ``,
    `## Carta natal`,
    ...cc.map((l) => `- ${l}`),
    `- Enumera 5–8 aspectos mayores (orbe ~6°).`,
    ``,
    `## Signo solar`,
    `## Signo ascendente`,
    `## Signo lunar`,
    `## Mercurio — mente y comunicación`,
    `- Un párrafo (3–5 frases), basado en el JSON.`,
    ``,
    `## Venus — amor y valores`,
    `- Un párrafo.`,
    ``,
    `## Marte — energía y acción`,
    `- Un párrafo.`,
    ``,
    `## Júpiter — crecimiento y suerte`,
    `- Un párrafo.`,
    ``,
    `## Saturno — lecciones y estructura`,
    `- Un párrafo.`,
    ``,
    `## Fortalezas y talentos`,
    `- 6–10 viñetas; cada una cita un factor de la carta.`,
    ``,
    `## Retos y sombras`,
    `- 5–8 viñetas; sin juicios duros.`,
    ``,
    `## Camino de vida y misión`,
    `- Un párrafo (Sol–Luna–Asc–Saturno–Júpiter); no inventes nodos si no están en el JSON.`,
    ``,
    `## Amor y relaciones`,
    `- Un párrafo: Venus y Luna en contexto relacional.`,
    ``,
    `## Carrera y vocación`,
    `- Un párrafo con planetas y aspectos vocacionales de la carta.`,
    ``,
    `## Resumen — retrato del alma`,
    `- 2–3 frases de cierre coherentes con la carta.`,
  ];
}

function esMonthlyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "es");
  return [
    `Empieza con:`,
    `# Pronóstico mensual`,
    ``,
    `CRÍTICO: Solo 30 días naturales consecutivos desde la fecha de generación: ${fw.monthly.start}–${fw.monthly.end} inclusive (${fw.timezone}). No es “el mes del calendario” del día 1 al último día del mes — solo este rango.`,
    ``,
    `## Carta natal`,
    ...cc.map((l) => `- ${l}`),
    ``,
    `## Energía general (ventana de 30 días)`,
    `- 2–4 frases; solo ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    `## Tránsitos clave (30 días)`,
    `- 4–7 viñetas de tránsitos vs natal (aprox. OK si lo indicas); solo ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    ...monthlySegmentOutlineBlocks(fw, "es"),
    ``,
    `## Amor y relaciones (este período de 30 días)`,
    `- Un párrafo; sin diagnósticos.`,
    ``,
    `## Trabajo y finanzas (este período de 30 días)`,
    `- Un párrafo; sin consejos de inversión.`,
    ``,
    `## Salud y energía (este período de 30 días)`,
    `- Un párrafo sobre ritmo/energía; sin consejos médicos.`,
    ``,
    `## Mejores días en esta ventana`,
    `- 3–5 fechas YYYY-MM-DD (${fw.timezone}) con una frase cada una.`,
    ``,
    `## Días que requieren cautela (en esta ventana)`,
    `- 2–4 fechas con guía suave.`,
    ``,
    `## Afirmación para este período`,
    `- Una afirmación en primera persona.`,
  ];
}

function esWeeklyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "es");
  return [
    `Empieza con:`,
    `# 🗓️ Pronóstico semanal`,
    ``,
    `CRÍTICO: Solo 7 días consecutivos desde la generación: ${fw.weekly.start}–${fw.weekly.end} (${fw.timezone}). No uses lunes–domingo por defecto; solo estas fechas.`,
    ``,
    `## Carta natal`,
    ...cc.map((l) => `- ${l}`),
    ``,
    `## Tono general (7 días)`,
    `- 2–4 frases de conjunto para ${fw.weekly.start}–${fw.weekly.end}; sin anclar a lun–dom fuera de estas fechas.`,
    ``,
    ...weeklyDayOutlineBlocks(fw, "es"),
    `## Amor y relaciones`,
    `- Un párrafo corto.`,
    ``,
    `## Trabajo y proyectos`,
    `- Un párrafo corto.`,
    ``,
    `## Energía y bienestar`,
    `- Un párrafo corto; sin consejos médicos.`,
    ``,
    `## Mejor día de la semana`,
    `- Día con fecha YYYY-MM-DD (${fw.timezone}) y justificación.`,
    ``,
    `## Reto de la semana`,
    `- Un párrafo constructivo.`,
    ``,
    `## Pregunta para reflexionar`,
    `- Una pregunta abierta vinculada a la carta y la semana.`,
  ];
}

function outlineFor(
  reportType: ReportType,
  lang: AppLang,
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
): string[] {
  if (lang === "pl") {
    if (reportType === "personality") return plPersonalityOutline(chart, dob, tob, pob);
    if (reportType === "monthly") return plMonthlyOutline(chart, dob, tob, pob, fw);
    return plWeeklyOutline(chart, dob, tob, pob, fw);
  }
  if (lang === "es") {
    if (reportType === "personality") return esPersonalityOutline(chart, dob, tob, pob);
    if (reportType === "monthly") return esMonthlyOutline(chart, dob, tob, pob, fw);
    return esWeeklyOutline(chart, dob, tob, pob, fw);
  }
  if (reportType === "personality") return enPersonalityOutline(chart, dob, tob, pob);
  if (reportType === "monthly") return enMonthlyOutline(chart, dob, tob, pob, fw);
  return enWeeklyOutline(chart, dob, tob, pob, fw);
}

export function buildReportPrompt(input: {
  dob: string;
  tob: string;
  pob: string;
  reportType: ReportType;
  lang: AppLang;
  chart: NatalChartPayload;
}): string {
  const { dob, tob, pob, reportType, lang, chart } = input;
  const fw = getForecastWindows();
  const ephem = natalChartSummaryJson(chart);
  const outline = outlineFor(reportType, lang, chart, dob, tob, pob, fw);

  const commonPl = [
    `Jesteś doświadczonym astrologiem. Klient zapłacił za bardzo osobisty, spójny raport w języku polskim.`,
    ``,
    `WAŻNE: Cały dokument musi być wyłącznie po polsku (nagłówki i treść).`,
    ``,
    `Dane urodzenia (dokładnie):`,
    `- Data: ${dob}`,
    `- Godzina: ${tob}`,
    `- Miejsce: ${pob}`,
    ``,
    `Kalendarz odniesienia (${REPORT_TIMEZONE}): dzisiaj ${fw.today}; prognoza tygodniowa = 7 kolejnych dni od dziś: ${fw.weekly.start}–${fw.weekly.end}; prognoza „miesięczna” = 30 kolejnych dni od dziś: ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    `Obowiązkowy JSON ephemeridy (tropik, geocentryczny). Nie zaprzeczaj liczbom — interpretuj:`,
    "```json",
    ephem,
    "```",
    ``,
    ...outline,
    ``,
    `Format: Markdown; poza powyższym blokiem JSON bez innych JSON-ów i bez fence’ów kodu w interpretacji.`,
    `Ton: ciepły, konkretny, refleksyjny.`,
    `Unikaj porad medycznych, prawnych i inwestycyjnych.`,
  ];

  const commonEs = [
    `Eres un astrólogo experimentado. Lectura personal en español.`,
    ``,
    `IMPORTANTE: Todo en español.`,
    ``,
    `Datos de nacimiento:`,
    `- Fecha: ${dob}`,
    `- Hora: ${tob}`,
    `- Lugar: ${pob}`,
    ``,
    `Calendario (${REPORT_TIMEZONE}): hoy ${fw.today}; semanal = 7 días seguidos desde hoy: ${fw.weekly.start}–${fw.weekly.end}; “mensual” = 30 días seguidos desde hoy: ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    `JSON de efemérides obligatorio:`,
    "```json",
    ephem,
    "```",
    ``,
    ...outline,
    ``,
    `Formato: Markdown; sin más JSON ni bloques de código en la interpretación.`,
    `Evita consejos médicos, legales o financieros.`,
  ];

  const commonEn = [
    `You are an experienced astrologer. The user paid for a personal, coherent reading in English.`,
    ``,
    `IMPORTANT: Entire document in English.`,
    ``,
    `Birth data (exact):`,
    `- Date: ${dob}`,
    `- Time: ${tob}`,
    `- Place: ${pob}`,
    ``,
    `Calendar context (${REPORT_TIMEZONE}): today ${fw.today}; weekly forecast = 7 consecutive days from today ${fw.weekly.start}–${fw.weekly.end}; “monthly” forecast = 30 consecutive days from today ${fw.monthly.start}–${fw.monthly.end}.`,
    ``,
    `Authoritative ephemeris JSON (tropical, geocentric). Do not contradict — interpret:`,
    "```json",
    ephem,
    "```",
    ``,
    ...outline,
    ``,
    `Formatting: Markdown only; no extra JSON or code fences in the reading.`,
    `Tone: warm, specific, reflective.`,
    `Avoid medical, legal, or financial advice.`,
  ];

  if (lang === "pl") return commonPl.join("\n");
  if (lang === "es") return commonEs.join("\n");
  return commonEn.join("\n");
}
