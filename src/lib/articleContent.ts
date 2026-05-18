import type { AppLang } from "@/lib/reportSchema";
import {
  articleNatalChartBeginnerEnBody,
  articleNatalChartBeginnerEsBody,
  articleNatalChartBeginnerPlBody,
  articleSaturnReturnEnBody,
  articleSaturnReturnEsBody,
  articleSaturnReturnPlBody,
} from "@/lib/articleSeoPackBodies";
import {
  articleSelfKnowledgeEnBody,
  articleSelfKnowledgeEsBody,
  articleSelfKnowledgePlBody,
} from "@/lib/articleSelfKnowledgeBodies";

const bibliographyEn = `
## References

[1] Rochberg, F. *The Heavenly Writing: Divination, Horoscopy, and Astronomy in Mesopotamian Culture*. Cambridge University Press, 2004.

[2] Ptolemy, Claudius. *Tetrabiblos*. Translated by F.E. Robbins. Harvard University Press, 1940.

[3] Campion, Nicholas. *A History of Western Astrology*. Continuum, 2008.

[4] Jung, C.G. *Synchronicity: An Acausal Connecting Principle*. Princeton University Press, 1973.

[5] Tester, S.J. *A History of Western Astrology*. Boydell Press, 1987.

[6] Kuhn, Thomas S. *The Copernican Revolution*. Harvard University Press, 1957.

[7] Carlson, Shawn. “A Double-Blind Test of Astrology.” *Nature*, vol. 318, 1985, pp. 419–425.

[8] Hanegraaff, Wouter J. *New Age Religion and Western Culture*. SUNY Press, 1998.
`;

const bibliographyPl = `
## Przypisy

[1] Rochberg, F. *The Heavenly Writing: Divination, Horoscopy, and Astronomy in Mesopotamian Culture*. Cambridge University Press, 2004.

[2] Ptolemy, Klaudiusz. *Tetrabiblos*. Tłum. F.E. Robbins. Harvard University Press, 1940.

[3] Campion, Nicholas. *A History of Western Astrology*. Continuum, 2008.

[4] Jung, C.G. *Synchronicity: An Acausal Connecting Principle*. Princeton University Press, 1973.

[5] Tester, S.J. *A History of Western Astrology*. Boydell Press, 1987.

[6] Kuhn, Thomas S. *The Copernican Revolution*. Harvard University Press, 1957.

[7] Carlson, Shawn. „A Double-Blind Test of Astrology”. *Nature*, tom 318, 1985, s. 419–425.

[8] Hanegraaff, Wouter J. *New Age Religion and Western Culture*. SUNY Press, 1998.
`;

const bibliographyEs = `
## Referencias

[1] Rochberg, F. *The Heavenly Writing: Divination, Horoscopy, and Astronomy in Mesopotamian Culture*. Cambridge University Press, 2004.

[2] Ptolemy, Claudio. *Tetrabiblos*. Trad. F.E. Robbins. Harvard University Press, 1940.

[3] Campion, Nicholas. *A History of Western Astrology*. Continuum, 2008.

[4] Jung, C.G. *Synchronicity: An Acausal Connecting Principle*. Princeton University Press, 1973.

[5] Tester, S.J. *A History of Western Astrology*. Boydell Press, 1987.

[6] Kuhn, Thomas S. *The Copernican Revolution*. Harvard University Press, 1957.

[7] Carlson, Shawn. “A Double-Blind Test of Astrology.” *Nature*, vol. 318, 1985, pp. 419–425.

[8] Hanegraaff, Wouter J. *New Age Religion and Western Culture*. SUNY Press, 1998.
`;

export type SiteArticle = {
  id: string;
  title: string;
  body: string;
};

