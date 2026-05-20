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
  const dayPrefix =
    lang === "pl" ? "Dzień" : lang === "es" ? "Día" : "Day";
  for (const iso of fw.weeklyDates) {
    lines.push(`## ${dayPrefix}: ${formatForecastDayHeading(iso, lang)}`);
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
      lines.push(`## Etap ${n}: ${seg.start}–${seg.end}`);
      lines.push(
        `- 4–7 zdań wyłącznie o tym przedziale; całość raportu = 30 dni ${fw.monthly.start}–${fw.monthly.end}.`,
        `- W każdym etapie: nazwij przynajmniej jeden czynnik z mapy (planeta w znaku/domu lub aspekt natalny) oraz jego związek z tranzytem w tych datach; nie powtarzaj tego samego ogólnego motywu „relacji” w każdym etapie — różnicuj wątki (np. praca, dom, energia, decyzje).`,
      );
    } else if (lang === "es") {
      lines.push(`## Parte ${n}: ${seg.start}–${seg.end}`);
      lines.push(
        `- 4–7 frases solo para este tramo; el informe completo = 30 días ${fw.monthly.start}–${fw.monthly.end}.`,
        `- En cada parte: cita al menos un factor de la carta (planeta en signo/casa o aspecto natal) y su vínculo con un tránsito en esas fechas; evita repetir el mismo cliché relacional en todas las partes — varía temas (trabajo, hogar, energía, decisiones).`,
      );
    } else {
      lines.push(`## Part ${n}: ${seg.start}–${seg.end}`);
      lines.push(
        `- 4–7 sentences for this date range only; full forecast = 30 days ${fw.monthly.start}–${fw.monthly.end}.`,
        `- In each part: name at least one natal factor (planet in sign/house or natal aspect) and how a transit in these dates activates it; do not repeat the same generic “relationships” theme in every part — vary life areas (work, home, energy, decisions).`,
      );
    }
    lines.push(``);
  });
  return lines;
}

function astrologyWarmConsultationVoice(lang: AppLang): string {
  if (lang === "pl") {
    return [
      `GŁOS (jak przy dobrej konsultacji albo przy głębokiej lekturze tarota): nie piszesz jak skrót w gazecie ani jak suchy podręcznik — piszesz jak astrolog widzący konkretnego człowieka w jego życiu. Krąż między symbolem (planeta/znak/dom) a **namiastką codzienności**: rozmowa, dom, zmęczenie, praca, bliskość, konflikt na spokojnie — bez wymyślania nieznanych faktów z biografii, zawsze opierając się na JSON.`,
      `Bądź **osobisty i konkretny**: zamiast abstraktów („energia komunikacji”) pokaż, jak to może odczuwać lub przeżywać adresat w realnych mikrosytuacjach. Jedna myśl = jeden konkretnie nazwany czynnik z mapy.`,
      `Ciepło i szacunek: empatyczna intonacja jak u osoby sprawnej psychologicznie; bez katastrofizacji, pogardy ani fortelowania zdarzeń.`,
      `Zakładany rozmiar (personality premium): świadome dążenie do orientacyjnie **2 700–4 500 słów** w całym dokumencie; każda sekcja H2 to wyraźnie wypełniona treść, nie lakoniczne streszczenie.`,
    ].join("\n");
  }
  if (lang === "es") {
    return [
      `VOZ (consulta cercana como el tarot en profundidad): no escribas como un boletín de prensa ni como un manual rígido; escribes como astrólogo/a ante una persona concreta en su vida. Alterna símbolo (planeta/signo/casa) con **instantes cotidianos reconocibles** (charla íntima, casa, trabajo, cansancio, cercanía) — sin inventar biografía fuera del formulario, siempre ligado al JSON.`,
      `Sé **personal y específico**: en lugar de abstracciones („energías de comunicación”), muestra cómo eso puede sentirse o vivirse en microrrelatos cotidianos plausiblemente conectados a la carta. Una idea = un factor bien nombrado de la carta.`,
      `Calidez y respeto: tono cercano como en un taller de introspección, sin alarmismo ni condescendencia.`,
      `Extensión orientativa del informe premium: apunta a **unos 3.000–4.800 palabras** en total; cada H2 debe sentirse completo y habitado, no a un extracto.`,
    ].join("\n");
  }
  return [
    `VOICE (like a seated consultation — match the intimacy of CosmoTips tarot): not a newspaper blurb or dry textbook prose; you respond to a real person's chart-life with presence. Alternate chart symbols (planet/sign/house) with **grounded vignettes** (conversation at home, pacing at work, quiet evening, tenderness, friction calmly named) — no invented biography; always tied to chart JSON.`,
    `Stay **specific and embodied**: swap vague placeholders for how this tends to register in ordinary moments—each beat anchored to named chart factors.`,
    `Warm psychologically literate empathy; avoid doom, moralizing fortune-telling, or cold catalogues of placements.`,
    `Target length for this premium synthesis: roughly **3,100–5,400 words total** overall; each H2 deserves several developed paragraphs.`,
  ].join("\n");
}

function editorialQualityInstructions(lang: AppLang): string[] {
  if (lang === "pl") {
    return [
      `JAKOŚĆ JĘZYKA: Pisz jak bardzo dobry polski autor i redaktor, nie jak automatyczne tłumaczenie z angielskiego. Tekst ma brzmieć naturalnie, płynnie i elegancko po polsku.`,
      `PERSPEKTYWA: Pisz jako astrolog w pierwszej osobie i zwracaj się konsekwentnie do czytelnika na „Ty” (nie „Pan/Pani”, nie neutralny opis w trzeciej osobie). Naturalne zwroty: „Widzę u Ciebie…”, „Stoisz teraz…”, „Twoja mapa sugeruje…”.`,
      `KALKI I ANGLICYMY (zakaz dosłownych przeniesień): unikaj wyrażeń typu *mindset*, *self-care*, *healing*, *empowerment*, *holding space*, *alignment*, *authentic*, *commitment*, *process* jako rzeczownika angielskiego, *manifestować* nad wyraz ezoterycznie, „robić proces”, „doświadczać energii” jako pustego fuzu co akapit. Szukaj naturalnych polskich odpowiedników („sposób myślenia”, „zadbać o siebie”, „powrót do równowagi”, „granice”, „odwaga”, „realizacja”, „przepracować emocje”) albo przemyśl zdanie bez żargonu.`,
      `DOPROWADŹ POLSZCZYZNĘ DO POPRAWNOŚCI: poprawna odmiana i interpunkcja; logiczny szyk zdań (unikaj stylu „łańcucha rzeczowników” jak w instrukcji technicznej); naturalne kolokacje i spójne przejścia między akapitami.`,
      `Unikaj sztywnego tonu „AI”: nie powtarzaj fraz typu „warto zauważyć”, „w tym kontekście”, „jest istotne, że…” w każdym akapicie.`,
      `Różnicuj długość zdań. Łącz interpretację astrologiczną z żywym językiem, ale bez patosu, przesady i pustego ezoterycznego żargonu.`,
      `Terminologia astrologiczna wyłącznie po polsku: Słońce, Księżyc, Ascendent, Merkury, Wenus, Mars, Jowisz, Saturn, Uran, Neptun, Pluton; tranzyt, aspekt, dom (nie mieszaj angielskiego Ascendant ani „House”).`,
      `PRZED ODESŁANIEM ODPOWIEDZI zrób samoredakcję: usuń powtórzenia, puste frazy i zdania brzmiące jak tłumaczenie maszynowe.`,
    ];
  }
  if (lang === "es") {
    return [
      `CALIDAD DEL LENGUAJE: Escribe como persona nativa con buen nivel literario y editorial en español, no como traducción automática del inglés. El texto debe sonar natural, fluido y cuidado.`,
      `PERSPECTIVA: Escribe como astróloga/o en primera persona y dirígete al lector con **tú** de forma uniforme en todo el informe (no alternes con *usted* salvo citas formales irrelevantes aquí). NO describas a la persona en tercera persona.`,
      `CALCOS Y ANGLICISMOS: Evita préstamos innecesarios (*mindset*, *coaching*, *feedback*, *self-care*, *healing journey*, *trigger*, *holding space*, *alignment*, *authentic*, *manifestar* en tono cursi repetido). Usa español natural: “autocuidado”, “límites claros”, “sanar”, “reaccionar”, “coherencia interior”, “atreverte”, “compromiso”, etc., según el contexto.`,
      `Construcciones: Evita el calco “**hacer sentido**” (muy marcado del inglés *make sense*); prefiere “**tiene sentido**”, “**cuadra**”, “**es coherente**”, “**se entiende que…**”.`,
      `GRAMÁTICA Y ESTILO: Cuida concordancias, puntuación, subjuntivo donde corresponda y transiciones naturales entre párrafos. Varía la longitud de las frases.`,
      `Evita muletillas de IA: no abuses de “en este sentido”, “es importante destacar”, “cabía destacar que…” en cada párrafo.`,
      `REGISTRO GEOGRÁFICO: Usa un español estándar comprensible en España y Latinoamérica; evita vueltas solo regionales cuando exista alternativa neutra.`,
      `Terminología astrológica coherente en español: Sol, Luna, Ascendente, Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno, Plutón; tránsito, aspecto, casas — no mezcles términos en inglés.`,
      `Antes de responder, revisa mentalmente el texto: elimina repeticiones, frases de relleno y cualquier línea que suene traducida palabra por palabra.`,
    ];
  }
  return [
    `Language quality: write polished, natural English — not translated-from-another-language prose. Avoid hollow buzzwords unless tied to chart specifics.`,
    `Perspective: write as the astrologer in first person and address the reader directly in second person. Avoid detached third-person descriptions of “the querent”.`,
    `Vary sentence length; prefer vivid, concrete wording over vague wellness jargon.`,
    `Before sending, mentally edit for repetition and filler.`,
  ];
}

