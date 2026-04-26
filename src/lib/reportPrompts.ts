import type { AppLang } from "@/lib/reportSchema";
import type { ForecastWindows } from "@/lib/forecastWindow";
import {
  formatForecastDayHeading,
  getForecastWindows,
  REPORT_TIMEZONE,
} from "@/lib/forecastWindow";
import type { NatalChartPayload } from "@/lib/natalChart";
import { natalChartSummaryJson } from "@/lib/natalChart";

type ReportType = "natal_basic" | "personality" | "weekly" | "monthly";

function weeklyDayDetailBullets(lang: AppLang, tz: string): string[] {
  if (lang === "pl") {
    return [
      `Napisz **5–8 zdań** wyłącznie o tym jednym dniu (data w nagłówku).`,
      `Opieraj się **wyłącznie** na dacie, godzinie i miejscu urodzenia z formularza (powtórzone w sekcji „Wykres natalny”) oraz na JSON mapy natalnej i tranzytach w tym prompcie dla tej daty w strefie ${tz}. Nie wymyślaj innych danych urodzenia, nie dopisuj biografii spoza formularza ani „horoskopu ogólnego”.`,
      `Wskaż co najmniej jeden **konkretny** czynnik natalny (planeta w znaku, dom całoznakowy od Ascendentu lub aspekt z JSON) i powiąż go z tranzytem lub układem dnia **z tych samych danych** — bez sprzeczności z liczbami i znakami z JSON.`,
      `Wyjaśnij, czym ten dzień różni się od sąsiednich dni w tym tygodniu; nie kopiuj tej samej ogólnej myśli do każdej sekcji dnia.`,
      `Unikaj pustych fraz („komunikacja”, „zaufanie”, „energia”) bez nazwania planety, znaku, domu lub aspektu z mapy albo tranzytu.`,
    ];
  }
  if (lang === "es") {
    return [
      `Escribe **5–8 frases** solo para este día (la fecha va en el encabezado).`,
      `Basa la interpretación **exclusivamente** en la fecha, hora y lugar de nacimiento del formulario (repetidos en la carta natal) y en el JSON de la carta y los tránsitos de este prompt para esa fecha en ${tz}. No inventes otros datos de nacimiento ni biografía fuera del formulario ni “horóscopo genérico”.`,
      `Cita al menos un **factor natal concreto** (planeta en signo, casa entera contando desde el Ascendente o aspecto del JSON) y vincúlalo con un tránsito o configuración del día **de estos datos** — sin contradecir cifras ni signos del JSON.`,
      `Explica en qué se diferencia este día de los adyacentes en esta semana; no repitas la misma idea vaga en cada día.`,
      `Evita frases vacías sin planeta, signo, casa o aspecto del mapa o del tránsito.`,
    ];
  }
  return [
    `Write **5–8 sentences** for this calendar day only (date in the heading).`,
    `Ground everything **exclusively** in the birth date, time, and place from the form (repeated in the Natal chart section) and in this prompt’s natal JSON and transits for that date in ${tz}. Do not invent other birth facts, biography beyond the form, or a generic sun-sign forecast.`,
    `Name at least one **specific** natal factor (planet in sign, whole-sign house from the Ascendant, or aspect from the JSON) and tie it to a transit or same-day pattern **from the supplied data** — do not contradict the JSON.`,
    `Explain how this day differs from its neighbors in this week; do not paste the same vague paragraph into every day.`,
    `Avoid empty buzzwords unless you anchor them to a planet, sign, house, or aspect from the chart or transits.`,
  ];
}

function weeklyDayOutlineBlocks(fw: ForecastWindows, lang: AppLang): string[] {
  const lines: string[] = [];
  const bullets = weeklyDayDetailBullets(lang, fw.timezone);
  for (const iso of fw.weeklyDates) {
    lines.push(`## ${formatForecastDayHeading(iso, lang)} (${iso})`);
    for (const b of bullets) {
      lines.push(`- ${b}`);
    }
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
        `- 4–7 zdań wyłącznie o tym przedziale; całość raportu = 30 dni ${fw.monthly.start}–${fw.monthly.end}.`,
        `- W każdym etapie: nazwij przynajmniej jeden czynnik z mapy (planeta w znaku/domu lub aspekt natalny) oraz jego związek z tranzytem w tych datach; nie powtarzaj tego samego ogólnego motywu „relacji” w każdym etapie — różnicuj wątki (np. praca, dom, energia, decyzje).`,
      );
    } else if (lang === "es") {
      lines.push(`## Parte ${n}: ${seg.start} – ${seg.end}`);
      lines.push(
        `- 4–7 frases solo para este tramo; el informe completo = 30 días ${fw.monthly.start}–${fw.monthly.end}.`,
        `- En cada parte: cita al menos un factor de la carta (planeta en signo/casa o aspecto natal) y su vínculo con un tránsito en esas fechas; evita repetir el mismo cliché relacional en todas las partes — varía temas (trabajo, hogar, energía, decisiones).`,
      );
    } else {
      lines.push(`## Part ${n}: ${seg.start} – ${seg.end}`);
      lines.push(
        `- 4–7 sentences for this date range only; full forecast = 30 days ${fw.monthly.start}–${fw.monthly.end}.`,
        `- In each part: name at least one natal factor (planet in sign/house or natal aspect) and how a transit in these dates activates it; do not repeat the same generic “relationships” theme in every part — vary life areas (work, home, energy, decisions).`,
      );
    }
    lines.push(``);
  });
  return lines;
}