export const siteArticlesByLang: Record<AppLang, SiteArticle[]> = {
  pl: [
    {
      id: "natal-astrology-history-science",
      title:
      "Astrologia natalna w kontekście historii nauki: między obserwacją nieba a interpretacją znaczeń",
    body: `## Wstęp

Astrologia natalna należy do najstarszych systemów interpretacji relacji między człowiekiem a kosmosem. Jej korzenie sięgają starożytnych cywilizacji Mezopotamii, Egiptu i Grecji, gdzie obserwacja nieba była integralną częścią religii, polityki oraz organizacji życia społecznego. Współcześnie astrologia znajduje się poza granicami nauki akademickiej, jednak jej historyczny wpływ na rozwój astronomii, matematyki i filozofii pozostaje niepodważalny.

Astrologia natalna opiera się na założeniu, że układ ciał niebieskich w chwili narodzin człowieka odzwierciedla określone tendencje psychiczne, emocjonalne i życiowe. W przeciwieństwie do astronomii, która bada zjawiska kosmiczne metodami empirycznymi, astrologia interpretuje znaczenia symboliczne przypisywane planetom i znakom zodiaku.

Celem niniejszego artykułu jest przedstawienie astrologii natalnej w kontekście historii nauki oraz ukazanie napięcia pomiędzy obserwacją astronomiczną a symboliczną interpretacją rzeczywistości.

---

## 1. Początki astrologii i obserwacji nieba

Pierwsze systematyczne obserwacje nieba pojawiły się w Mezopotamii około II tysiąclecia p.n.e.[1] Babilończycy prowadzili szczegółowe zapisy ruchów planet, zaćmień oraz cykli księżycowych. Obserwacje te miały znaczenie praktyczne — służyły przewidywaniu pór roku, organizacji rolnictwa oraz interpretacji znaków boskich.

W starożytnej Grecji astrologia została połączona z filozofią naturalną. Klaudiusz Ptolemeusz w dziele Tetrabiblos stworzył fundament astrologii zachodniej, próbując uporządkować wpływy planetarne zgodnie z logiką i geometrią świata antycznego.[2]

W tym okresie nie istniał jeszcze wyraźny podział między astronomią a astrologią. Badanie ruchów ciał niebieskich było jednocześnie próbą zrozumienia porządku kosmosu oraz miejsca człowieka w świecie.

---

## 2. Astrologia natalna jako system symboliczny

Centralnym elementem astrologii natalnej jest horoskop urodzeniowy — mapa nieba sporządzona dla dokładnego momentu narodzin. Pozycje Słońca, Księżyca i planet interpretowane są jako symbole określonych archetypów psychicznych i doświadczeń życiowych.[3]

Astrologia nie opisuje przyczynowości w sensie naukowym. Jej język opiera się na analogii, metaforze i symbolu. Carl Gustav Jung interpretował astrologię jako przykład synchroniczności — znaczącej koincydencji między wydarzeniami psychicznymi a układami kosmicznymi.[4]

Współcześnie astrologia natalna często funkcjonuje jako narzędzie samopoznania i refleksji psychologicznej. Popularność astrologii w kulturze cyfrowej XXI wieku wskazuje, że mimo dominacji nauk empirycznych ludzie nadal poszukują narracji nadających sens doświadczeniu jednostkowemu.

---

## 3. Astrologia a rozwój nauki

Historia nauki pokazuje, że astrologia odegrała istotną rolę w rozwoju astronomii. Wielu wybitnych astronomów, takich jak Johannes Kepler czy Tycho Brahe, zajmowało się również astrologią.[5]

Dopiero rewolucja naukowa XVII wieku doprowadziła do stopniowego oddzielenia astronomii od astrologii. Rozwój metody eksperymentalnej, fizyki Newtona oraz kryteriów falsyfikowalności sprawił, że astrologia zaczęła być postrzegana jako system pozbawiony podstaw empirycznych.[6]

Współczesna nauka odrzuca astrologię jako teorię wyjaśniającą rzeczywistość fizyczną. Badania statystyczne nie potwierdziły istnienia zależności między pozycjami planet a cechami osobowości czy wydarzeniami życiowymi.[7]

Jednak z perspektywy historii idei astrologia pozostaje ważnym świadectwem sposobu, w jaki ludzie próbowali interpretować relację między człowiekiem a wszechświatem.

---

## 4. Współczesne znaczenie astrologii

W XXI wieku astrologia przeżywa renesans, szczególnie w mediach społecznościowych i kulturze wellness. Dla wielu osób stanowi język opisu emocji, relacji i procesów psychicznych.

Niektórzy badacze interpretują popularność astrologii jako reakcję na niepewność współczesnego świata.[8] W warunkach szybkich zmian społecznych astrologia oferuje poczucie narracyjnej spójności oraz symbolicznego sensu.

Jednocześnie pojawia się pytanie o granice między wiedzą naukową a praktykami symbolicznymi. Astrologia, choć nie spełnia kryteriów nauki empirycznej, pozostaje istotnym fenomenem kulturowym i psychologicznym.

---

## Zakończenie

Astrologia natalna znajduje się na pograniczu historii nauki, filozofii i symboliki kulturowej. Choć współczesna nauka odrzuca jej roszczenia do opisu rzeczywistości fizycznej, astrologia odegrała ważną rolę w rozwoju obserwacji astronomicznych oraz sposobów rozumienia kosmosu.

Jej trwała obecność w kulturze pokazuje, że człowiek nie poszukuje wyłącznie danych i faktów, ale także znaczeń. Historia astrologii jest więc jednocześnie historią ludzkiej potrzeby interpretowania świata i własnego miejsca we wszechświecie.
${bibliographyPl}`,
    },
    {
      id: "natal-chart-self-knowledge",
      title:
        "Analiza wykresu natalnego jako narzędzie samopoznania: astrologia jako symboliczny język życia",
      body: articleSelfKnowledgePlBody,
    },
    {
      id: "natal-chart-beginners-guide",
      title:
        "Co to jest kosmogram? Przewodnik dla początkujących po astrologii natalnej",
      body: articleNatalChartBeginnerPlBody,
    },
    {
      id: "saturn-return-explained",
      title: "Powrót Saturna: znaczenie, kryzys i transformacja",
      body: articleSaturnReturnPlBody,
    },
  ],
  es: [
    {
      id: "natal-astrology-history-science",
      title:
        "Astrología natal en el contexto de la historia de la ciencia: entre la observación del cielo y la interpretación de significados",
      body: `## Introducción

La astrología natal es uno de los sistemas más antiguos de interpretación de la relación entre el ser humano y el cosmos. Sus raíces se remontan a las civilizaciones antiguas de Mesopotamia, Egipto y Grecia, donde la observación del cielo formaba parte integral de la religión, la política y la organización de la vida social.

Actualmente, la astrología se sitúa fuera de los límites de la ciencia académica; sin embargo, su influencia histórica en el desarrollo de la astronomía, las matemáticas y la filosofía sigue siendo indiscutible.

La astrología natal sostiene que la posición de los cuerpos celestes en el momento del nacimiento refleja determinadas tendencias psicológicas, emocionales y vitales. A diferencia de la astronomía, que estudia fenómenos cósmicos mediante métodos empíricos, la astrología interpreta significados simbólicos asociados a los planetas y signos zodiacales.

---

## 1. Los orígenes de la astrología y la observación del cielo

Las primeras observaciones sistemáticas del cielo aparecieron en Mesopotamia alrededor del segundo milenio antes de Cristo.[1] Los babilonios registraban movimientos planetarios, eclipses y ciclos lunares con gran precisión.

En la antigua Grecia, la astrología se vinculó con la filosofía natural. Claudio Ptolomeo, en su obra Tetrabiblos, estableció las bases de la astrología occidental.[2]

Durante este período no existía una separación clara entre astronomía y astrología. El estudio del cielo era también una búsqueda del orden cósmico y del lugar del ser humano en el universo.

---

## 2. La astrología natal como sistema simbólico

El elemento central de la astrología natal es la carta astral, un mapa celeste calculado para el momento exacto del nacimiento. Las posiciones planetarias se interpretan como símbolos de arquetipos psicológicos y experiencias vitales.[3]

Carl Gustav Jung relacionó la astrología con el concepto de sincronicidad, entendida como coincidencia significativa entre fenómenos psíquicos y eventos externos.[4]

Actualmente, muchas personas utilizan la astrología como herramienta de autoconocimiento y reflexión emocional.

---

## 3. Astrología y desarrollo científico

La historia de la ciencia demuestra que la astrología desempeñó un papel importante en el desarrollo de la astronomía. Astrónomos como Johannes Kepler y Tycho Brahe practicaron también la astrología.[5]

La revolución científica del siglo XVII separó progresivamente ambas disciplinas. El desarrollo de la física moderna y del método experimental llevó a considerar la astrología como un sistema sin validación empírica.[6]

Las investigaciones contemporáneas no han demostrado correlaciones estadísticas sólidas entre posiciones planetarias y rasgos de personalidad.[7]

---

## 4. Significado contemporáneo de la astrología

En el siglo XXI, la astrología ha experimentado un resurgimiento en redes sociales y culturas de bienestar emocional. Para muchas personas funciona como lenguaje simbólico para comprender emociones y relaciones.

Algunos investigadores consideran que su popularidad refleja la búsqueda de sentido en contextos de incertidumbre social y cultural.[8]

---

## Conclusión

La astrología natal ocupa un espacio intermedio entre historia de la ciencia, filosofía y simbolismo cultural. Aunque la ciencia contemporánea rechaza sus afirmaciones empíricas, la astrología sigue siendo un fenómeno cultural significativo y un testimonio histórico de la relación humana con el cosmos.
${bibliographyEs}`,
    },
    {
      id: "natal-chart-self-knowledge",
      title:
        "El análisis de la carta natal como herramienta de autoconocimiento: la astrología como una forma de comprender la vida",
      body: articleSelfKnowledgeEsBody,
    },
    {
      id: "natal-chart-beginners-guide",
      title:
        "¿Qué es una carta natal? Guía para principiantes sobre astrología natal",
      body: articleNatalChartBeginnerEsBody,
    },
    {
      id: "saturn-return-explained",
      title: "Retorno de Saturno: significado y transformación personal",
      body: articleSaturnReturnEsBody,
    },
  ],
  en: [
    {
      id: "natal-astrology-history-science",
      title:
      "Natal Astrology in the Context of the History of Science: Between Celestial Observation and the Interpretation of Meaning",
    body: `## Introduction

Natal astrology is one of the oldest systems for interpreting the relationship between human beings and the cosmos. Its roots can be traced back to ancient Mesopotamian, Egyptian, and Greek civilizations, where celestial observation was deeply connected to religion, politics, and social organization.

Today, astrology exists outside the boundaries of academic science; nevertheless, its historical influence on astronomy, mathematics, and philosophy remains undeniable.

Natal astrology is based on the assumption that the positions of celestial bodies at the moment of birth reflect psychological, emotional, and life tendencies. Unlike astronomy, which studies cosmic phenomena through empirical methods, astrology interprets symbolic meanings associated with planets and zodiac signs.

---

## 1. Origins of Astrology and Celestial Observation

The earliest systematic observations of the sky emerged in Mesopotamia during the second millennium BCE.[1] Babylonian scholars carefully recorded planetary movements, eclipses, and lunar cycles.

In ancient Greece, astrology became linked with natural philosophy. Claudius Ptolemy’s Tetrabiblos laid the foundations of Western astrology.[2]

At that time, astronomy and astrology were not clearly separated disciplines. Observing the heavens was simultaneously an attempt to understand cosmic order and humanity’s place within it.

---

## 2. Natal Astrology as a Symbolic System

The central element of natal astrology is the birth chart — a celestial map calculated for the exact moment of birth. Planetary positions are interpreted as symbols of psychological archetypes and life experiences.[3]

Carl Gustav Jung associated astrology with synchronicity, describing meaningful coincidences between psychic events and external patterns.[4]

Today, natal astrology is often used as a tool for self-reflection and psychological exploration.

---

## 3. Astrology and the Development of Science

The history of science demonstrates that astrology played a significant role in the development of astronomy. Important astronomers such as Johannes Kepler and Tycho Brahe also practiced astrology.[5]

The Scientific Revolution of the seventeenth century gradually separated astronomy from astrology. The emergence of experimental science and modern physics led astrology to be regarded as lacking empirical validity.[6]

Contemporary scientific studies have not demonstrated reliable statistical correlations between planetary positions and personality traits.[7]

---

## 4. Contemporary Significance of Astrology

In the twenty-first century, astrology has experienced a revival, particularly through social media and wellness culture. For many individuals, it functions as a symbolic language for understanding emotions, relationships, and identity.

Some scholars interpret astrology’s renewed popularity as a response to uncertainty and fragmentation in contemporary society.[8]

---

## Conclusion

Natal astrology occupies an intermediate space between the history of science, philosophy, and cultural symbolism. Although modern science rejects its empirical claims, astrology remains historically significant as part of humanity’s attempt to interpret the cosmos and its own existence within it.

Its persistence suggests that human beings seek not only facts and measurements, but also meaning.
${bibliographyEn}`,
    },
    {
      id: "natal-chart-self-knowledge",
      title:
        "Natal Chart Analysis as a Tool for Self-Understanding: Astrology as a Way of Interpreting Life",
      body: articleSelfKnowledgeEnBody,
    },
    {
      id: "natal-chart-beginners-guide",
      title:
        "What Is a Natal Chart? Beginner's Guide to Understanding Your Birth Chart",
      body: articleNatalChartBeginnerEnBody,
    },
    {
      id: "saturn-return-explained",
      title:
        "Saturn Return Explained: Meaning, Timing, and Spiritual Transformation",
      body: articleSaturnReturnEnBody,
    },
  ],
};