/** H2-body instructions for premium personality restructuring — localized (was accidentally Polish-only for all langs). */
function premiumPersonSectionBodies(
  lang: AppLang,
  chart: NatalChartPayload,
  birthTimeUnknown: boolean,
): string[] {
  const ascNotePl = birthTimeUnknown
    ? `Ascendent traktuj jak orientacyjny — dopisz przy każdej ważnej wzmiance zastrzeżenie; bez udawania pewności znaku, stopnia lub domów.`
    : `Uwzględnij sens Ascendentu i znak wg JSON jako psychologiczną ramę pierwszego wrażenia i „filtru”, który nadajesz światu.`;
  const ascNoteEs = birthTimeUnknown
    ? `Trata el Ascendente como orientativo: dilo cuando importe; no finjas certeza de signo, grado ni casas.`
    : `Usa Ascendiente y signo según JSON como marco de primera impresión y “filtro” con lo exterior.`;
  const ascNoteEn = birthTimeUnknown
    ? `Treat the Ascendant as tentative only — say so whenever it matters; do not pretend its sign, degree, or houses are lock-solid.`
    : `Use Ascendant meaning and sign from the JSON as the psychological frame for first impressions and perceptual filtering.`;

  const ascTriplePl = ascNotePl;
  const ascTripleEs = ascNoteEs;
  const ascTripleEn = ascNoteEn;

  if (lang === "pl") {
    return [
      `Wejdź nie od encyklopedii, lecz od obrazu: uchwyć ludzką esencję bez mechanicznego wyliczenia planet jako listy „co znaczą”. Nadaj kosmogramowi puls — sposób bycia, główna sprężyna wewnętrzna, naturalny kontrast, to, po czym adresat zostałby poznany w krótkim kontakcie.`,
      `Zsyntetyzuj Słońce, Księżyc i Ascendent jak jedno ciało emocji i celu — motywacja, potrzeby, sposób wchodzenia w świat, napięcia i synergia. ${ascTriplePl}`,
      `Oprzyj się na Merkurym po polsku jak na „głos w głowie i w rozmowie”: styl myślenia, tempo, nauka, wrażliwość słów, humor lub ostrożność, sposób bycia odebranym w dialgu — znaki/aspekty tylko wplecione płynnie.`,
      `Spleć Wenus, Księżyc i wątki relacyjne z mapy jak opowieść o bliskości — styl przywiązania, dawanie/czerpanie dotyku słów i czułości, gdzie rośnie bezpieczeństwo, co zasuwa „szlaban” przy zranieniu.`,
      `Niech Mars i dynamika czynienia poczują się namacalnie — inicjatywa, granice, konkurencja, reakcja na presję i sposób odzyskiwania ognia po utracie.`,
      `Talentów nie wyliczaj mechanicznie: pokaż je jako żywe dysponowanie zasobami tam, gdzie planety/dom/aspekty faktycznie dają przewagę.`,
      `Sekcja centralna dla zaufania klientki/klienta: nazwij cienie jak mechanizmy ochronne wynikające z napięcia (Saturn/Mars/Pluton, Księżyc lub Wenus, oś jeśli to ważne) i pokaż, jak ten sam rys stać się może osią dojrzałej sprawczości — domknij ją poczuciem integracji.`,
      `Lekcje bez straszenia: Saturn lub trudne aspekty jak trening charakteru, nie wyrok.`,
      `Jowisz, Słońce, ewentualnie węzły z JSON oraz domy wzrostu — poszukiwanie sensu jak krajobraz możliwości, bez jednego „zakodowanego przeznaczenia”.`,
      `Saturn jak architekt życia: struktura i granice które mogą przywrócić oddech naturze zamiast ją przycinać.`,
      `Księżyc, Neptun, żywioły wody / domy lub aspekty wrażliwości wg JSON — intuicja, samotność jako przestrzeń regeneracji, symboliczny język wnętrza.`,
      `Mars + Merkury + Saturn + Jowisz + domy zajęcia/powołania, jeśli z mapy się czyści: **konkretne** przykłady ról czy przestrzeni pracy jak sugestie, bez obietnic kariery czy zarobku.`,
      `Towarzyskie przestrzenie (przyjaciele, zespoły, sąsiedztwo mentalne): jak Merkury, Wenus, Jowisz i domy 3/7/11 podają rytm, jeżeli są w materiale.`,
      `Tutaj zagraj syntezę jak kompozycję muzyczną — jeden przebieg jak różne głosy mapy ustawione współbrzmieniem albo przeciwwagą.`,
      `Wskazówki jak rozmowa po sesji — kierunki pracy sobą bez list punktowanych.`,
      `Zakończenie jak list do adresata: bez technicznego streszczenia; zostaw obraz lub metafórę życzeniowego spojrzenia.`,
    ];
  }
  if (lang === "es") {
    return [
      `Entra desde la cualidad vital, no desde el glosario: capta una esencia humana reconocible sin hacer catálogo de planetas.`,
      `Entrelaza Sol, Luna y Ascendiente como tensión viviente entre motivación, necesidad emocional y manera de lanzarse al mundo. ${ascTripleEs}`,
      `Apóyate en Mercurio como “voz interna + maneras de responder en la calle”: estilo cognitivo, ritmo verbal, sarcasmo o prudencia, cómo llegas cuando hablas.`,
      `Teje Venus + Luna (+ factores relacionales fuertes) como narrativa íntima: apego sensual/emocional, dar/recibir cercanía, qué sosiega tu sistema nervioso, qué dispara vigilancia.`,
      `Marte y fuerza ejecutiva habitadas: iniciativa, duelo cordial-frontera, urgencia competitiva y cómo recuperas impulso tras el roce.`,
      `Donde el mapa marca ventaja, muestra recurso cotidiano, no lista de etiquetas.`,
      `Zona alta de confianza: sombras como defensas nacidas de tensión marcada — y el mismo rasgo como eje maduro si se conscientiza.`,
      `Lecciones con dignidad adulta sin alarmismo; Saturno como oficio vivo del límite.`,
      `Expansión, Sol, nodos u otros indicadores autorizados en JSON: sentido plural, ningún destino cerrado.`,
      `Saturno como arquitectura interior: hábitos y líneas rojas sanas sin castigar necesidades.`,
      `Luna / Neptuno / elementos de agua donde el JSON aplique — interioridad simbólica y descansos que no son decadencia.`,
      `Marte, Mercurio, Saturno, Júpiter y casas profesionales **si** encajan sin forzarlas: ejemplos de roles/espacios, sin promesa de ingreso.`,
      `Círculos y microcomunidades: Mercurio, Venus, Júpiter, casas 3/7/11 si están en juego.`,
      `Síntesis vertical: melodía donde los temas repetidos encuentran nueva función.`,
      `Guía como charla después de sesión — sin bullets.`,
      `Cierre tipo carta breve sin repaso tabla-ras de la carta.`,
    ];
  }
  return [
    `Lead with embodied presence—not a glossary: capture someone's recognizable human signature without mechanically listing planetary keywords.`,
    `Weave Sun, Moon, Ascendant together as motive, longing, interface with the outer world—including friction and synergy. ${ascTripleEn}`,
    `Ground Mercury as inner voice plus social speech: cognition, tempo, irony or caution, how you tend to sound when stakes rise.`,
    `Interlace Venus, Moon, and prominent relational glyphs as intimacy architecture: craving, tenderness, jealousy-guards, soothing rituals.`,
    `Let Mars inhabit drive: initiation, rivalry, protective anger, pacing under pressure, returning to willingness after fatigue.`,
    `Where the chart confers giftedness, show lived advantage—not a motivational poster list.`,
    `High-trust centerpiece: defenses named as intelligent nervous-system patterns forged by tension-heavy aspects—and the same circuitry as grit when metabolized.`,
    `Saturn / hard contacts as ripening curricula, never punishment scripts.`,
    `Jupiter arc, Solar purpose signals, lunar nodes **if supplied** speak to meaning-fields, not deterministic missions.`,
    `Saturn structuring as spine without suffocating the chart's heat.`,
    `Moon / Neptune / water emphasis per JSON → inner listening, symbolism, solitude that heals rather than escapes.`,
    `Mars × Mercury × Saturn × Jupiter and vocational houses **only where clean**: illustrative roles or settings; no prosperity promises.`,
    `Community layer: friendships, alliances, conversational worlds—tie Mercury/Venus/Jupiter and 3/7/11 if material.`,
    `Synthesis stitches earlier motifs rather than stacking repeated bullet summaries.`,
    `Guidance paragraphs read like bedside notes after consultation—no enumerated tips.`,
    `Close as a humane letter-ending image; skip mechanical chart recap.`,
  ];
}