function editorialQualityInstructions(lang: AppLang): string[] {
  if (lang === "pl") {
    return [
      `JAKOŚĆ JĘZYKA: Pisz jak bardzo dobry polski autor i redaktor, nie jak automatyczne tłumaczenie. Tekst ma brzmieć naturalnie, płynnie i elegancko po polsku.`,
      `Unikaj kalek z angielskiego, niezgrabnych konstrukcji i sztywnego tonu. Nie używaj form typu „możesz doświadczać energii” co drugi akapit; zamiast tego pisz konkretnie, obrazowo i z wyczuciem.`,
      `Różnicuj długość zdań. Łącz interpretację astrologiczną z żywym, literackim językiem, ale bez patosu, przesady i ezoterycznego żargonu.`,
      `Dbaj o poprawną polszczyznę: właściwy szyk zdania, interpunkcję, odmianę, naturalne kolokacje i spójne przejścia między akapitami.`,
      `Nazwy astrologiczne zapisuj konsekwentnie po polsku: Słońce, Księżyc, Ascendent, Merkury, Wenus, Mars, Jowisz, Saturn, Uran, Neptun, Pluton; unikaj mieszania języków.`,
      `Przed finalną odpowiedzią mentalnie zredaguj tekst: usuń powtórzenia, puste frazy i zdania, które brzmią jak wypełniacz.`,
    ];
  }
  if (lang === "es") {
    return [
      `CALIDAD DEL LENGUAJE: Escribe como una persona nativa con gran capacidad literaria y editorial en español, no como una traducción automática.`,
      `Evita calcos del inglés, frases rígidas y tono genérico de IA. El texto debe sonar natural, fluido, elegante y emocionalmente preciso.`,
      `Varía la longitud de las frases. Une la interpretación astrológica con un estilo cuidado y evocador, sin caer en exageración, dramatismo ni jerga esotérica vacía.`,
      `Cuida la gramática, la puntuación, las concordancias, las colocaciones naturales y las transiciones entre párrafos.`,
      `Usa terminología astrológica coherente en español: Sol, Luna, Ascendente, Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno, Plutón; no mezcles idiomas.`,
      `Antes de responder, revisa mentalmente el texto: elimina repeticiones, frases de relleno y cualquier oración que suene vaga o poco humana.`,
    ];
  }
  return [
    `Language quality: write polished, natural, human prose with varied sentence rhythm and no generic filler.`,
  ];
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
    `To jest raport osobowościowy. NIE zaczynaj od tytułu H1 ani od technicznej sekcji „Wykres Natalny”. Zacznij od portretu — bez nagłówka.`,
    ``,
    `NAJWAŻNIEJSZE ZASADY FORMATU:`,
    `- Cały tekst musi być w drugiej osobie: „Ty”, „Twoja”, „masz”, „nosisz w sobie”. Nigdy nie pisz o osobie w trzeciej osobie.`,
    `- Nie używaj żadnych list punktowanych ani numerowanych w finalnym raporcie. Wszystko ma być prozą w akapitach.`,
    `- Nie zaczynaj sekcji od formuł „Merkury wskazuje na…”, „Wenus oznacza…”, „Mars pokazuje…”. Planety i znaki mają być wplecione naturalnie w opis.`,
    `- Zachowaj wszystkie fakty astrologiczne z JSON: znaki, planety, aspekty i Ascendent. Nie zmieniaj interpretacji, tylko nadaj jej lepszą strukturę i język.`,
    `- Całkowita długość ma być podobna do obecnego raportu — nie skracaj znacząco.`,
    ``,
    `Dane techniczne, których używasz tylko jako fundamentu interpretacji (nie twórz z nich osobnej sekcji w raporcie):`,
    ...cc.map((l) => `- ${l}`),
    ``,
    `Kolejność raportu ma być dokładnie taka:`,
    ``,
    `1. PORTRET — bez nagłówka`,
    `Napisz 3–4 zdania, które od razu chwytają esencję tej osoby. Nie wymieniaj nazw planet ani znaków. Pisz tak, jakbyś znał tę osobę: jej sposób wchodzenia w świat, napięcie wewnętrzne, naturalny urok, kontrast lub siłę. To ma być emocjonalny hook, nie techniczny opis.`,
    ``,
    `## Trójca: Słońce · Księżyc · Ascendent`,
    `Napisz trzy krótkie nazwane bloki w tej sekcji: „Słońce”, „Księżyc”, „Ascendent”. Każdy blok ma mieć 2–3 zdania. Pokaż, jak te trzy elementy współpracują, gdzie tworzą napięcie, a gdzie wzmacniają się nawzajem — nie rób trzech osobnych notek encyklopedycznych.`,
    ``,
    `## Umysł i komunikacja`,
    `Opisz Merkurego w 3–4 zdaniach z perspektywy „Ty”. Zacznij od sposobu myślenia i mówienia, a dopiero potem naturalnie wpleć znak/aspekty Merkurego z JSON.`,
    ``,
    `## Miłość i wartości`,
    `Opisz Wenus w 3–4 zdaniach z perspektywy „Ty”. Skup się na tym, jak kochasz, czego pragniesz, co uznajesz za piękne i jak budujesz poczucie wartości.`,
    ``,
    `## Energia i działanie`,
    `Opisz Marsa w 3–4 zdaniach z perspektywy „Ty”. Pokaż styl działania, inicjatywę, złość, odwagę i sposób dochodzenia do celu.`,
    ``,
    `## Wzrost i szczęście`,
    `Opisz Jowisza w 3–4 zdaniach z perspektywy „Ty”. Pokaż, gdzie naturalnie rośniesz, odzyskujesz wiarę, przyciągasz możliwości albo uczysz się ufać życiu.`,
    ``,
    `## Lekcje i struktura`,
    `Opisz Saturna w 3–4 zdaniach z perspektywy „Ty”. Ton ma być dojrzały i wspierający: to nie kara, tylko miejsce budowania kręgosłupa, granic i odpowiedzialności.`,
    ``,
    `## Supermoce`,
    `Nie używaj listy. Napisz 3 krótkie akapity po 2–3 zdania. Każdy akapit ma opisywać jeden dar wynikający z mapy (planeta, aspekt, kombinacja albo mocno obsadzony dom całoznakowy od Ascendentu ~${chart.ascendantDeg.toFixed(1)}°). Każdy akapit ma brzmieć tak, żeby czytelnik mógł pomyśleć: „tak, to dokładnie ja”.`,
    ``,
    `## Cienie i wyzwania`,
    `Nie używaj listy. Napisz 2–3 krótkie akapity o wzorcach, które warto zauważyć. Ton ma być czuły, nieoceniający i psychologicznie bezpieczny: opisuj wyzwanie jako mechanizm ochronny lub napięcie, nie jako wadę.`,
    ``,
    `## Relacje i miłość`,
    `Maksymalnie 4 zdania. Ma być intymnie i osobiście: pokaż, jak kochasz, jak reagujesz na bliskość, co Cię otwiera, a co zamyka. Wpleć Wenus, Księżyc i ewentualnie domy relacyjne całoznakowe, ale nie zaczynaj od techniki.`,
    ``,
    `## Kariera i powołanie`,
    `Napisz jeden mocny akapit. Połącz Saturna, Jowisza, Marsa, Merkurego, aspekty i najważniejsze domy całoznakowe związane z pracą/powołaniem, jeśli wynikają z JSON. Dodaj 1–2 konkretne przykłady ról, zawodów lub środowisk pracy, które mogą pasować do tej osoby; unikaj obietnic sukcesu i pieniędzy.`,
    ``,
    `## Na koniec`,
    `Napisz 3–5 zdań bez podsumowywania faktów. Zwróć się bezpośrednio do czytelnika jak w krótkim liście. Zakończ obrazem albo metaforą, nie listą cech i nie technicznym podsumowaniem mapy.`,
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
    `STYL (jak u doświadczonego astrologa przy konsultacji): każdy akapit musi wynikać z połączenia TEJ mapy (JSON) z realnymi tranzytami w podanych datach. Unikaj pustych ogólników („komunikacja”, „zaufanie”, „otwórz serce”) bez wskazania planety, znaku, domu całoznakowego od Ascendentu lub aspektu z JSON. Tam gdzie piszesz o relacjach, pracy lub zdrowiu psychicznym — uzasadnij to konkretnym czynnikiem mapy + tranzytem w ${fw.monthly.start}–${fw.monthly.end}, nie dla „typowej” osoby ze znakiem słonecznym.`,
    ``,
    `Nagłówki ## w tej kolejności:`,
    ``,
    `## Wykres Natalny`,
    ...cc.map((l) => `- ${l}`),
    `- 2–3 zdania: które ciała z JSON (Słońce, Księżyc, planety, Ascendent) są najsilniej aktywowane tranzytami w tym oknie — bez powtarzania całego opisu osobowości.`,
    ``,
    `## Ogólna energia 30 dni`,
    `- 3–6 zdań: syntetyczny nastrój okresu ${fw.monthly.start}–${fw.monthly.end} z wyraźnym odniesieniem do dominującego wzorca tranzytowego (np. seria aspektów do tej samej planety natalnej) oraz do Słońca / Księżyca / Ascendentu z mapy.`,
    ``,
    `## Kluczowe tranzyty (30 dni)`,
    `- Lista 6–9 punktów; każdy punkt = pełna myśl: „tranzytująca planeta X w okolicach … aspektuje natalne Y (znak/dom)” + jedno zdanie interpretacji dla TEJ osoby w tym zakresie dat. Bez jednowyrazowych punktów typu „Saturn — dyscyplina”.`,
    ``,
    ...monthlySegmentOutlineBlocks(fw, "pl"),
    ``,
    `## Relacje i dynamika serca (${fw.monthly.start}–${fw.monthly.end})`,
    `- 2 zdania: Wenus i Księżyc w mapie (znak; dom całoznakowy od Ascendentu jeśli da się to sensownie odczytać z danych) jako baza stylu dawania i odbierania bliskości.`,
    `- 4–6 zdań: które tranzyty w tym 30-dniowym oknie najsilniej dotykają tych miejsc w mapie (aspekty, wejście planety do znaku/domu); pisz o konkretnych napięciach lub wsparciach, nie o horoskopowych frazach.`,
    `- Jeśli w mapie są napięcia (np. Saturn, Pluton, Mars) wokół relacji — opisz możliwy przebieg w praktyce (scenariusze zachowań), bez straszenia i bez diagnoz.`,
    `- 1 zdanie domykające: refleksyjny kierunek pracy z energią miesiąca, spójny z mapą.`,
    ``,
    `## Praca, pieniądze i realizacja (${fw.monthly.start}–${fw.monthly.end})`,
    `- 4–6 zdań: powiąż Saturna, Jowisza, Marsa i Merkurego (z JSON) z tranzytami okresu — które obszary życia (projekty, odpowiedzialność, widoczność) się aktywizują; bez konkretnych porad inwestycyjnych i bez obietnic zarobku.`,
    ``,
    `## Rytm ciała i energii (${fw.monthly.start}–${fw.monthly.end})`,
    `- 3–5 zdań: Księżyc i ewentualnie 6. dom / Mars w mapie vs tranzyty — sen, regeneracja, obciążenie (bez diagnoz medycznych i bez suplementów).`,
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
    `# 📅 Prognoza Tygodniowa`,
    ``,
    `KRYTYCZNE: Pisz WYŁĄCZNIE o 7 kolejnych dniach od daty generowania: od ${fw.weekly.start} do ${fw.weekly.end} włącznie (strefa ${fw.timezone}). Nie używaj „poniedziałek–niedziela” jako domyślnego tygodnia — liczy się wyłącznie ten zakres dat.`,
    ``,
    `DANE: Interpretujesz wyłącznie osobę z formularza: ${dob}, godzina ${tob}, miejsce ${pob} — plus pozycje i aspekty z załączonego JSON mapy natalnej oraz tranzyty / ephemerida przekazane w tym prompcie dla dat ${fw.weekly.start}–${fw.weekly.end}. Nie uzupełniaj braków „z głowy” ani z ogólnej astrologii spoza tych danych.`,
    ``,
    `STYL: Każdy dzień to mini-konsultacja z mapy — opis ma być **obszerniejszy** niż jedna myśl: rozwijaj wątek dnia (napięcie, wsparcie, tempo) z nazwanymi czynnikami mapy i tranzytów; bez diagnoz medycznych i bez obietnic finansowych.`,
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
    `This is a personality report. Do NOT start with an H1 title or a technical “Natal chart” section. Start with the portrait — no heading.`,
    ``,
    `MOST IMPORTANT FORMAT RULES:`,
    `- Write entirely in the second person: “you”, “your”, “you carry”, “you tend to”. Never describe the person in third person.`,
    `- Do not use bullet points or numbered lists anywhere in the final report. Everything must be prose in paragraphs.`,
    `- Do not start sections with formulas like “Mercury in Aries indicates…” or “Venus means…”. Planets and signs should be woven naturally into the description.`,
    `- Preserve every astrological fact from the JSON: signs, planets, aspects, and Ascendant. Do not change the interpretation — only restructure and improve the writing.`,
    `- Total length should be similar to the current report; do not shorten significantly.`,
    ``,
    `Technical data to use only as the foundation for interpretation (do not create a separate section from it in the final report):`,
    ...cc.map((l) => `- ${l}`),
    ``,
    `The report order must be exactly this:`,
    ``,
    `1. PORTRAIT — no heading`,
    `Write 3–4 sentences that immediately capture the person's essence. Do not mention planet names or signs. Write as if you already know this person: how they enter the world, their inner tension, natural charm, contrast, or strength. This is the emotional hook, not a technical description.`,
    ``,
    `## The Core Trinity: Sun · Moon · Ascendant`,
    `Write three short named blocks inside this section: “Sun”, “Moon”, “Ascendant”. Each block should be 2–3 sentences. Show how these three elements relate to each other and create tension or synergy — do not write three separate encyclopedia entries.`,
    ``,
    `## Mind & Communication`,
    `Describe Mercury in 3–4 sentences from the second-person perspective. Start with how you think and communicate, then naturally weave in Mercury's sign/aspects from the JSON.`,
    ``,
    `## Love & Values`,
    `Describe Venus in 3–4 sentences from the second-person perspective. Focus on how you love, what you desire, what you find beautiful, and how you build a sense of value.`,
    ``,
    `## Energy & Action`,
    `Describe Mars in 3–4 sentences from the second-person perspective. Show your action style, initiative, anger, courage, and way of pursuing goals.`,
    ``,
    `## Growth & Fortune`,
    `Describe Jupiter in 3–4 sentences from the second-person perspective. Show where you naturally grow, regain faith, attract opportunities, or learn to trust life.`,
    ``,
    `## Lessons & Structure`,
    `Describe Saturn in 3–4 sentences from the second-person perspective. The tone should be mature and supportive: this is not punishment, but where you build backbone, boundaries, and responsibility.`,
    ``,
    `## Your Gifts`,
    `Do not use a list. Write 3 short paragraphs of 2–3 sentences each. Each paragraph describes one gift from the chart (planet, aspect, combination, or strongly emphasized whole-sign house from Ascendant ~${chart.ascendantDeg.toFixed(1)}°). Each paragraph should feel like something the reader could recognize and think: “yes, that's exactly me.”`,
    ``,
    `## Shadows & Challenges`,
    `Do not use a list. Write 2–3 short paragraphs about patterns worth noticing. The tone must be compassionate, non-judgmental, and psychologically safe: frame each challenge as a protective mechanism or inner tension, not as a flaw.`,
    ``,
    `## Love & Relationships`,
    `Maximum 4 sentences. Make it intimate and personal: show how you love, how you respond to closeness, what opens you, and what makes you close down. Weave in Venus, Moon, and relationship houses if they are relevant, but do not start with technical explanation.`,
    ``,
    `## Career & Calling`,
    `Write one strong paragraph. Combine Saturn, Jupiter, Mars, Mercury, aspects, and the most important whole-sign houses connected with work/calling if they follow from the JSON. Add 1–2 concrete examples of roles, professions, or work environments that may suit this person; avoid promises of success or money.`,
    ``,
    `## In Closing`,
    `Write 3–5 sentences without summarizing facts. Address the reader directly, like a short letter. End on an image or metaphor, not a list of traits and not a technical summary of the chart.`,
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
    `STYLE (professional consultation): every section must tie THIS chart (JSON) to real transits in those dates. Ban empty clichés (“communication”, “trust”, “open your heart”) unless you name the planet, sign, whole-sign house from Ascendant, or aspect from JSON. For love, work, or emotional strain — always show chart factor + transit in ${fw.monthly.start}–${fw.monthly.end}, not generic Sun-sign advice.`,
    ``,
    `## Natal chart`,
    ...cc.map((l) => `- ${l}`),
    `- 2–3 sentences: which bodies from JSON (Sun, Moon, planets, Ascendant) are most activated by transits in this window — without re-writing the full personality portrait.`,
    ``,
    `## Overall energy (30-day window)`,
    `- 3–6 sentences: the mood of ${fw.monthly.start}–${fw.monthly.end} with a clear dominant transit pattern (e.g. repeated hits to one natal planet) woven with Sun / Moon / Ascendant from the chart.`,
    ``,
    `## Key transits (30 days)`,
    `- 6–9 bullets; each bullet = one full thought: “transiting X around … aspects natal Y (sign/house)” + one sentence of interpretation for THIS person in this date range. No one-word bullets like “Saturn — discipline”.`,
    ``,
    ...monthlySegmentOutlineBlocks(fw, "en"),
    ``,
    `## Relationships & emotional climate (${fw.monthly.start}–${fw.monthly.end})`,
    `- 2 sentences: natal Venus and Moon (sign; whole-sign house from Ascendant if you can infer it sensibly) as the baseline for closeness and needs.`,
    `- 4–6 sentences: which transits in this 30-day window most touch those chart areas (aspects, sign/house ingress); describe concrete tensions or support, not magazine phrases.`,
    `- If the chart shows strain (Saturn, Pluto, Mars) around relating — describe likely behavioral patterns in practice, without fear-mongering or diagnoses.`,
    `- 1 closing sentence: a reflective way to work with the month’s energy, consistent with the chart.`,
    ``,
    `## Work, money & execution (${fw.monthly.start}–${fw.monthly.end})`,
    `- 4–6 sentences: link Saturn, Jupiter, Mars, and Mercury (from JSON) to transits of the period — which life themes (projects, responsibility, visibility) activate; no investment picks or income promises.`,
    ``,
    `## Body rhythm & energy (${fw.monthly.start}–${fw.monthly.end})`,
    `- 3–5 sentences: Moon and optionally 6th house / Mars vs transits — sleep, recovery, load (no medical diagnosis or supplement advice).`,
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
    `# 📅 Weekly forecast`,
    ``,
    `CRITICAL: Write ONLY about 7 consecutive days from the generation date: ${fw.weekly.start} through ${fw.weekly.end} inclusive (${fw.timezone}). Do NOT default to Monday–Sunday; only these dates matter.`,
    ``,
    `DATA: You only have the form birth facts (${dob}, ${tob}, ${pob}) plus the attached natal JSON and the transits / ephemeris supplied in this prompt for ${fw.weekly.start}–${fw.weekly.end}. Do not invent other birth details or fill gaps from general astrology outside this payload.`,
    ``,
    `STYLE: Each day should read like a short chart-based consultation — **more detailed** than a single vague line: develop the day’s theme (tension, support, pacing) with named chart and transit factors; no medical diagnoses or financial promises.`,
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
    `Este es un informe de personalidad. NO empieces con un título H1 ni con una sección técnica de “Carta natal”. Empieza con el retrato — sin encabezado.`,
    ``,
    `REGLAS DE FORMATO MÁS IMPORTANTES:`,
    `- Escribe siempre en segunda persona: “tú”, “tu”, “llevas”, “tienes”, “sueles”. Nunca describas a la persona en tercera persona.`,
    `- No uses viñetas ni listas numeradas en el informe final. Todo debe estar escrito en prosa, en párrafos.`,
    `- No empieces secciones con fórmulas como “Mercurio en Aries indica…” o “Venus significa…”. Los planetas y signos deben integrarse de forma natural en la descripción.`,
    `- Conserva todos los hechos astrológicos del JSON: signos, planetas, aspectos y Ascendente. No cambies la interpretación; solo mejora la estructura y la escritura.`,
    `- La extensión total debe ser similar al informe actual; no lo acortes de forma significativa.`,
    ``,
    `Datos técnicos que debes usar solo como base de la interpretación (no crees con ellos una sección separada en el informe final):`,
    ...cc.map((l) => `- ${l}`),
    ``,
    `El orden del informe debe ser exactamente este:`,
    ``,
    `1. RETRATO — sin encabezado`,
    `Escribe 3–4 frases que capten de inmediato la esencia de la persona. No menciones nombres de planetas ni signos. Escribe como si ya conocieras a esta persona: su forma de entrar en el mundo, su tensión interior, su encanto natural, su contraste o su fuerza. Este es el gancho emocional, no una descripción técnica.`,
    ``,
    `## La Trinidad Central: Sol · Luna · Ascendente`,
    `Escribe tres bloques breves con nombre dentro de esta sección: “Sol”, “Luna”, “Ascendente”. Cada bloque debe tener 2–3 frases. Muestra cómo estos tres elementos se relacionan entre sí y crean tensión o sinergia; no escribas tres entradas enciclopédicas separadas.`,
    ``,
    `## Mente y Comunicación`,
    `Describe Mercurio en 3–4 frases desde la segunda persona. Empieza por cómo piensas y te comunicas, y después integra de forma natural el signo/aspectos de Mercurio del JSON.`,
    ``,
    `## Amor y Valores`,
    `Describe Venus en 3–4 frases desde la segunda persona. Céntrate en cómo amas, qué deseas, qué consideras bello y cómo construyes tu sentido de valor.`,
    ``,
    `## Energía y Acción`,
    `Describe Marte en 3–4 frases desde la segunda persona. Muestra tu estilo de acción, iniciativa, rabia, valentía y manera de perseguir objetivos.`,
    ``,
    `## Crecimiento y Fortuna`,
    `Describe Júpiter en 3–4 frases desde la segunda persona. Muestra dónde creces de forma natural, recuperas la fe, atraes oportunidades o aprendes a confiar en la vida.`,
    ``,
    `## Lecciones y Estructura`,
    `Describe Saturno en 3–4 frases desde la segunda persona. El tono debe ser maduro y de apoyo: no es castigo, sino el lugar donde construyes columna vertebral, límites y responsabilidad.`,
    ``,
    `## Tus Dones`,
    `No uses lista. Escribe 3 párrafos breves de 2–3 frases cada uno. Cada párrafo describe un don que surge de la carta (planeta, aspecto, combinación o casa entera fuertemente enfatizada desde el Ascendente ~${chart.ascendantDeg.toFixed(1)}°). Cada párrafo debe sonar como algo que la persona pueda reconocer y pensar: “sí, eso soy yo”.`,
    ``,
    `## Sombras y Desafíos`,
    `No uses lista. Escribe 2–3 párrafos breves sobre patrones que conviene observar. El tono debe ser compasivo, no crítico y psicológicamente seguro: presenta cada desafío como un mecanismo de protección o una tensión interna, no como un defecto.`,
    ``,
    `## Amor y Relaciones`,
    `Máximo 4 frases. Debe sentirse íntimo y personal: muestra cómo amas, cómo reaccionas ante la cercanía, qué te abre y qué te hace cerrarte. Integra Venus, Luna y casas relacionales si son relevantes, pero no empieces desde la explicación técnica.`,
    ``,
    `## Carrera y Vocación`,
    `Escribe un párrafo fuerte. Combina Saturno, Júpiter, Marte, Mercurio, aspectos y las casas enteras más importantes relacionadas con trabajo/vocación si se desprenden del JSON. Añade 1–2 ejemplos concretos de roles, profesiones o entornos laborales que podrían encajar con esta persona; evita promesas de éxito o dinero.`,
    ``,
    `## Para Terminar`,
    `Escribe 3–5 frases sin resumir hechos. Dirígete directamente a la persona, como en una carta breve. Termina con una imagen o metáfora, no con una lista de rasgos ni un resumen técnico de la carta.`,
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
    `ESTILO (consulta profesional): cada apartado debe enlazar ESTA carta (JSON) con tránsitos reales en esas fechas. Evita clichés vacíos (“comunicación”, “confianza”) sin planeta, signo, casa entera desde el ascendente o aspecto del JSON. En amor, trabajo o carga emocional — siempre factor natal + tránsito en ${fw.monthly.start}–${fw.monthly.end}, no consejos genéricos de signo solar.`,
    ``,
    `## Carta natal`,
    ...cc.map((l) => `- ${l}`),
    `- 2–3 frases: qué cuerpos del JSON (Sol, Luna, planetas, Ascendente) reciben más “luz” de tránsitos en esta ventana — sin rehacer el retrato completo.`,
    ``,
    `## Energía general (ventana de 30 días)`,
    `- 3–6 frases: clima de ${fw.monthly.start}–${fw.monthly.end} con un patrón dominante de tránsitos (p. ej. repetición de aspectos al mismo planeta natal) y Sol / Luna / Ascendente de la carta.`,
    ``,
    `## Tránsitos clave (30 días)`,
    `- 6–9 viñetas; cada una = idea completa: “tránsito X hacia … aspecta natal Y (signo/casa)” + una frase de interpretación para ESTA persona en esas fechas. Nada de viñetas de una palabra.`,
    ``,
    ...monthlySegmentOutlineBlocks(fw, "es"),
    ``,
    `## Relaciones y clima emocional (${fw.monthly.start}–${fw.monthly.end})`,
    `- 2 frases: Venus y Luna natales (signo; casa entera desde el ascendente si se infiere con sentido) como base de vínculo y necesidades.`,
    `- 4–6 frases: qué tránsitos de esta ventana tocan más esas zonas (aspectos, ingreso a signo/casa); tensiones o apoyos concretos, no frases de revista.`,
    `- Si la carta muestra tensión (Saturno, Plutón, Marte) en el vínculo — describe patrones de conducta probables, sin alarmismo ni diagnósticos.`,
    `- 1 frase de cierre: reflexión práctica acorde a la carta.`,
    ``,
    `## Trabajo, dinero y ejecución (${fw.monthly.start}–${fw.monthly.end})`,
    `- 4–6 frases: Saturno, Júpiter, Marte y Mercurio (JSON) con tránsitos del período — qué temas (proyectos, responsabilidad, visibilidad) se activan; sin recomendaciones de inversión ni promesas de ingreso.`,
    ``,
    `## Ritmo corporal y energía (${fw.monthly.start}–${fw.monthly.end})`,
    `- 3–5 frases: Luna y opcionalmente casa 6 / Marte vs tránsitos — sueño, recuperación, carga (sin diagnóstico médico ni suplementos).`,
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
    `# 📅 Pronóstico semanal`,
    ``,
    `CRÍTICO: Solo 7 días consecutivos desde la generación: ${fw.weekly.start}–${fw.weekly.end} (${fw.timezone}). No uses lunes–domingo por defecto; solo estas fechas.`,
    ``,
    `DATOS: Solo la persona del formulario: ${dob}, hora ${tob}, lugar ${pob}, más el JSON natal y los tránsitos / efemérides de este prompt para ${fw.weekly.start}–${fw.weekly.end}. No inventes otros datos de nacimiento ni rellenes vacíos con astrología genérica fuera de estos datos.`,
    ``,
    `ESTILO: Cada día debe leerse como una mini-consulta basada en la carta — **más extenso** que una sola idea vaga: desarrolla el tema del día (tensión, apoyo, ritmo) citando factores concretos del mapa y tránsitos; sin diagnósticos médicos ni promesas financieras.`,
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

function natalBasicFreeOutline(
  lang: AppLang,
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
): string[] {
  const jsonHint =
    lang === "pl"
      ? `Trzymaj się liczb z JSON (długości ekliptyczne, Ascendent, strefa ${chart.timezone}, współrzędne) — nie zaprzeczaj im.`
      : lang === "es"
        ? `Respeta las cifras del JSON (longitudes, Ascendente, zona ${chart.timezone}, coordenadas) — no las contradigas.`
        : `Stay consistent with the JSON numbers (longitudes, Ascendant, timezone ${chart.timezone}, coordinates) — do not contradict them.`;
  if (lang === "pl") {
    return [
      `Nie używaj nagłówka poziomu # — pierwszy nagłówek w treści interpretacji to wyłącznie „## Dane urodzenia”.`,
      ``,
      `Sekcja „## Dane urodzenia”: jeden akapit (2–3 zdania) z datą ${dob}, godziną ${tob}, miejscem ${pob} i strefą ${chart.timezone}.`,
      ``,
      `Potem — wyłącznie trzy nagłówki ## w tej kolejności (bez innych sekcji poza „Dane urodzenia”):`,
      ``,
      `## Słońce`,
      `- 5–8 zdań: wyłącznie dla TEJ osoby i TEJ mapy (JSON). Podaj znak i sens stopnia Słońca z danych; rdzeń motywacji, styl bycia, jak „świeci” energia słoneczna w życiu codziennym.`,
      `- Możesz wpleść 1–2 najsilniejsze aspekty natalne dotykające Słońca (orb ~6° według długości ekliptycznej z JSON); nie wymyślaj ciał spoza JSON.`,
      ``,
      `## Księżyc`,
      `- 5–8 zdań: znak i sens Księżyca z mapy; potrzeby emocjonalne, reakcje, co daje poczucie bezpieczeństwa; 0–2 aspekty do Księżyca z JSON, jeśli są czytelne.`,
      ``,
      `## Ascendent`,
      `- 4–7 zdań: Ascendent ok. ${chart.ascendantDeg.toFixed(1)}° i jego znak; pierwsze wrażenie, sposób wchodzenia w kontakt z otoczeniem; bez przepowiadania zdarzeń.`,
      ``,
      `Sekcji „## Wykres Natalny” z pełną listą aspektów: NIE — to wyłącznie okrojony podgląd.`,
      jsonHint,
    ];
  }
  if (lang === "es") {
    return [
      `No uses un encabezado de nivel # — el primer encabezado del texto interpretativo es solo “## Datos de nacimiento”.`,
      ``,
      `“## Datos de nacimiento”: un párrafo (2–3 frases) con fecha ${dob}, hora ${tob}, lugar ${pob} y zona ${chart.timezone}.`,
      ``,
      `Después, SOLO tres encabezados ## en este orden (tras “Datos de nacimiento”):`,
      ``,
      `## Sol`,
      `- 5–8 frases: solo para ESTA persona y ESTA carta (JSON). Signo y sentido del grado solar; núcleo motivacional y estilo de presencia.`,
      `- Puedes incluir 1–2 aspectos natales fuertes al Sol (orbe ~6° según longitudes del JSON); no inventes cuerpos fuera del JSON.`,
      ``,
      `## Luna`,
      `- 5–8 frases: signo lunar; necesidades emocionales, reacciones, qué aporta calma; 0–2 aspectos a la Luna si se ven claros en el JSON.`,
      ``,
      `## Ascendente`,
      `- 4–7 frases: Ascendente ~${chart.ascendantDeg.toFixed(1)}° y su signo; primera impresión y filtro social; sin predicciones de eventos.`,
      ``,
      `No escribas una sección larga “Carta natal” con listas de aspectos.`,
      jsonHint,
    ];
  }
  return [
    `Do not use a level-# heading — the first heading in the interpretive text must be “## Birth details” only.`,
    ``,
    `“## Birth details”: one paragraph (2–3 sentences) with date ${dob}, time ${tob}, place ${pob}, timezone ${chart.timezone}.`,
    ``,
    `Then add ONLY these three ## headings, in this order (after “Birth details”):`,
    ``,
    `## Sun sign`,
    `- 5–8 sentences: for THIS person and THIS chart (JSON) only. State the Sun’s sign and degree sense from the data; core motivation, how solar energy shows up day to day.`,
    `- You may weave in 1–2 strongest natal aspects to the Sun (~6° orb from ecliptic longitudes in JSON); do not invent bodies not in JSON.`,
    ``,
    `## Moon sign`,
    `- 5–8 sentences: Moon sign from the chart; emotional needs, reactions, what helps you feel grounded; 0–2 aspects to the Moon from JSON if clearly readable.`,
    ``,
    `## Ascendant`,
    `- 4–7 sentences: Ascendant ~${chart.ascendantDeg.toFixed(1)}° and its sign; first impression and social “filter”; no event fortune-telling.`,
    ``,
    `Do NOT add a long “Natal chart” section listing all aspects.`,
    jsonHint,
  ];
}

export function buildNatalBasicFreePrompt(input: {
  dob: string;
  tob: string;
  pob: string;
  lang: AppLang;
  chart: NatalChartPayload;
}): string {
  const { dob, tob, pob, lang, chart } = input;
  const ephem = natalChartSummaryJson(chart);
  const outline = natalBasicFreeOutline(lang, chart, dob, tob, pob);

  if (lang === "pl") {
    return [
      `Jesteś doświadczonym astrologiem. Klient otrzymuje DARMOWY, krótszy podgląd mapy — tylko interpretacja Słońca, Księżyca i Ascendentu (nie zastępuje pełnego płatnego raportu osobowości).`,
      ``,
      `WAŻNE: Cały dokument wyłącznie po polsku.`,
      ``,
      ...editorialQualityInstructions("pl"),
      ``,
      `Dane urodzenia:`,
      `- Data: ${dob}`,
      `- Godzina: ${tob}`,
      `- Miejsce: ${pob}`,
      ``,
      `JSON ephemeridy (tropik, geocentryczny). Nie zaprzeczaj liczbom — interpretuj tylko w ramach trzech sekcji:`,
      "```json",
      ephem,
      "```",
      ``,
      ...outline,
      ``,
      `Format: Markdown; poza powyższym blokiem JSON bez innych JSON-ów i bez fence’ów kodu w interpretacji.`,
      `Nie wstawiaj żadnego tytułu marketingowego typu „Darmowy podgląd” — tylko sekcje ## opisane w outline.`,
      `Ton: ciepły, konkretny, refleksyjny, stylistycznie dopracowany; bez medycyny, prawa i inwestycji.`,
    ].join("\n");
  }
  if (lang === "es") {
    return [
      `Eres un astrólogo experimentado. La persona recibe una vista gratuita y breve: solo Sol, Luna y Ascendente (no reemplaza el informe de personalidad de pago).`,
      ``,
      `IMPORTANTE: Todo en español.`,
      ``,
      ...editorialQualityInstructions("es"),
      ``,
      `Datos de nacimiento:`,
      `- Fecha: ${dob}`,
      `- Hora: ${tob}`,
      `- Lugar: ${pob}`,
      ``,
      `JSON de efemérides. No lo contradigas; interpreta solo en las tres secciones:`,
      "```json",
      ephem,
      "```",
      ``,
      ...outline,
      ``,
      `Formato: Markdown; sin más JSON ni fences en la lectura.`,
      `No insertes un titular promocional tipo “Vista gratuita” — solo las secciones ## del outline.`,
      `Tono: cálido, concreto, reflexivo y cuidadosamente escrito.`,
      `Evita consejos médicos, legales o financieros.`,
    ].join("\n");
  }
  return [
    `You are an experienced astrologer. The user receives a FREE, shorter chart preview: only individualized Sun, Moon, and Ascendant interpretation (not the full paid personality report).`,
    ``,
    `IMPORTANT: Entire document in English.`,
    ``,
    `Birth data:`,
    `- Date: ${dob}`,
    `- Time: ${tob}`,
    `- Place: ${pob}`,
    ``,
    `Ephemeris JSON (tropical, geocentric). Do not contradict — interpret only within the three sections:`,
    "```json",
    ephem,
    "```",
    ``,
    ...outline,
    ``,
    `Formatting: Markdown only; no extra JSON or code fences in the reading.`,
    `Do not add a promotional H1 like “Free preview” — only the ## sections from the outline.`,
    `Tone: warm, specific, reflective. Avoid medical, legal, or financial advice.`,
  ].join("\n");
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
  if (reportType === "natal_basic") {
    throw new Error("natal_basic is generated without an LLM prompt.");
  }
  const fw = getForecastWindows();
  const ephem = natalChartSummaryJson(chart);
  const outline = outlineFor(reportType, lang, chart, dob, tob, pob, fw);

  const commonPl = [
    `Jesteś doświadczonym astrologiem. Klient zapłacił za bardzo osobisty, spójny raport w języku polskim.`,
    ``,
    `WAŻNE: Cały dokument musi być wyłącznie po polsku (nagłówki i treść).`,
    ``,
    ...editorialQualityInstructions("pl"),
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
    `Ton: ciepły, konkretny, refleksyjny, stylistycznie dopracowany.`,
    `Unikaj porad medycznych, prawnych i inwestycyjnych.`,
  ];

  const commonEs = [
    `Eres un astrólogo experimentado. Lectura personal en español.`,
    ``,
    `IMPORTANTE: Todo en español.`,
    ``,
    ...editorialQualityInstructions("es"),
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
    `Tono: cálido, concreto, reflexivo y cuidadosamente escrito.`,
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