/** Prevents internal outline hints (after ·) from leaking into ## headings in model output. */
function readerFacingSectionHeadingRules(lang: AppLang): string[] {
  if (lang === "pl") {
    return [
      ``,
      `NAGŁÓWKI DLA CZYTELNIKA (##): Mają być krótkie i czyste — bez żadnych dopisków, przypisów ani wyjaśnień po znaku · (kropka środkowa), bez ujawniania w nawiasach wewnętrznych instrukcji dla modelu.`,
      `W finalnym raporcie stosuj wyłącznie proste tytuły sekcji (jak w outline, ale bez części po „·”); szczegóły (zakres dat, że bez porad medycznych, uzasadnienie z mapy itd.) przenieś wyłącznie do treści akapitu pod nagłówkiem.`,
      `Instrukcje formatowania z tej wiadomości nie mogą pojawić się w outputcie.`,
    ];
  }
  if (lang === "es") {
    return [
      ``,
      `ENCABEZADOS PARA EL LECTOR (##): Deben ser breves y limpios — sin añadidos tras el punto medio ·, sin aclaraciones entre paréntesis que copien instrucciones internas ni metatexto en el título.`,
      `En el informe final usa solo títulos de sección simples (como en el outline, pero sin lo que viniera tras “·”); matices (rango de fechas, sin consejos médicos, justificación en la carta, etc.) solo en el cuerpo bajo el encabezado.`,
      `Las instrucciones de este prompt no pueden aparecer en el texto entregado al usuario.`,
    ];
  }
  return [
    ``,
    `READER-FACING SECTION HEADINGS (##): Keep them short and clean — no trailing clarifiers after a middle dot (·), no parenthetical prompt debris, no meta-instructions in the title.`,
    `In the final report use only simple section titles (as in the outline, but omit anything that would appear after “·”); date ranges, “no medical advice,” chart rationale, etc. belong only in the body below the heading.`,
    `Formatting instructions from this prompt must not appear in the user-visible output.`,
  ];
}

function chartContextLines(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  lang: AppLang,
  birthTimeUnknown = false,
): string[] {
  const lat = chart.latitude.toFixed(4);
  const lon = chart.longitude.toFixed(4);
  const asc = chart.ascendantDeg.toFixed(1);
  if (lang === "pl") {
    return [
      `W sekcji „Wykres Natalny” (lub jej odpowiedniku w danym języku) powtórz: data ${dob}, godzina ${tob}, miejsce ${pob}.`,
      `Dodaj jednym zdaniem: strefa czasowa mapy: ${chart.timezone}; współrzędne przybliżone: szer. ${lat}°, dług. ${lon}° (jak po geokodowaniu).`,
      birthTimeUnknown
        ? `Ponieważ godzina urodzenia jest nieznana, mapa została policzona orientacyjnie dla 12:00; nie interpretuj Ascendentu, domów ani osi jako pewnych — jeśli je wspominasz, wyraźnie zaznacz ich przybliżony charakter.`
        : `Godzina urodzenia jest znana, więc Ascendent i domy możesz traktować jako elementy mapy z danych.`,
      `Ascendent z ephemeridy: ok. ${asc}°. Krótko (2–4 zdania) zreferuj do JSON poniżej: Słońce, Księżyc, planety — bez zaprzeczania liczbom z JSON.`,
    ];
  }
  if (lang === "es") {
    return [
      `En la sección de carta natal, repite: fecha ${dob}, hora ${tob}, lugar ${pob}.`,
      `Una frase: zona horaria de la carta: ${chart.timezone}; coordenadas aprox. lat ${lat}°, lon ${lon}°.`,
      birthTimeUnknown
        ? `Como la hora de nacimiento es desconocida, la carta se calculó de forma aproximada para las 12:00; no trates el Ascendente, las casas ni los ejes como datos seguros, y si los mencionas marca claramente su carácter aproximado.`
        : `La hora de nacimiento es conocida, así que puedes tratar Ascendente y casas como elementos de la carta proporcionada.`,
      `Ascendente (~${asc}°). En 2–4 frases resume Sol, Luna y planetas según el JSON — sin contradecirlo.`,
    ];
  }
  return [
    `In the Natal chart section, repeat: date ${dob}, time ${tob}, place ${pob}.`,
    `One sentence: chart timezone ${chart.timezone}; approximate coordinates lat ${lat}°, lon ${lon}°.`,
    birthTimeUnknown
      ? `Because the birth time is unknown, the chart was calculated approximately for 12:00; do not treat the Ascendant, houses, or axes as certain, and clearly mark them as approximate if you mention them.`
      : `The birth time is known, so you may treat the Ascendant and houses as chart factors from the provided data.`,
    `Ascendant (~${asc}°). In 2–4 sentences summarize Sun, Moon, and planets per the JSON — do not contradict it.`,
  ];
}

function birthTimeForPrompt(lang: AppLang, tob: string, birthTimeUnknown = false) {
  if (!birthTimeUnknown) return tob;
  if (lang === "pl") return "nieznana (do obliczeń orientacyjnie użyto 12:00)";
  if (lang === "es") return "desconocida (para el cálculo aproximado se usó 12:00)";
  return "unknown (12:00 was used for the approximate calculation)";
}

function premiumPersonalityOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  lang: AppLang,
  birthTimeUnknown = false,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, lang, birthTimeUnknown);
  const sectionBodies = premiumPersonSectionBodies(lang, chart, birthTimeUnknown);
  const headings =
    lang === "pl"
      ? [
          "Wprowadzenie: Kim jesteś w swojej esencji",
          "Twoje rdzenne „JA”: Słońce, Księżyc i Ascendent",
          "Twój umysł i sposób komunikacji",
          "Miłość, relacje i potrzeby emocjonalne",
          "Energia działania i motywacja",
          "Talenty, potencjał i naturalne predyspozycje",
          "Cień i potencjał: Twoja oś transformacji",
          "Wyzwania i lekcje rozwojowe",
          "Kierunek życia i poczucie sensu",
          "Struktura, dyscyplina i granice",
          "Intuicja, duchowość i świat wewnętrzny",
          "Praca, kariera i realizacja w świecie",
          "Relacje społeczne i środowisko",
          "Twój unikalny „kod”: synteza wykresu",
          "Praktyczne wskazówki",
          "Podsumowanie: Twoja ścieżka w pigułce",
        ]
      : lang === "es"
        ? [
            "Introducción: Tu esencia central",
            "Tu esencia: Sol, Luna y Ascendente",
            "Tu mente y forma de comunicar",
            "Amor, relaciones y necesidades emocionales",
            "Energía, acción y motivación",
            "Talentos, potencial y habilidades naturales",
            "Sombra y potencial: Tu eje de transformación",
            "Desafíos y lecciones de vida",
            "Dirección de vida y propósito",
            "Estructura, disciplina y límites",
            "Intuición, espiritualidad y mundo interno",
            "Carrera y realización profesional",
            "Vida social y entorno",
            "Tu código único: síntesis de la carta",
            "Recomendaciones prácticas",
            "Resumen: Tu camino en pocas palabras",
          ]
        : [
            "Introduction: Your Core Essence",
            "Your Core Self: Sun, Moon & Rising",
            "Your Mind & Communication Style",
            "Love, Relationships & Emotional Needs",
            "Drive, Action & Motivation",
            "Talents, Potential & Natural Strengths",
            "Shadow & Potential: Your Axis of Transformation",
            "Challenges & Growth Lessons",
            "Life Direction & Purpose",
            "Structure, Discipline & Boundaries",
            "Intuition, Spirituality & Inner World",
            "Career & Life Path in the World",
            "Social Life & Environment",
            "Your Unique Code: Chart Synthesis",
            "Practical Guidance",
            "Summary: Your Path in a Nutshell",
          ];
  const ascInstruction = birthTimeUnknown
    ? lang === "pl"
      ? `Godzina urodzenia jest nieznana, więc Ascendent, domy i osie są orientacyjne. Wyraźnie oznacz interpretacje Ascendentu/domów jako przybliżone i nie buduj na nich zbyt pewnych wniosków.`
      : lang === "es"
        ? `La hora de nacimiento es desconocida, por lo que el Ascendente, las casas y los ejes son orientativos. Marca claramente esas interpretaciones como aproximadas y no construyas conclusiones demasiado firmes sobre ellas.`
        : `The birth time is unknown, so the Ascendant, houses, and axes are approximate. Clearly mark Ascendant/house interpretations as approximate and do not build overly certain conclusions from them.`
    : lang === "pl"
      ? `Godzina urodzenia jest znana, więc możesz korzystać z Ascendentu, domów całoznakowych i osi jako ważnych elementów syntezy.`
      : lang === "es"
        ? `La hora de nacimiento es conocida, así que puedes usar el Ascendente, las casas de signo entero y los ejes como elementos importantes de la síntesis.`
        : `The birth time is known, so you may use the Ascendant, whole-sign houses, and axes as important parts of the synthesis.`;

  return [
    lang === "pl"
      ? `To jest raport osobowościowy premium oparty na kosmogramie. Cały dokument ma być wyłącznie po polsku. Twoim zadaniem jest pełna restrukturyzacja i przepisanie raportu jako spójnego, pogłębionego dokumentu psychologiczno-astrologicznego, a nie streszczenie danych.`
      : lang === "es"
        ? `Este es un informe de personalidad premium basado en la carta natal. Todo el documento debe estar únicamente en español. Tu tarea es reestructurarlo y reescribirlo como un documento psicológico-astrológico coherente y profundo, no resumir los datos.`
        : `This is a premium personality report based on the natal chart. The entire document must be in English only. Your task is to fully restructure and rewrite it as a coherent, psychologically rich astrological document, not to summarize the data.`,
    ``,
    lang === "pl"
      ? `KRYTYCZNY FORMAT JĘZYKOWY: użyj wyłącznie polskiej wersji nagłówków i treści. Nie dodawaj wersji angielskiej ani hiszpańskiej w tym raporcie.`
      : lang === "es"
        ? `FORMATO LINGÜÍSTICO CRÍTICO: usa únicamente los encabezados y el contenido en español. No añadas versiones en polaco ni en inglés dentro de este informe.`
        : `CRITICAL LANGUAGE FORMAT: use only the English headings and English content. Do not add Polish or Spanish versions inside this report.`,
    ``,
    lang === "pl"
      ? `JAKOŚĆ JĘZYKA: tekst ma brzmieć jak napisany przez bardzo dobrą polską autorkę. Ton: premium, psychologiczny, refleksyjny, wnikliwy, naturalny, bez banałów i bez horoskopowych klisz.`
      : lang === "es"
        ? `CALIDAD DEL LENGUAJE: el texto debe sonar como escrito por una excelente autora nativa en español. Tono premium, psicológico, reflexivo, profundo y natural, sin banalidades ni clichés de horóscopo.`
        : `LANGUAGE QUALITY: the text should read as if written by an excellent native English writer. Keep a premium, psychological, reflective, insightful, natural tone with no banalities or horoscope clichés.`,
    ``,
    lang === "pl"
      ? `ZASADY TREŚCI: pisz jako astrolog w pierwszej osobie i zwracaj się bezpośrednio do czytelnika w drugiej osobie. Nie używaj wypunktowań ani list numerowanych w finalnym raporcie. Każda sekcja ma mieć 2–4 akapity. Pomiędzy sekcjami zachowaj płynność i logiczne przejścia. Nie stosuj deterministycznych stwierdzeń; mów o wzorcach, tendencjach, napięciach, potencjałach i dynamikach wewnętrznych.`
      : lang === "es"
        ? `REGLAS DE CONTENIDO: escribe como astróloga/o en primera persona y dirígete directamente a la persona lectora en segunda persona. No uses viñetas ni listas numeradas en el informe final. Cada sección debe tener 2–4 párrafos. Mantén transiciones fluidas y lógicas entre secciones. Evita afirmaciones deterministas; habla de patrones, tendencias, tensiones, potenciales y dinámicas internas.`
        : `CONTENT RULES: write as the astrologer in first person and address the reader directly in second person. Do not use bullet points or numbered lists in the final report. Each section should contain 2–4 paragraphs. Keep transitions fluid and logical. Avoid deterministic claims; describe patterns, tendencies, tensions, potentials, and inner dynamics.`,
    ``,
    astrologyWarmConsultationVoice(lang),
    ``,
    lang === "pl"
      ? `Dane techniczne i ograniczenia interpretacji (użyj jako fundamentu, nie twórz z nich osobnej sekcji):`
      : lang === "es"
        ? `Datos técnicos y límites de la interpretación (úsalos como base; no crees una sección separada en el informe final):`
        : `Technical data & interpretive limits (use as bedrock; do not turn into a standalone section in the final report):`,
    ...cc.map((l) => `- ${l}`),
    lang === "pl"
      ? `- Dane urodzenia w tle interpretacji: ${dob}, ${tob}, ${pob}.`
      : lang === "es"
        ? `- Datos de nacimiento en el fondo: ${dob}, ${tob}, ${pob}.`
        : `- Birth data to hold in mind: ${dob}, ${tob}, ${pob}.`,
    `- ${ascInstruction}`,
    lang === "pl"
      ? `- Zachowaj fakty astrologiczne z JSON (znaki, planety, aspekty, domy, Ascendent, dominujące układy). Nie wymyślaj danych ani nie zmieniaj znaczeń planet — zmieniasz strukturę, głębię i żywą polszczyznę tekstu.`
      : lang === "es"
        ? `- Mantén todos los hechos astrológicos del JSON (signos, planetas, aspectos, casas, Ascendente, configuraciones relevantes). No inventes elementos ni cambies las reglas típicas de significado planetario; rediseñas estructura, profundidad y español vivo.`
        : `- Preserve every substantive fact from JSON (signs, planets, aspects, houses, Ascendant, standout configurations). Do not invent planetary facts or change standard astrological meaning — you rework structure, depth, and living English.`,
    ``,
    lang === "pl"
      ? `OBOWIĄZKOWA STRUKTURA: użyj dokładnie poniższych nagłówków H2, w dokładnie tej kolejności.`
      : lang === "es"
        ? `ESTRUCTURA OBLIGATORIA: usa exactamente los siguientes encabezados H2, en este orden exacto.`
        : `REQUIRED STRUCTURE: use exactly the following H2 headings, in this exact order.`,
    ``,
    ...headings.flatMap((h, i) => [`## ${h}`, sectionBodies[i] ?? ``, ``]),
  ];
}

function plMonthlyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
  birthTimeUnknown = false,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "pl", birthTimeUnknown);
  return [
    `NIE zaczynaj raportu od nagłówka H1 (poziom #). Jak w raporcie osobowościowym: sekcje widoczne dla czytelnika to wyłącznie nagłówki ##.`,
    ``,
    `KRYTYCZNE: Pisz WYŁĄCZNIE o 30 kolejnych dniach kalendarzowych od daty generowania: od ${fw.monthly.start} do ${fw.monthly.end} włącznie (strefa ${fw.timezone}). To nie jest „miesiąc kalendarzowy” od 1. do ostatniego dnia miesiąca — liczy się wyłącznie ten zakres.`,
    ``,
    `STYL (jak u doświadczonego astrologa przy konsultacji): każdy akapit musi wynikać z połączenia TEJ mapy (JSON) z realnymi tranzytami w podanych datach. Unikaj pustych ogólników („komunikacja”, „zaufanie”, „otwórz serce”) bez wskazania planety, znaku, domu całoznakowego od Ascendentu lub aspektu z JSON. Tam gdzie piszesz o relacjach, pracy lub zdrowiu psychicznym — uzasadnij to konkretnym czynnikiem mapy + tranzytem w ${fw.monthly.start}–${fw.monthly.end}, nie dla „typowej” osoby ze znakiem słonecznym. Ton: ciepły i obecny jak po żywej rozmowie (bliskość porównywalna z naszym tarotem), z krótkimi kadrami codzienności osadzonymi w symbolach — bez wymyślania faktów spoza formularza i mapy.`,
    ``,
    `Nagłówki ## w tej kolejności (ten sam ton co w raporcie osobowościowym — czytelne, „ludzkie” tytuły sekcji):`,
    ``,
    `## Twoja mapa w tle tego miesiąca`,
    ...cc.map((l) => `- ${l}`),
    `- 2–3 zdania prozą (bez list w finalnym raporcie w tej sekcji): które ciała z JSON (Słońce, Księżyc, planety, Ascendent) są najsilniej aktywowane tranzytami w tym oknie — bez powtarzania całego opisu osobowości.`,
    ``,
    `## Ogólna energia`,
    ``,
    `- 3–6 zdań: syntetyczny nastrój okresu ${fw.monthly.start}–${fw.monthly.end} z wyraźnym odniesieniem do dominującego wzorca tranzytowego (np. seria aspektów do tej samej planety natalnej) oraz do Słońca / Księżyca / Ascendentu z mapy.`,
    ``,
    `## Kluczowe tranzyty`,
    `- Lista 6–9 punktów; każdy punkt = pełna myśl: „tranzytująca planeta X w okolicach … aspektuje natalne Y (znak/dom)” + jedno zdanie interpretacji dla TEJ osoby w tym zakresie dat. Bez jednowyrazowych punktów typu „Saturn — dyscyplina”.`,
    ``,
    ...monthlySegmentOutlineBlocks(fw, "pl"),
    ``,
    `## Relacje i serce`,
    `- Zakres interpretacji w treści: ${fw.monthly.start}–${fw.monthly.end}.`,
    `- 2 zdania: Wenus i Księżyc w mapie (znak; dom całoznakowy od Ascendentu jeśli da się to sensownie odczytać z danych) jako baza stylu dawania i odbierania bliskości.`,
    `- 4–6 zdań: które tranzyty w tym 30-dniowym oknie najsilniej dotykają tych miejsc w mapie (aspekty, wejście planety do znaku/domu); pisz o konkretnych napięciach lub wsparciach, nie o horoskopowych frazach.`,
    `- Jeśli w mapie są napięcia (np. Saturn, Pluton, Mars) wokół relacji — opisz możliwy przebieg w praktyce (scenariusze zachowań), bez straszenia i bez diagnoz.`,
    `- 1 zdanie domykające: refleksyjny kierunek pracy z energią miesiąca, spójny z mapą.`,
    ``,
    `## Praca, pieniądze i realizacja`,
    `- W treści uwzględnij zakres: ${fw.monthly.start}–${fw.monthly.end}.`,
    `- 4–6 zdań: powiąż Saturna, Jowisza, Marsa i Merkurego (z JSON) z tranzytami okresu — które obszary życia (projekty, odpowiedzialność, widoczność) się aktywizują; bez konkretnych porad inwestycyjnych i bez obietnic zarobku.`,
    ``,
    `## Rytm ciała i energii`,
    `- W treści: ten sam 30-dniowy okres ${fw.monthly.start}–${fw.monthly.end}.`,
    `- 3–5 zdań: Księżyc i ewentualnie 6. dom / Mars w mapie vs tranzyty — sen, regeneracja, obciążenie (bez diagnoz medycznych i bez suplementów).`,
    ``,
    `## Najlepsze dni`,
    `- Lista 3–5 dat (YYYY-MM-DD w ${fw.timezone}) z jednym zdaniem uzasadnienia każdej z mapy.`,
    ``,
    `## Dni wymagające ostrożności`,
    `- Lista 2–4 dat (YYYY-MM-DD) z krótką wskazówką, bez straszenia.`,
    ``,
    `## Afirmacja`,
    `- Jedna afirmacja w pierwszej osobie, zgodna z tematem 30 dni i mapą.`,
  ];
}

function plWeeklyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
  birthTimeUnknown = false,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "pl", birthTimeUnknown);
  return [
    `NIE zaczynaj raportu od nagłówka H1 (poziom #). Jak w raporcie osobowościowym: sekcje widoczne dla czytelnika to wyłącznie nagłówki ##.`,
    ``,
    `KRYTYCZNE: Pisz WYŁĄCZNIE o 7 kolejnych dniach od daty generowania: od ${fw.weekly.start} do ${fw.weekly.end} włącznie (strefa ${fw.timezone}). Nie używaj „poniedziałek–niedziela” jako domyślnego tygodnia — liczy się wyłącznie ten zakres dat.`,
    ``,
    `DANE: Interpretujesz wyłącznie osobę z formularza: ${dob}, godzina ${tob}, miejsce ${pob} — plus pozycje i aspekty z załączonego JSON mapy natalnej oraz tranzyty / ephemerida przekazane w tym prompcie dla dat ${fw.weekly.start}–${fw.weekly.end}. Nie uzupełniaj braków „z głowy” ani z ogólnej astrologii spoza tych danych.`,
    ``,
    `STYL: Każdy dzień to mini-konsultacja z mapy — opis ma być **obszerniejszy** niż jedna myśl: rozwijaj wątek dnia (napięcie, wsparcie, tempo) z nazwanymi czynnikami mapy i tranzytów; bez diagnoz medycznych i bez obietnic finansowych. Pisz z bliskością jak po naszej lekturze tarota: konkretna osoba, nie „horoskop dla znaku”; drobne obrazy dnia tylko jako ilustracja symboli z JSON.`,
    ``,
    `Nagłówki ## w tej kolejności (jak w raporcie osobowościowym — spójny, czytelny styl tytułów):`,
    ``,
    `## Twoja mapa w tle tego tygodnia`,
    ...cc.map((l) => `- ${l}`),
    `- Jedno zdanie prozą: dlaczego ta mapa ma znaczenie dla tego tygodnia.`,
    ``,
    `## Ogólny ton tygodnia`,
    `- 2–4 zdania syntetycznie na cały zakres ${fw.weekly.start}–${fw.weekly.end}; bez przypisywania treści do pon–niedz kalendarzowych poza tymi datami.`,
    ``,
    ...weeklyDayOutlineBlocks(fw, "pl"),
    `## Miłość i relacje`,
    `- Jeden krótki akapit; wyłącznie ${fw.weekly.start}–${fw.weekly.end}.`,
    ``,
    `## Praca i projekty`,
    `- Jeden krótki akapit; ten sam zakres dat ${fw.weekly.start}–${fw.weekly.end}.`,
    ``,
    `## Energia i samopoczucie`,
    `- Jeden krótki akapit o samopoczuciu i energii; bez porad medycznych; ten sam tydzień ${fw.weekly.start}–${fw.weekly.end}.`,
    ``,
    `## Najmocniejszy dzień`,
    `- W treści podaj jeden dzień (YYYY-MM-DD w ${fw.timezone}) i uzasadnienie z mapy oraz tranzytów.`,
    ``,
    `## Wyzwanie`,
    `- Jeden akapit: realne napięcie z mapy, opisane konstruktywnie.`,
    ``,
    `## Pytanie do refleksji`,
    `- Jedno pytanie otwarte, powiązane z tematem tygodnia i mapą.`,
  ];
}

function enMonthlyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
  birthTimeUnknown = false,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "en", birthTimeUnknown);
  return [
    `Do NOT start with an H1 (#) title. Match the personality report: reader-facing sections use ## headings only.`,
    ``,
    `CRITICAL: Write ONLY about 30 consecutive calendar days from the generation date: ${fw.monthly.start} through ${fw.monthly.end} inclusive (${fw.timezone}). This is NOT “the calendar month from the 1st to the last day of a month” — only this exact range.`,
    ``,
    `STYLE (professional consultation): every section must tie THIS chart (JSON) to real transits in those dates. Ban empty clichés (“communication”, “trust”, “open your heart”) unless you name the planet, sign, whole-sign house from Ascendant, or aspect from JSON. For love, work, or emotional strain — always show chart factor + transit in ${fw.monthly.start}–${fw.monthly.end}, not generic Sun-sign advice. Write with the same grounded intimacy as CosmoTips tarot: small real-life vignettes anchored in named chart/transit facts — no invented biography beyond the form and chart.`,
    ``,
    `## headings — same voice as the personality report (clear, warm section titles):`,
    ``,
    `## Your chart backdrop`,
    ...cc.map((l) => `- ${l}`),
    `- 2–3 prose sentences (no bullets in this section): which bodies from JSON (Sun, Moon, planets, Ascendant) are most activated by transits in this window — without re-writing the full personality portrait.`,
    ``,
    `## Overall energy`,
    `- 3–6 sentences: the mood of ${fw.monthly.start}–${fw.monthly.end} with a clear dominant transit pattern (e.g. repeated hits to one natal planet) woven with Sun / Moon / Ascendant from the chart.`,
    ``,
    `## Key transits`,
    `- 6–9 bullets; each bullet = one full thought: “transiting X around … aspects natal Y (sign/house)” + one sentence of interpretation for THIS person in this date range. No one-word bullets like “Saturn — discipline”.`,
    ``,
    ...monthlySegmentOutlineBlocks(fw, "en"),
    ``,
    `## Relationships & heart`,
    `- In the body, keep the focus on ${fw.monthly.start}–${fw.monthly.end}.`,
    `- 2 sentences: natal Venus and Moon (sign; whole-sign house from Ascendant if you can infer it sensibly) as the baseline for closeness and needs.`,
    `- 4–6 sentences: which transits in this 30-day window most touch those chart areas (aspects, sign/house ingress); describe concrete tensions or support, not magazine phrases.`,
    `- If the chart shows strain (Saturn, Pluto, Mars) around relating — describe likely behavioral patterns in practice, without fear-mongering or diagnoses.`,
    `- 1 closing sentence: a reflective way to work with the month’s energy, consistent with the chart.`,
    ``,
    `## Work, money & follow-through`,
    `- In the body, anchor to ${fw.monthly.start}–${fw.monthly.end}.`,
    `- 4–6 sentences: link Saturn, Jupiter, Mars, and Mercury (from JSON) to transits of the period — which life themes (projects, responsibility, visibility) activate; no investment picks or income promises.`,
    ``,
    `## Body rhythm & energy`,
    `- Same 30-day span ${fw.monthly.start}–${fw.monthly.end} in the prose.`,
    `- 3–5 sentences: Moon and optionally 6th house / Mars vs transits — sleep, recovery, load (no medical diagnosis or supplement advice).`,
    ``,
    `## Best days`,
    `- 3–5 dates (YYYY-MM-DD, ${fw.timezone}) with one-sentence rationale each.`,
    ``,
    `## Days to handle with care`,
    `- 2–4 dates with gentle guidance.`,
    ``,
    `## Affirmation`,
    `- One first-person affirmation aligned with the chart and these 30 days.`,
  ];
}

function enWeeklyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
  birthTimeUnknown = false,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "en", birthTimeUnknown);
  return [
    `Do NOT start with an H1 (#) title. Match the personality report: reader-facing sections use ## headings only.`,
    ``,
    `CRITICAL: Write ONLY about 7 consecutive days from the generation date: ${fw.weekly.start} through ${fw.weekly.end} inclusive (${fw.timezone}). Do NOT default to Monday–Sunday; only these dates matter.`,
    ``,
    `DATA: You only have the form birth facts (${dob}, ${tob}, ${pob}) plus the attached natal JSON and the transits / ephemeris supplied in this prompt for ${fw.weekly.start}–${fw.weekly.end}. Do not invent other birth details or fill gaps from general astrology outside this payload.`,
    ``,
    `STYLE: Each day should read like a short chart-based consultation — **more detailed** than a single vague line: develop the day’s theme (tension, support, pacing) with named chart and transit factors; no medical diagnoses or financial promises. Match the intimate-yet-grounded voice of CosmoTips tarot readings: vignettes must hang on specific transit/planet facts from JSON — no invented personal history.`,
    ``,
    `## headings — same voice as the personality report:`,
    ``,
    `## Your chart backdrop`,
    ...cc.map((l) => `- ${l}`),
    `- One prose sentence linking the chart to this week.`,
    ``,
    `## Overall tone`,
    `- 2–4 sentences summarizing the whole span ${fw.weekly.start}–${fw.weekly.end}; do not anchor to Mon–Sun outside these dates.`,
    ``,
    ...weeklyDayOutlineBlocks(fw, "en"),
    `## Love & relationships`,
    `- One short paragraph covering only ${fw.weekly.start}–${fw.weekly.end}.`,
    ``,
    `## Work & projects`,
    `- One short paragraph for the same date range.`,
    ``,
    `## Energy & wellbeing`,
    `- One short paragraph on energy and wellbeing (no medical advice in the body).`,
    ``,
    `## Strongest day`,
    `- In the body: name the calendar date YYYY-MM-DD (${fw.timezone}) and justify from chart + transits.`,
    ``,
    `## Challenge`,
    `- One constructive paragraph on the week’s main tension from the chart.`,
    ``,
    `## Reflection question`,
    `- One open question tied to the week and chart.`,
  ];
}

function esMonthlyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
  birthTimeUnknown = false,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "es", birthTimeUnknown);
  return [
    `NO empieces con un título H1 (nivel #). Igual que en el informe de personalidad: las secciones visibles van solo con encabezados ##.`,
    ``,
    `CRÍTICO: Solo 30 días naturales consecutivos desde la fecha de generación: ${fw.monthly.start}–${fw.monthly.end} inclusive (${fw.timezone}). No es “el mes del calendario” del día 1 al último día del mes — solo este rango.`,
    ``,
    `ESTILO (consulta profesional): cada apartado debe enlazar ESTA carta (JSON) con tránsitos reales en esas fechas. Evita clichés vacíos (“comunicación”, “confianza”) sin planeta, signo, casa entera desde el ascendente o aspecto del JSON. En amor, trabajo o carga emocional — siempre factor natal + tránsito en ${fw.monthly.start}–${fw.monthly.end}, no consejos genéricos de signo solar. Tono: cercano y vivo como en una sesión que responde de verdad a la carta (intimidad comparable a nuestras lecturas de tarot), con pequeños instantes cotidianos anclados en planetas/tránsitos; sin inventar biografía fuera del formulario y la carta. Redacta en español maduro, no como traducción palabra por palabra del inglés.`,
    ``,
    `Encabezados ## en este orden (el mismo tono que el informe de personalidad — títulos claros y cercanos):`,
    ``,
    `## Tu carta como telón de fondo`,
    ...cc.map((l) => `- ${l}`),
    `- 2–3 frases en prosa (sin listas en el informe final en este apartado): qué cuerpos del JSON reciben más “luz” de tránsitos en esta ventana — sin rehacer el retrato completo.`,
    ``,
    `## Energía general`,
    `- 3–6 frases: clima de ${fw.monthly.start}–${fw.monthly.end} con un patrón dominante de tránsitos (p. ej. repetición de aspectos al mismo planeta natal) y Sol / Luna / Ascendente de la carta.`,
    ``,
    `## Tránsitos clave`,
    `- 6–9 viñetas; cada una = idea completa: “tránsito X hacia … aspecta natal Y (signo/casa)” + una frase de interpretación para ESTA persona en esas fechas. Nada de viñetas de una palabra.`,
    ``,
    ...monthlySegmentOutlineBlocks(fw, "es"),
    ``,
    `## Relaciones y corazón`,
    `- En el texto: ventana ${fw.monthly.start}–${fw.monthly.end}.`,
    `- 2 frases: Venus y Luna natales (signo; casa entera desde el ascendente si se infiere con sentido) como base de vínculo y necesidades.`,
    `- 4–6 frases: qué tránsitos de esta ventana tocan más esas zonas (aspectos, ingreso a signo/casa); tensiones o apoyos concretos, no frases de revista.`,
    `- Si la carta muestra tensión (Saturno, Plutón, Marte) en el vínculo — describe patrones de conducta probables, sin alarmismo ni diagnósticos.`,
    `- 1 frase de cierre: reflexión práctica acorde a la carta.`,
    ``,
    `## Trabajo, dinero y ejecución`,
    `- En el texto: mismo rango ${fw.monthly.start}–${fw.monthly.end}.`,
    `- 4–6 frases: Saturno, Júpiter, Marte y Mercurio (JSON) con tránsitos del período — qué temas (proyectos, responsabilidad, visibilidad) se activan; sin recomendaciones de inversión ni promesas de ingreso.`,
    ``,
    `## Ritmo corporal y energía`,
    `- En el texto: mismos 30 días ${fw.monthly.start}–${fw.monthly.end}.`,
    `- 3–5 frases: Luna y opcionalmente casa 6 / Marte vs tránsitos — sueño, recuperación, carga (sin diagnóstico médico ni suplementos).`,
    ``,
    `## Mejores días`,
    `- 3–5 fechas YYYY-MM-DD (${fw.timezone}) con una frase cada una.`,
    ``,
    `## Días con más cautela`,
    `- 2–4 fechas con guía suave.`,
    ``,
    `## Afirmación`,
    `- Una afirmación en primera persona.`,
  ];
}

function esWeeklyOutline(
  chart: NatalChartPayload,
  dob: string,
  tob: string,
  pob: string,
  fw: ForecastWindows,
  birthTimeUnknown = false,
): string[] {
  const cc = chartContextLines(chart, dob, tob, pob, "es", birthTimeUnknown);
  return [
    `NO empieces con un título H1 (#). Como en el informe de personalidad: solo encabezados ## para las secciones visibles.`,
    ``,
    `CRÍTICO: Solo 7 días consecutivos desde la generación: ${fw.weekly.start}–${fw.weekly.end} (${fw.timezone}). No uses lunes–domingo por defecto; solo estas fechas.`,
    ``,
    `DATOS: Solo la persona del formulario: ${dob}, hora ${tob}, lugar ${pob}, más el JSON natal y los tránsitos / efemérides de este prompt para ${fw.weekly.start}–${fw.weekly.end}. No inventes otros datos de nacimiento ni rellenes vacíos con astrología genérica fuera de estos datos.`,
    ``,
    `ESTILO: Cada día debe leerse como una mini-consulta basada en la carta — **más extenso** que una sola idea vaga: desarrolla el tema del día (tensión, apoyo, ritmo) citando factores concretos del mapa y tránsitos; sin diagnósticos médicos ni promesas financieras. Voz cercana y precisa como en nuestras lecturas de tarot CosmoTips: escenas breves solo como eco de símbolos reales de la carta; español fluido y nativo, sin muletillas traducidas del inglés.`,
    ``,
    `Encabezados ## — mismo tono que el informe de personalidad:`,
    ``,
    `## Tu carta como telón de fondo`,
    ...cc.map((l) => `- ${l}`),
    `- Una frase en prosa: cómo esta carta enmarca esta semana (${fw.weekly.start}–${fw.weekly.end}).`,
    ``,
    `## Tono general`,
    `- 2–4 frases de conjunto para ${fw.weekly.start}–${fw.weekly.end}; sin anclar a lun–dom fuera de estas fechas.`,
    ``,
    ...weeklyDayOutlineBlocks(fw, "es"),
    `## Amor y relaciones`,
    `- Un párrafo corto; solo esta semana ${fw.weekly.start}–${fw.weekly.end}.`,
    ``,
    `## Trabajo y proyectos`,
    `- Un párrafo corto; mismo rango de fechas.`,
    ``,
    `## Energía y bienestar`,
    `- Un párrafo corto sobre energía y bienestar; sin consejos médicos.`,
    ``,
    `## Día más potente`,
    `- En el texto: fecha YYYY-MM-DD (${fw.timezone}) y justificación en la carta y los tránsitos.`,
    ``,
    `## Reto`,
    `- Un párrafo con lectura constructiva del mapa.`,
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
  birthTimeUnknown = false,
): string[] {
  const jsonHint =
    lang === "pl"
      ? `Trzymaj się liczb z JSON (długości ekliptyczne, Ascendent, strefa ${chart.timezone}, współrzędne) — nie zaprzeczaj im.`
      : lang === "es"
        ? `Respeta las cifras del JSON (longitudes, Ascendente, zona ${chart.timezone}, coordenadas) — no las contradigas.`
        : `Stay consistent with the JSON numbers (longitudes, Ascendant, timezone ${chart.timezone}, coordinates) — do not contradict them.`;
  if (lang === "pl") {
    return [
      `Nie używaj nagłówka poziomu # i NIE twórz sekcji „Dane urodzenia”.`,
      ``,
      `Na samej górze interpretacji wstaw tylko jedną krótką linię techniczną: **${dob} · ${tob} · ${pob}**. Bez akapitu z danymi urodzenia i bez powtarzania ich później.`,
      ``,
      `Potem — wyłącznie trzy nagłówki ## w tej kolejności (krótkie tytuły bez dopisków; treść wg punktów poniżej):`,
      ``,
      `## Słońce`,
      `- 5–8 zdań: wyłącznie dla TEJ osoby i TEJ mapy (JSON). Podaj znak i sens stopnia Słońca z danych; rdzeń motywacji, styl bycia, jak „świeci” energia słoneczna w życiu codziennym.`,
      `- Możesz wpleść 1–2 najsilniejsze aspekty natalne dotykające Słońca (orb ~6° według długości ekliptycznej z JSON); nie wymyślaj ciał spoza JSON.`,
      ``,
      `## Księżyc`,
      `- 5–8 zdań: znak i sens Księżyca z mapy; potrzeby emocjonalne, reakcje, co daje poczucie bezpieczeństwa; 0–2 aspekty do Księżyca z JSON, jeśli są czytelne.`,
      ``,
      `## Ascendent`,
      birthTimeUnknown
        ? `- 3–5 zdań: godzina urodzenia jest nieznana, więc Ascendent policzony dla 12:00 jest wyłącznie orientacyjny. Zaznacz to jasno; nie traktuj pierwszego wrażenia, domów ani osi jako pewnych.`
        : `- 4–7 zdań: Ascendent ok. ${chart.ascendantDeg.toFixed(1)}° i jego znak; pierwsze wrażenie, sposób wchodzenia w kontakt z otoczeniem; bez przepowiadania zdarzeń.`,
      ``,
      `Sekcji „## Wykres Natalny” z pełną listą aspektów: NIE — to wyłącznie okrojony podgląd.`,
      jsonHint,
    ];
  }
  if (lang === "es") {
    return [
      `No uses un encabezado de nivel # y NO crees una sección “Datos de nacimiento”.`,
      ``,
      `En la parte superior de la interpretación coloca solo una línea técnica breve: **${dob} · ${tob} · ${pob}**. Sin párrafo de datos de nacimiento y sin repetirlos después.`,
      ``,
      `Después, SOLO tres encabezados ## en este orden (títulos breves sin añadidos; el desarrollo va en los párrafos):`,
      ``,
      `## Sol`,
      `- 5–8 frases: solo para ESTA persona y ESTA carta (JSON). Signo y sentido del grado solar; núcleo motivacional y estilo de presencia.`,
      `- Puedes incluir 1–2 aspectos natales fuertes al Sol (orbe ~6° según longitudes del JSON); no inventes cuerpos fuera del JSON.`,
      ``,
      `## Luna`,
      `- 5–8 frases: signo lunar; necesidades emocionales, reacciones, qué aporta calma; 0–2 aspectos a la Luna si se ven claros en el JSON.`,
      ``,
      `## Ascendente`,
      birthTimeUnknown
        ? `- 3–5 frases: la hora de nacimiento es desconocida, así que el Ascendente calculado para las 12:00 es solo orientativo. Indícalo con claridad; no trates la primera impresión, las casas ni los ejes como datos seguros.`
        : `- 4–7 frases: Ascendente ~${chart.ascendantDeg.toFixed(1)}° y su signo; primera impresión y filtro social; sin predicciones de eventos.`,
      ``,
      `No escribas una sección larga “Carta natal” con listas de aspectos.`,
      jsonHint,
    ];
  }
  return [
    `Do not use a level-# heading and do NOT create a “Birth details” section.`,
    ``,
    `At the very top of the interpretation, include only one short technical line: **${dob} · ${tob} · ${pob}**. Do not add a birth details paragraph and do not repeat these details later.`,
    ``,
    `Then add ONLY these three ## headings in this order (short titles only; expand in paragraphs below):`,
    ``,
    `## Sun`,
    `- 5–8 sentences: for THIS person and THIS chart (JSON) only. State the Sun’s sign and degree sense from the data; core motivation, how solar energy shows up day to day.`,
    `- You may weave in 1–2 strongest natal aspects to the Sun (~6° orb from ecliptic longitudes in JSON); do not invent bodies not in JSON.`,
    ``,
    `## Moon`,
    `- 5–8 sentences: Moon sign from the chart; emotional needs, reactions, what helps you feel grounded; 0–2 aspects to the Moon from JSON if clearly readable.`,
    ``,
    `## Ascendant`,
    birthTimeUnknown
      ? `- 3–5 sentences: the birth time is unknown, so the Ascendant calculated for 12:00 is only approximate. State this clearly; do not treat first impression, houses, or axes as certain.`
      : `- 4–7 sentences: Ascendant ~${chart.ascendantDeg.toFixed(1)}° and its sign; first impression and social “filter”; no event fortune-telling.`,
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
  birthTimeUnknown?: boolean;
}): string {
  const { dob, tob, pob, lang, chart, birthTimeUnknown = false } = input;
  const displayTob = birthTimeForPrompt(lang, tob, birthTimeUnknown);
  const ephem = natalChartSummaryJson(chart);
  const outline = natalBasicFreeOutline(lang, chart, dob, displayTob, pob, birthTimeUnknown);

  if (lang === "pl") {
    return [
      `Jesteś doświadczonym astrologiem. Klient otrzymuje DARMOWY, krótszy podgląd mapy — tylko interpretacja Słońca, Księżyca i Ascendentu (nie zastępuje pełnego płatnego raportu osobowości).`,
      ``,
      `WAŻNE: Cały dokument wyłącznie po polsku.`,
      ``,
      ...editorialQualityInstructions("pl"),
      ...readerFacingSectionHeadingRules("pl"),
      ``,
      `Dane urodzenia podajesz tylko raz, jako krótką linię na górze interpretacji: **${dob} · ${displayTob} · ${pob}**. Nie twórz sekcji „Dane urodzenia”.`,
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
      `Oddaj „bliskość przy stole” jak w naszych lekturach tarota — nadal tylko Sol / Księżyc / Ascendent wg JSON i bez wymyślania biografii.`,
    ].join("\n");
  }
  if (lang === "es") {
    return [
      `Eres un astrólogo experimentado. La persona recibe una vista gratuita y breve: solo Sol, Luna y Ascendente (no reemplaza el informe de personalidad de pago).`,
      ``,
      `IMPORTANTE: Todo en español.`,
      ``,
      ...editorialQualityInstructions("es"),
      ...readerFacingSectionHeadingRules("es"),
      ``,
      `Muestra los datos de nacimiento solo una vez, como una línea breve al inicio de la interpretación: **${dob} · ${displayTob} · ${pob}**. No crees una sección “Datos de nacimiento”.`,
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
      `Mantén la cercanía de nuestras lecturas de tarot CosmoTips — pero solo dentro de Sol/Luna/Ascendente y el JSON, sin inventar biografía.`,
    ].join("\n");
  }
  return [
    `You are an experienced astrologer. The user receives a FREE, shorter chart preview: only individualized Sun, Moon, and Ascendant interpretation (not the full paid personality report).`,
    ``,
    `IMPORTANT: Entire document in English.`,
    ``,
    ...editorialQualityInstructions("en"),
    ...readerFacingSectionHeadingRules("en"),
    ``,
    `Show the birth data only once, as a short line at the top of the interpretation: **${dob} · ${displayTob} · ${pob}**. Do not create a “Birth details” section.`,
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
    `Keep the same grounded intimacy as CosmoTips tarot guidance — still only Sun/Moon/Ascendant and JSON; no invented biography.`,
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
  birthTimeUnknown = false,
): string[] {
  if (reportType === "personality") {
    return premiumPersonalityOutline(
      chart,
      dob,
      tob,
      pob,
      lang,
      birthTimeUnknown,
    );
  }

  if (lang === "pl") {
    if (reportType === "monthly") return plMonthlyOutline(chart, dob, tob, pob, fw, birthTimeUnknown);
    return plWeeklyOutline(chart, dob, tob, pob, fw, birthTimeUnknown);
  }
  if (lang === "es") {
    if (reportType === "monthly") return esMonthlyOutline(chart, dob, tob, pob, fw, birthTimeUnknown);
    return esWeeklyOutline(chart, dob, tob, pob, fw, birthTimeUnknown);
  }
  if (reportType === "monthly") return enMonthlyOutline(chart, dob, tob, pob, fw, birthTimeUnknown);
  return enWeeklyOutline(chart, dob, tob, pob, fw, birthTimeUnknown);
}

export function buildReportPrompt(input: {
  dob: string;
  tob: string;
  pob: string;
  reportType: ReportType;
  lang: AppLang;
  chart: NatalChartPayload;
  birthTimeUnknown?: boolean;
}): string {
  const { dob, tob, pob, reportType, lang, chart, birthTimeUnknown = false } = input;
  if (reportType === "natal_basic") {
    throw new Error("natal_basic is generated without an LLM prompt.");
  }
  const fw = getForecastWindows();
  const ephem = natalChartSummaryJson(chart);
  const displayTob = birthTimeForPrompt(lang, tob, birthTimeUnknown);
  const outline = outlineFor(reportType, lang, chart, dob, displayTob, pob, fw, birthTimeUnknown);

  const commonPl = [
    `Jesteś doświadczonym astrologiem. Klient zapłacił za bardzo osobisty, spójny raport w języku polskim.`,
    ``,
    `WAŻNE: Cały dokument musi być wyłącznie po polsku (nagłówki i treść).`,
    ``,
    ...editorialQualityInstructions("pl"),
    ...readerFacingSectionHeadingRules("pl"),
    ``,
    `Dane urodzenia (dokładnie):`,
    `- Data: ${dob}`,
    `- Godzina: ${displayTob}`,
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
    ...readerFacingSectionHeadingRules("es"),
    ``,
    `Datos de nacimiento:`,
    `- Fecha: ${dob}`,
    `- Hora: ${displayTob}`,
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
    ...readerFacingSectionHeadingRules("en"),
    ``,
    `Birth data (exact):`,
    `- Date: ${dob}`,
    `- Time: ${displayTob}`,
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
