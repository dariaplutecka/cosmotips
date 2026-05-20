import type { AppLang } from "@/lib/reportSchema";
import {
  emptyArticleSlot,
  natalHistoryArticleEn,
  natalHistoryArticleEs,
  natalHistoryArticlePl,
} from "@/content/natalHistoryArticle";

export type ReportTypeId =
  | "natal_basic"
  | "personality"
  | "weekly"
  | "monthly";

export type HomeFooterArticle = {
  title: string;
  teaser: string;
  /** Pełna treść artykułu — na razie placeholder; można podmienić później */
  body: string;
};

export type ArticlesPageCopy = {
  pageTitle: string;
  backHome: string;
  articleOpen: string;
  articleCloseAria: string;
  articles: HomeFooterArticle[];
};

export const seoMeta: Record<
  AppLang,
  {
    homeTitle: string;
    homeDescription: string;
    articlesTitle: string;
    articlesDescription: string;
    tarotTitle: string;
    tarotDescription: string;
    successTitle: string;
  }
> = {
  en: {
    homeTitle: "CosmoTips — Personalized AI Astrology Reports",
    homeDescription:
      "Astrology insights rooted in emotional clarity and self-understanding — personalized AI readings for identity, patterns, relationships, and direction.",
    articlesTitle: "Astrology Articles — CosmoTips",
    articlesDescription:
      "Read our astrology articles and learn more about your birth chart.",
    tarotTitle: "Tarot Reading — CosmoTips",
    tarotDescription:
      "Tarot readings for intuition and clarity — reflective spreads with personalized AI guidance through transitions and emotional themes.",
    successTitle: "Your Report is Ready — CosmoTips",
  },
  pl: {
    homeTitle: "CosmoTips — Spersonalizowane Raporty Astrologiczne AI",
    homeDescription:
      "Astrologiczne interpretacje blisko emocji i rozwoju — spersonalizowane raporty AI: motywy życiowe, relacje i kierunek zmian.",
    articlesTitle: "Artykuły Astrologiczne — CosmoTips",
    articlesDescription:
      "Czytaj nasze artykuły astrologiczne i dowiedz się więcej o swoim horoskopie.",
    tarotTitle: "Rozkład Tarota — CosmoTips",
    tarotDescription:
      "Tarot jako przestrzeń refleksji i intuicji — spersonalizowane interpretacje AI w przejściach i ważnych pytaniach.",
    successTitle: "Twój Raport Jest Gotowy — CosmoTips",
  },
  es: {
    homeTitle: "CosmoTips — Informes Astrológicos Personalizados con IA",
    homeDescription:
      "Interpretaciones astrológicas con foco emocional y autoconocimiento — lecturas personalizadas con IA sobre patrones, relaciones y dirección.",
    articlesTitle: "Artículos de Astrología — CosmoTips",
    articlesDescription:
      "Lee nuestros artículos de astrología y aprende más sobre tu carta natal.",
    tarotTitle: "Lectura de Tarot — CosmoTips",
    tarotDescription:
      "Tarot para intuición y claridad — tiradas reflexivas con orientación personalizada por IA en momentos de cambio.",
    successTitle: "Tu Informe Está Listo — CosmoTips",
  },
};

/** User-facing validation / outage copy (homepage, login panel, success). */
export const errorMessages: Record<
  AppLang,
  {
    loginFailed: string;
    emailSent: string;
    reportFailed: string;
    invalidLink: string;
    invalidEmail: string;
  }
> = {
  en: {
    loginFailed: "Something went wrong. Please try again.",
    emailSent: "Check your inbox — we sent you a login link.",
    reportFailed: "We couldn't generate your report. Please try again.",
    invalidLink: "This link has expired. Please log in again.",
    invalidEmail: "Enter a valid email address.",
  },
  pl: {
    loginFailed: "Coś poszło nie tak. Spróbuj ponownie.",
    emailSent: "Sprawdź skrzynkę — wysłaliśmy Ci link do logowania.",
    reportFailed: "Nie udało się wygenerować raportu. Spróbuj ponownie.",
    invalidLink: "Link wygasł. Zaloguj się ponownie.",
    invalidEmail: "Podaj poprawny adres e-mail.",
  },
  es: {
    loginFailed: "Algo salió mal. Por favor, inténtalo de nuevo.",
    emailSent: "Revisa tu correo — te enviamos un enlace de acceso.",
    reportFailed: "No pudimos generar tu informe. Inténtalo de nuevo.",
    invalidLink: "El enlace ha caducado. Por favor, inicia sesión de nuevo.",
    invalidEmail: "Introduce un correo válido.",
  },
};

export const tarotCopy: Record<
  AppLang,
  {
    pageTitle: string;
    pageSubtitle: string;
    buyTokens: string;
    tokensLeft: string;
    chooseSpread: string;
    checkoutEmail: string;
    name: string;
    namePlaceholder: string;
    birthDate: string;
    dailyCard: string;
    dailyCardDesc: string;
    dailyCardBadge: string;
    dailyCardCost: string;
    threeCard: string;
    threeCardDesc: string;
    celticCross: string;
    celticCrossDesc: string;
    chooseTopic: string;
    continue: string;
    topicLove: string;
    topicFinance: string;
    topicHealth: string;
    shuffling: string;
    generating: string;
    emailSent: string;
    subTeaser: string;
    notifyMe: string;
    oneToken: string;
    enterEmail: string;
    generateReading: string;
    spreadAnalysisTitle: string;
    dailyCardAnalysisTitle: string;
    back: string;
    newReading: string;
    noTokens: string;
    paymentCancelled: string;
    paymentSuccess: string;
    networkError: string;
    tokenStoreUnavailable: string;
    aiGenerationFailed: string;
    dailyCardUsed: string;
    termsRequired: string;
    missingProfile: string;
    arcanaMajor: string;
    arcanaMinor: string;
  }
> = {
  en: {
    pageTitle: "Tarot Reading",
    pageSubtitle: "Card of the Day is free. Paid tarot readings cost €5.",
    buyTokens: "Pay €5",
    tokensLeft: "Tokens left: {n}",
    chooseSpread: "Choose a spread type",
    checkoutEmail: "Email for token purchase",
    name: "Name",
    namePlaceholder: "Your name",
    birthDate: "Date of birth",
    dailyCard: "Card of the Day",
    dailyCardDesc:
      "Receive a daily tarot card with personalized insight into the energy, emotions, and themes influencing your day ahead.",
    dailyCardBadge: "Free",
    dailyCardCost: "Free once a day",
    threeCard: "Three-Card Spread",
    threeCardDesc:
      "Explore the past, present, and future energies surrounding your question — revealing patterns, emotional dynamics, and possible next steps.",
    celticCross: "Celtic Cross",
    celticCrossDesc:
      "An in-depth 10-card tarot reading designed to uncover deeper influences, emotional blocks, hidden dynamics, and potential outcomes surrounding your situation.",
    chooseTopic: "Choose an area to analyze",
    continue: "Continue",
    topicLove: "Love & Relationships",
    topicFinance: "Career & Finance",
    topicHealth: "Health",
    shuffling: "Shuffling the cards...",
    generating: "Reading the cards...",
    emailSent: "Your reading has been sent to {email}.",
    subTeaser: "Soon: a tarot subscription with regular spreads and deeper monthly guidance.",
    notifyMe: "Notify me",
    oneToken: "€5",
    enterEmail: "Enter your email",
    generateReading: "Generate reading",
    spreadAnalysisTitle: "Spread Analysis",
    dailyCardAnalysisTitle: "Card of the Day Analysis",
    back: "← Back",
    newReading: "New reading",
    noTokens: "To generate this tarot reading, pay €5.",
    paymentCancelled: "Payment was cancelled. Your reading was not charged.",
    paymentSuccess: "Payment successful. You can now generate your reading.",
    networkError: "Something went wrong. Try again in a moment.",
    tokenStoreUnavailable:
      "Tarot tokens aren’t available: the Redis database isn’t configured. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your hosting dashboard (Production), redeploy, and complete payment again.",
    aiGenerationFailed:
      "The cards could not be interpreted right now. Try again in a moment.",
    dailyCardUsed: "You have already drawn your free Card of the Day today. Come back tomorrow.",
    termsRequired: "Accept the Terms of Service to continue.",
    missingProfile: "Enter your name and date of birth to continue.",
    arcanaMajor: "Major Arcana",
    arcanaMinor: "Minor Arcana",
  },
  pl: {
    pageTitle: "Rozkład Tarota",
    pageSubtitle: "Karta dnia jest darmowa. Płatne rozkłady kosztują 5 EUR.",
    buyTokens: "Zapłać 5 EUR",
    tokensLeft: "Pozostałe tokeny: {n}",
    chooseSpread: "Wybierz rodzaj rozkładu",
    checkoutEmail: "E-mail do zakupu tokena",
    name: "Imię",
    namePlaceholder: "Twoje imię",
    birthDate: "Data urodzenia",
    dailyCard: "Karta dnia",
    dailyCardDesc:
      "Otrzymaj codzienną kartę tarota wraz ze spersonalizowaną interpretacją energii, emocji i motywów wpływających na Twój dzień.",
    dailyCardBadge: "Darmowe",
    dailyCardCost: "Za darmo raz dziennie",
    threeCard: "Rozkład 3 Kart",
    threeCardDesc:
      "Poznaj przeszłe, obecne i przyszłe energie związane z Twoim pytaniem — odkrywając schematy, emocjonalne dynamiki i możliwe kierunki rozwoju sytuacji.",
    celticCross: "Krzyż Celtycki",
    celticCrossDesc:
      "Dogłębny rozkład 10 kart pomagający odkryć głębsze wpływy, blokady emocjonalne, ukryte dynamiki i możliwe rezultaty Twojej sytuacji.",
    chooseTopic: "Wybierz obszar analizy",
    continue: "Dalej",
    topicLove: "Miłość i relacje",
    topicFinance: "Kariera i finanse",
    topicHealth: "Zdrowie",
    shuffling: "Tasowanie kart...",
    generating: "Czytanie kart...",
    emailSent: "Twój rozkład został wysłany na {email}.",
    subTeaser: "Wkrótce: subskrypcja tarota z regularnymi rozkładami i głębszym prowadzeniem miesięcznym.",
    notifyMe: "Powiadom mnie",
    oneToken: "5 EUR",
    enterEmail: "Podaj e-mail",
    generateReading: "Generuj rozkład",
    spreadAnalysisTitle: "Analiza rozkładu",
    dailyCardAnalysisTitle: "Analiza karty dnia",
    back: "← Wróć",
    newReading: "Nowy rozkład",
    noTokens: "Aby wygenerować ten rozkład tarota, opłać go za 5 EUR.",
    paymentCancelled: "Płatność została anulowana. Rozkład nie został opłacony.",
    paymentSuccess: "Płatność zakończona. Możesz teraz wygenerować rozkład.",
    networkError: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
    tokenStoreUnavailable:
      "Tarot jest niedostępny: brak konfiguracji Redis (magazyn tokenów). W panelu hostingu dodaj zmienne UPSTASH_REDIS_REST_URL oraz UPSTASH_REDIS_REST_TOKEN dla środowiska Production i zrób Redeploy. Bez tego ani płatność Stripe, ani tokeny po zakupie nie zadziałają poprawnie.",
    aiGenerationFailed:
      "Nie udało się teraz zinterpretować kart. Spróbuj ponownie za chwilę.",
    dailyCardUsed: "Karta dnia została już dziś wylosowana. Wróć jutro po kolejną.",
    termsRequired: "Zaakceptuj regulamin, aby kontynuować.",
    missingProfile: "Podaj imię i datę urodzenia, aby kontynuować.",
    arcanaMajor: "Wielkie Arkana",
    arcanaMinor: "Małe Arkana",
  },
  es: {
    pageTitle: "Lectura de Tarot",
    pageSubtitle: "La Carta del Día es gratis. Las tiradas de pago cuestan 5 EUR.",
    buyTokens: "Pagar 5 EUR",
    tokensLeft: "Fichas restantes: {n}",
    chooseSpread: "Elige un tipo de tirada",
    checkoutEmail: "Correo para comprar la ficha",
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    birthDate: "Fecha de nacimiento",
    dailyCard: "Carta del Día",
    dailyCardDesc:
      "Recibe una carta diaria de tarot con una interpretación personalizada sobre las energías, emociones y temas que influirán en tu día.",
    dailyCardBadge: "Gratis",
    dailyCardCost: "Gratis una vez al día",
    threeCard: "Tirada de 3 Cartas",
    threeCardDesc:
      "Explora las energías del pasado, presente y futuro relacionadas con tu pregunta, revelando patrones, dinámicas emocionales y posibles caminos a seguir.",
    celticCross: "Cruz Celta",
    celticCrossDesc:
      "Una lectura profunda de 10 cartas diseñada para revelar influencias ocultas, bloqueos emocionales, dinámicas internas y posibles resultados de tu situación.",
    chooseTopic: "Elige un área de análisis",
    continue: "Continuar",
    topicLove: "Amor y relaciones",
    topicFinance: "Carrera y finanzas",
    topicHealth: "Salud",
    shuffling: "Barajando las cartas...",
    generating: "Leyendo las cartas...",
    emailSent: "Tu tirada ha sido enviada a {email}.",
    subTeaser: "Próximamente: una suscripción de tarot con tiradas regulares y una guía mensual más profunda.",
    notifyMe: "Avisadme",
    oneToken: "5 EUR",
    enterEmail: "Introduce tu correo",
    generateReading: "Generar tirada",
    spreadAnalysisTitle: "Análisis de la tirada",
    dailyCardAnalysisTitle: "Análisis de la Carta del Día",
    back: "← Volver",
    newReading: "Nueva tirada",
    noTokens: "Para generar esta tirada de tarot, paga 5 EUR.",
    paymentCancelled: "El pago fue cancelado. La tirada no fue cobrada.",
    paymentSuccess: "Pago realizado. Ya puedes generar tu tirada.",
    networkError: "Algo salió mal. Inténtalo de nuevo en un momento.",
    tokenStoreUnavailable:
      "El tarot no está disponible: falta configurar Redis para las fichas. Añade UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN en el panel del hosting (Producción), vuelve a desplegar y completa el pago de nuevo.",
    aiGenerationFailed:
      "No se pudieron interpretar las cartas ahora. Inténtalo de nuevo en un momento.",
    dailyCardUsed: "Ya has sacado tu Carta del Día gratis hoy. Vuelve mañana.",
    termsRequired: "Acepta los términos de servicio para continuar.",
    missingProfile: "Introduce tu nombre y fecha de nacimiento para continuar.",
    arcanaMajor: "Arcanos Mayores",
    arcanaMinor: "Arcanos Menores",
  },
};

export const articlesPageCopy: Record<AppLang, ArticlesPageCopy> = {
  en: {
    pageTitle: "Articles",
    backHome: "Back home",
    articleOpen: "Show full article",
    articleCloseAria: "Collapse article",
    articles: [
      natalHistoryArticleEn,
      emptyArticleSlot,
      emptyArticleSlot,
    ],
  },
  pl: {
    pageTitle: "Artykuły",
    backHome: "Strona główna",
    articleOpen: "Pokaż cały artykuł",
    articleCloseAria: "Zwiń artykuł",
    articles: [
      natalHistoryArticlePl,
      emptyArticleSlot,
      emptyArticleSlot,
    ],
  },
  es: {
    pageTitle: "Artículos",
    backHome: "Inicio",
    articleOpen: "Ver artículo completo",
    articleCloseAria: "Contraer artículo",
    articles: [
      natalHistoryArticleEs,
      emptyArticleSlot,
      emptyArticleSlot,
    ],
  },
};

export const zodiacSignNames: Record<
  AppLang,
  Record<
    | "Capricorn"
    | "Aquarius"
    | "Pisces"
    | "Aries"
    | "Taurus"
    | "Gemini"
    | "Cancer"
    | "Leo"
    | "Virgo"
    | "Libra"
    | "Scorpio"
    | "Sagittarius",
    string
  >
> = {
  en: {
    Capricorn: "Capricorn",
    Aquarius: "Aquarius",
    Pisces: "Pisces",
    Aries: "Aries",
    Taurus: "Taurus",
    Gemini: "Gemini",
    Cancer: "Cancer",
    Leo: "Leo",
    Virgo: "Virgo",
    Libra: "Libra",
    Scorpio: "Scorpio",
    Sagittarius: "Sagittarius",
  },
  pl: {
    Capricorn: "Koziorożec",
    Aquarius: "Wodnik",
    Pisces: "Ryby",
    Aries: "Baran",
    Taurus: "Byk",
    Gemini: "Bliźnięta",
    Cancer: "Rak",
    Leo: "Lew",
    Virgo: "Panna",
    Libra: "Waga",
    Scorpio: "Skorpion",
    Sagittarius: "Strzelec",
  },
  es: {
    Capricorn: "Capricornio",
    Aquarius: "Acuario",
    Pisces: "Piscis",
    Aries: "Aries",
    Taurus: "Tauro",
    Gemini: "Géminis",
    Cancer: "Cáncer",
    Leo: "Leo",
    Virgo: "Virgo",
    Libra: "Libra",
    Scorpio: "Escorpio",
    Sagittarius: "Sagitario",
  },
};

export function zodiacDisplayName(lang: AppLang, englishSign: string): string {
  const map = zodiacSignNames[lang];
  if (englishSign in map) return map[englishSign as keyof typeof map];
  return englishSign;
}

export type SavedReportsPageCopy = {
  pageTitle: string;
  subtitle: string;
  generateNew: string;
  emptyHint: string;
  selectReport: string;
};

export const savedReportsPageCopy: Record<AppLang, SavedReportsPageCopy> = {
  en: {
    pageTitle: "Saved reports",
    subtitle: "Stored locally in your browser (up to 25).",
    generateNew: "Generate new",
    emptyHint: "No saved reports yet. Generate one to see it here.",
    selectReport: "Select a report.",
  },
  pl: {
    pageTitle: "Zapisane raporty",
    subtitle: "Przechowywane lokalnie w przeglądarce (do 25).",
    generateNew: "Wygeneruj nowy",
    emptyHint: "Nie masz jeszcze zapisanych raportów. Wygeneruj raport, aby zobaczyć go tutaj.",
    selectReport: "Wybierz raport.",
  },
  es: {
    pageTitle: "Informes guardados",
    subtitle: "Guardados localmente en tu navegador (hasta 25).",
    generateNew: "Generar nuevo",
    emptyHint: "Aún no hay informes guardados. Genera uno para verlo aquí.",
    selectReport: "Selecciona un informe.",
  },
};

export type ContactPageCopy = {
  pageTitle: string;
  backHome: string;
  lead: string;
  fieldName: string;
  fieldNameHint: string;
  fieldEmail: string;
  fieldMessage: string;
  submit: string;
  submitting: string;
  success: string;
  errorValidation: string;
  errorSend: string;
  fallbackNotConfigured: string;
  supportEmail: string;
};

export const contactPageCopy: Record<AppLang, ContactPageCopy> = {
  en: {
    pageTitle: "Contact",
    backHome: "Back home",
    lead: "Send us a message about reports, payments, or anything else. We read every note.",
    fieldName: "Name",
    fieldNameHint: "optional",
    fieldEmail: "Email",
    fieldMessage: "Message",
    submit: "Send message",
    submitting: "Sending…",
    success: "Thanks — your message was sent. We’ll reply when we can.",
    errorValidation: "Please check your email and write a bit more in the message (at least 10 characters).",
    errorSend: "We couldn’t send the message. Try again or use the email link below.",
    fallbackNotConfigured:
      "The contact form isn’t wired to email on this server yet. You can reach us directly at:",
    supportEmail: "raporty@cosmotips.eu",
  },
  pl: {
    pageTitle: "Kontakt",
    backHome: "Strona główna",
    lead: "Napisz w sprawie raportów, płatności lub innych pytań — czytamy każdą wiadomość.",
    fieldName: "Imię lub pseudonim",
    fieldNameHint: "opcjonalnie",
    fieldEmail: "E-mail",
    fieldMessage: "Wiadomość",
    submit: "Wyślij wiadomość",
    submitting: "Wysyłanie…",
    success: "Dziękujemy — wiadomość została wysłana. Odpowiemy, gdy będzie to możliwe.",
    errorValidation: "Sprawdź adres e-mail i treść (minimum ok. 10 znaków).",
    errorSend: "Nie udało się wysłać wiadomości. Spróbuj ponownie lub użyj linku mailowego poniżej.",
    fallbackNotConfigured:
      "Formularz nie jest jeszcze podpięty do wysyłki e-mail na tym serwerze. Napisz bezpośrednio na:",
    supportEmail: "raporty@cosmotips.eu",
  },
  es: {
    pageTitle: "Contacto",
    backHome: "Inicio",
    lead: "Escríbenos sobre informes, pagos u otras dudas — leemos todos los mensajes.",
    fieldName: "Nombre",
    fieldNameHint: "opcional",
    fieldEmail: "Correo electrónico",
    fieldMessage: "Mensaje",
    submit: "Enviar mensaje",
    submitting: "Enviando…",
    success: "Gracias — tu mensaje se envió. Responderemos cuando podamos.",
    errorValidation: "Revisa tu correo y escribe un poco más (mínimo unos 10 caracteres).",
    errorSend: "No pudimos enviar el mensaje. Inténtalo de nuevo o usa el enlace de correo abajo.",
    fallbackNotConfigured:
      "El formulario aún no está conectado al correo en este servidor. Escríbenos directamente a:",
    supportEmail: "raporty@cosmotips.eu",
  },
};

export type HomeCopy = {
  heroTitle: string;
  heroLead: string;
  heroSub: string;
  /** Akapity pod zakładkami Astrologia / Tarot (dla aktywnej zakładki). */
  toolPitchParagraphs: string[];
  tarotPitchParagraphs: string[];
  moduleTabs: {
    natal: string;
    tarot: string;
  };
  /** `aria-label` dla obszaru roboczego ze zakładkami (dostępność). */
  moduleWorkspaceLabel: string;
  tarotPanelTitle: string;
  tarotPanelLead: string;
  tarotPanelNote: string;
  dob: string;
  dobYear: string;
  dobMonth: string;
  dobDay: string;
  tob: string;
  tobHour: string;
  tobMinute: string;
  birthTimeUnknown: string;
  pob: string;
  pobPlaceholder: string;
  email: string;
  emailPlaceholder: string;
  reportSectionTitle: string;
  dataStepTitle: string;
  paymentStepTitle: string;
  paymentOnceTitle: string;
  paymentOnceHintFreePreview: string;
  paymentOnceHintForecast: string;
  paymentOnceHintPersonality: string;
  /** Jednorazowa — cena wg wybranej wyżej karty raportu */
  paymentOnceFollowsReportPrice: string;
  paymentMonthlySubscriptionTitle: string;
  paymentMonthlySubscriptionHint: string;
  paymentYearlySubscriptionTitle: string;
  paymentYearlySubscriptionHint: string;
  paymentTarotOnceHint: string;
  pickPaymentError: string;
  paySubmit: string;
  proceedToSubscriptionPayment: string;
  sendSubscriptionMagicLink: string;
  /** Krótka linia pod przyciskiem (bez kwot — są na kartach) */
  paymentFooterHint: string;
  reports: Record<
    ReportTypeId,
    { title: string; desc: string; freeBadge?: string; priceLabel: string }
  >;
  submit: string;
  submitting: string;
  /** Label around the terms link: `{before}{link}{after}` */
  termsAcceptBefore: string;
  termsAcceptLink: string;
  termsAcceptAfter: string;
  footer: string;
  /** Etykieta linku w stopce → /articles */
  footerArticlesTitle: string;
  /** Etykieta linku w stopce → /contact */
  footerContactTitle: string;
  /** Etykieta linku w stopce → /reports (zapisane lokalnie) */
  footerReportsTitle: string;
  /** Aria dla logo prowadzącego na stronę główną z formularzem */
  navLogoHomeAria: string;
  langLabel: string;
  placeNoMatch: string;
  /** Gdy darmowy podgląd (natal_basic) już zużyty w tej przeglądarce */
  freeBasicUsedHint: string;
  /** Przy próbie ponownego zamówienia darmowego typu */
  freeBasicAlreadyUsedError: string;
};

export const successUi: Record<
  AppLang,
  {
    pendingTitle: string;
    pdfEmailSent: string;
    pdfEmailSkipped: string;
    pdfEmailFailed: string;
    pdfEmailSkipHintNoApiKey: string;
    pdfEmailSkipHintNoFrom: string;
    generating: string;
    /** Pierwsza linia przy loaderze generowania raportu (czas oczekiwania). */
    generatingDurationHint: string;
    /** Druga linia: nie zamykać / nie odświeżać strony. */
    generatingStayOnPage: string;
    regenerate: string;
    print: string;
    tryAgain: string;
    backHome: string;
    another: string;
    saved: string;
    chartLoading: string;
    chartError: string;
    reportTitle: Record<ReportTypeId, string>;
    pdfPreparing: string;
    pdfDownload: string;
    pdfDownloadFailedAlert: string;
    noReportFound: string;
    missingSession: string;
    generateFailedGeneric: string;
    /** Gwiazdki po wyświetleniu raportu */
    rateTitle: string;
    rateAriaLabel: (stars: number) => string;
    rateThanks: string;
    rateAlreadySubmitted: string;
    rateSubmitFailed: string;
    /** Tylko po prawdziwym Checkout (`cs_*`) — potwierdzenie zakupu z Stripe */
    purchaseReceiptStripeNote: string;
    rateSaving: string;
  }
> = {
  en: {
    pendingTitle: "Your report",
    pdfEmailSent: "We sent a PDF copy of this report to your email.",
    pdfEmailSkipped:
      "PDF email delivery isn’t configured on the server — use Print / save from this page.",
    pdfEmailFailed:
      "We couldn’t email the PDF — you can still print or save the report below.",
    pdfEmailSkipHintNoApiKey:
      "Tip for the site owner: set RESEND_API_KEY on the server (e.g. Vercel → Environment Variables).",
    pdfEmailSkipHintNoFrom:
      "Tip for the site owner: set REPORT_EMAIL_FROM to a verified sender (e.g. CosmoTips <reports@yourdomain>).",
    generating: "Generating your report…",
    generatingDurationHint: "This may take up to 5 minutes ✨",
    generatingStayOnPage:
      "Please keep this tab open — don't close your browser or refresh the page.",
    regenerate: "Regenerate",
    print: "Download / Print",
    tryAgain: "Try again",
    backHome: "Back home",
    another: "Generate another report",
    saved: "View saved reports",
    chartLoading: "Computing chart…",
    chartError: "Chart unavailable",
    reportTitle: {
      natal_basic: "Cosmic Blueprint",
      personality: "Personality Portrait",
      weekly: "Weekly Energy Forecast",
      monthly: "Monthly Cosmic Forecast",
    },
    pdfPreparing: "Preparing PDF…",
    pdfDownload: "Download PDF",
    pdfDownloadFailedAlert: "Could not download PDF. Try again later.",
    noReportFound: "No report found.",
    missingSession: "Missing session id from Stripe.",
    generateFailedGeneric: "Something went wrong.",
    rateTitle: "How was this report?",
    rateAriaLabel: (n: number) => `Rate ${n} stars out of 5`,
    rateThanks: "Thank you — your feedback helps us improve.",
    rateAlreadySubmitted: "You’ve already rated this report. Thank you!",
    rateSubmitFailed: "Couldn’t save your rating. You can skip this.",
    purchaseReceiptStripeNote:
      "Purchase receipt: Stripe emails a confirmation (and billing invoice PDF when enabled) for paid checkouts — check the inbox you paid with, including spam. You can manage receipts anytime in Stripe’s emailed links.",
    rateSaving: "Saving your rating…",
  },
  pl: {
    pendingTitle: "Twój raport",
    pdfEmailSent: "Wysłaliśmy kopię raportu w PDF na Twój e-mail.",
    pdfEmailSkipped:
      "Wysyłka PDF na e-mail nie jest skonfigurowana — użyj opcji druku / zapisu ze strony.",
    pdfEmailFailed:
      "Nie udało się wysłać PDF na e-mail — możesz nadal wydrukować lub zapisać raport poniżej.",
    pdfEmailSkipHintNoApiKey:
      "Wskazówka: na serwerze (np. Vercel) ustaw zmienną RESEND_API_KEY.",
    pdfEmailSkipHintNoFrom:
      "Wskazówka: ustaw REPORT_EMAIL_FROM na zweryfikowany adres nadawcy w Resend.",
    generating: "Generuję raport…",
    generatingDurationHint: "To może potrwać do 5 minut ✨",
    generatingStayOnPage:
      "Nie zamykaj przeglądarki ani tej karty i nie odświeżaj strony — poczekaj, aż zobaczysz treść.",
    regenerate: "Wygeneruj ponownie",
    print: "Pobierz / drukuj",
    tryAgain: "Spróbuj ponownie",
    backHome: "Strona główna",
    another: "Kolejny raport",
    saved: "Zapisane raporty",
    chartLoading: "Liczenie mapy…",
    chartError: "Nie udało się narysować mapy",
    reportTitle: {
      natal_basic: "Kosmiczny Profil",
      personality: "Portret Osobowości",
      weekly: "Prognoza Energii na Tydzień",
      monthly: "Miesięczna Prognoza Kosmiczna",
    },
    pdfPreparing: "Przygotowuję PDF…",
    pdfDownload: "Pobierz PDF",
    pdfDownloadFailedAlert:
      "Nie udało się pobrać PDF. Spróbuj ponownie później.",
    noReportFound: "Nie znaleziono raportu.",
    missingSession: "Brak identyfikatora sesji Stripe.",
    generateFailedGeneric: "Coś poszło nie tak.",
    rateTitle: "Jak oceniasz ten raport?",
    rateAriaLabel: (n: number) => `Oceń na ${n} gwiazdek z 5`,
    rateThanks: "Dziękujemy — Twoja ocena pomaga nam rozwijać usługę.",
    rateAlreadySubmitted: "Ta sesja już została oceniona. Dziękujemy!",
    rateSubmitFailed:
      "Nie udało się zapisać oceny — możesz pominąć ten krok.",
    purchaseReceiptStripeNote:
      "Potwierdzenie zakupu: Stripe wyśle e-mail z podsumowaniem płatności oraz (jeśli włączone na koncie Stripe) dokument faktury z linkiem do PDF — sprawdź skrzynkę podaną przy płatności, także spam. Zarządzanie paragonami i fakturą jest dostępne z linków w mailach Stripe.",
    rateSaving: "Zapisuję ocenę…",
  },
  es: {
    pendingTitle: "Tu informe",
    pdfEmailSent: "Te hemos enviado una copia en PDF a tu correo.",
    pdfEmailSkipped:
      "El envío de PDF por correo no está configurado — usa imprimir / guardar desde esta página.",
    pdfEmailFailed:
      "No pudimos enviar el PDF por correo — aún puedes imprimir o guardar el informe abajo.",
    pdfEmailSkipHintNoApiKey:
      "Para quien administra el sitio: define RESEND_API_KEY en el servidor (p. ej. variables de entorno en Vercel).",
    pdfEmailSkipHintNoFrom:
      "Define REPORT_EMAIL_FROM con un remitente verificado en Resend.",
    generating: "Generando tu informe…",
    generatingDurationHint: "Esto puede tardar hasta 5 minutos ✨",
    generatingStayOnPage:
      "Mantén esta pestaña abierta: no cierres el navegador ni actualices la página.",
    regenerate: "Regenerar",
    print: "Descargar / imprimir",
    tryAgain: "Reintentar",
    backHome: "Inicio",
    another: "Otro informe",
    saved: "Informes guardados",
    chartLoading: "Calculando carta…",
    chartError: "No se pudo dibujar la carta",
    reportTitle: {
      natal_basic: "Perfil Cósmico",
      personality: "Retrato de Personalidad",
      weekly: "Pronóstico Energético Semanal",
      monthly: "Pronóstico Cósmico Mensual",
    },
    pdfPreparing: "Preparando PDF…",
    pdfDownload: "Descargar PDF",
    pdfDownloadFailedAlert:
      "No se pudo descargar el PDF. Inténtalo de nuevo más tarde.",
    noReportFound: "No se encontró el informe.",
    missingSession: "Falta el id de sesión de Stripe.",
    generateFailedGeneric: "Algo salió mal.",
    rateTitle: "¿Qué te pareció este informe?",
    rateAriaLabel: (n: number) =>
      `Valorar con ${n} estrellas de 5`,
    rateThanks:
      "Gracias — tu valoración nos ayuda a mejorar.",
    rateAlreadySubmitted:
      "Ya valoraste esta compra/informe. ¡Gracias!",
    rateSubmitFailed:
      "No pudimos guardar la valoración. Puedes saltar este paso.",
    purchaseReceiptStripeNote:
      "Comprobante de compra: Stripe envía por correo la confirmación y, cuando está activado en tu cuenta Stripe, una factura con enlace al PDF — revisa la bandeja del email que usaste al pagar, también spam.",
    rateSaving: "Guardando tu valoración…",
  },
};

/** Transactional copy for astrology PDF emails — HTML is built in `reportEmail.ts` with shared CosmoTips styling. */
export const reportPdfEmailCopy: Record<
  AppLang,
  { thanksLine: string; pdfDetailLine: string; pdfCalloutTitle: string; pdfCalloutBody: string }
> = {
  en: {
    thanksLine: "Thank you for your order — we appreciate you being here.",
    pdfDetailLine:
      "Your full reading is in the attached PDF. Open it on your phone or desktop; you can save or print it anytime.",
    pdfCalloutTitle: "Attachment",
    pdfCalloutBody: "Look for the PDF file in this message (same email thread).",
  },
  pl: {
    thanksLine: "Dziękujemy za zamówienie — cieszymy się, że jesteś z nami.",
    pdfDetailLine:
      "Pełna treść raportu znajduje się w załączonym pliku PDF. Otwórz go w telefonie lub na komputerze — możesz go też zapisać lub wydrukować.",
    pdfCalloutTitle: "Załącznik",
    pdfCalloutBody: "Szukaj pliku PDF w tej samej wiadomości e-mail.",
  },
  es: {
    thanksLine: "Gracias por tu pedido — nos alegra tenerte aquí.",
    pdfDetailLine:
      "La lectura completa va en el PDF adjunto. Ábrelo en el móvil o en el ordenador; puedes guardarlo o imprimirlo cuando quieras.",
    pdfCalloutTitle: "Adjunto",
    pdfCalloutBody: "Busca el archivo PDF en este mismo correo.",
  },
};
export const homeCopy: Record<AppLang, HomeCopy> = {
  en: {
    heroTitle: "Your story written before you were born.",
    heroLead: "Discover who you are and what’s coming next.",
    heroSub:
      "Enter your birth details, choose a report type, then check out securely to receive your report.",
    toolPitchParagraphs: [
      "Your birth chart reveals the emotional patterns, strengths, relationship dynamics, and life themes shaping who you are.",
      "Receive personalized AI-powered astrology insights designed to help you better understand yourself, navigate change, and align with your next chapter.",
      "Discover the blueprint written in the stars. ✨",
    ],
    tarotPitchParagraphs: [
      "Tarot helps uncover the emotional patterns, hidden dynamics, and inner tensions shaping your current situation.",
      "Whether you’re navigating a relationship, decision, transition, or uncertainty, a reading can offer clarity, perspective, and deeper self-understanding.",
      "Receive personalized AI-powered tarot insights designed to help you reconnect with your intuition. ✨",
    ],
    moduleTabs: {
      natal: "Astrology",
      tarot: "Tarot",
    },
    moduleWorkspaceLabel: "Astrology & Tarot workspace",
    tarotPanelTitle: "Tarot reading",
    tarotPanelLead:
      "Reflective spreads for transitions, relationships, and moments when you want steadier footing.",
    tarotPanelNote:
      "Choose a spread below and enter your details to generate a personalized reading.",
    dob: "Date of birth",
    dobYear: "Year",
    dobMonth: "Month",
    dobDay: "Day",
    tob: "Time of birth",
    tobHour: "Hour",
    tobMinute: "Minute",
    birthTimeUnknown: "I don’t know my birth time",
    pob: "Place of birth",
    pobPlaceholder: "e.g., Warsaw, Poland",
    email: "Email",
    emailPlaceholder: "you@example.com",
    reportSectionTitle: "Choose a report type",
    dataStepTitle: "Complete your details",
    paymentStepTitle: "Choose payment",
    paymentOnceTitle: "One-time payment",
    paymentOnceHintFreePreview: "Free Cosmic Blueprint preview — email confirmation",
    paymentOnceHintForecast: "€5 · Weekly Energy Forecast or Monthly Cosmic Forecast · Stripe",
    paymentOnceHintPersonality: "€10 · Personality Portrait · Stripe",
    paymentOnceFollowsReportPrice:
      "Pay for the report type selected above — price is shown on that card.",
    paymentMonthlySubscriptionTitle: "Monthly Pro subscription",
    paymentMonthlySubscriptionHint:
      "€12 / month · Weekly Energy Forecast by email · Personality Portrait · 6 tarot tokens renewed each month",
    paymentYearlySubscriptionTitle: "Yearly Pro subscription",
    paymentYearlySubscriptionHint:
      "€99 / year · Weekly Energy Forecast by email · Personality Portrait · 6 tarot tokens renewed each month · best value vs paying monthly",
    paymentTarotOnceHint: "€5 · tarot token pack · Stripe",
    pickPaymentError: "Choose a payment option to continue.",
    paySubmit: "Pay",
    proceedToSubscriptionPayment: "Continue to subscription checkout",
    sendSubscriptionMagicLink: "Email me a confirmation link",
    paymentFooterHint: "Secure checkout with Stripe.",
    reports: {
      natal_basic: {
        title: "Cosmic Blueprint",
        desc: "Explore the core of your birth chart and uncover the meaning behind your Sun, Moon, and Rising signs. A first glimpse into your personality, emotional world, and natural energy.",
        priceLabel: "Free · First access",
      },
      personality: {
        title: "Personality Portrait",
        desc: "A deeply personalized reading revealing your emotional patterns, strengths, relationship dynamics, hidden motivations, and life themes. Understand what drives you — and what may be holding you back.",
        priceLabel: "€10",
      },
      weekly: {
        title: "Weekly Energy Forecast",
        desc: "Discover the energies influencing your week ahead — including emotional shifts, relationship dynamics, opportunities, and moments to slow down or take action.",
        priceLabel: "€5",
      },
      monthly: {
        title: "Monthly Cosmic Forecast",
        desc: "A personalized 30-day forecast revealing the major emotional, relational, and career themes influencing your month ahead. Gain clarity on what’s shifting, growing, and asking for your attention.",
        priceLabel: "€5",
      },
    },
    submit: "Generate report",
    submitting: "Redirecting…",
    termsAcceptBefore: "I have read and accept the ",
    termsAcceptLink: "Terms of Service",
    termsAcceptAfter: ".",
    footer:
      "Astrology is for reflection and entertainment. You’re always in control of your choices.",
    footerArticlesTitle: "Articles",
    footerContactTitle: "Contact",
    footerReportsTitle: "Saved reports",
    navLogoHomeAria: "CosmoTips — home and order form",
    langLabel: "Report language",
    placeNoMatch: "No matches",
    freeBasicUsedHint:
      "The free Cosmic Blueprint can only be used once. Please choose the full report option below.",
    freeBasicAlreadyUsedError:
      "The free Cosmic Blueprint preview was already used on this device. Pick a paid report type.",
  },
  pl: {
    heroTitle: "Twoja historia została zapisana jeszcze przed Twoimi narodzinami.",
    heroLead: "Odkryj, kim jesteś i co może Cię czekać.",
    heroSub:
      "Podaj dane urodzenia, wybierz typ raportu i opłać bezpiecznie przez Stripe.",
    toolPitchParagraphs: [
      "Twój kosmogram pokazuje emocjonalne schematy, naturalne talenty, dynamikę relacji i życiowe motywy, które kształtują to, kim jesteś.",
      "Otrzymaj spersonalizowane astrologiczne analizy AI, które pomogą Ci lepiej zrozumieć siebie, odnaleźć kierunek i świadomie przechodzić przez zmiany.",
      "Odkryj mapę zapisaną w gwiazdach. ✨",
    ],
    tarotPitchParagraphs: [
      "Tarot pomaga odkryć emocjonalne schematy, ukryte napięcia i dynamiki wpływające na Twoją obecną sytuację.",
      "Niezależnie od tego, czy stoisz przed decyzją, zmianą, problemem w relacji czy momentem niepewności — interpretacja może pomóc Ci spojrzeć na wszystko z większą jasnością i zrozumieniem.",
      "Otrzymaj spersonalizowane interpretacje tarota AI stworzone po to, by pomóc Ci lepiej usłyszeć własną intuicję. ✨",
    ],
    moduleTabs: {
      natal: "Astrologia",
      tarot: "Tarot",
    },
    moduleWorkspaceLabel: "Astrologia i Tarot — narzędzia",
    tarotPanelTitle: "Tarot",
    tarotPanelLead:
      "Rozkłady na momenty przejść, relacji i wtedy, gdy potrzebujesz spokojniejszej perspektywy.",
    tarotPanelNote:
      "Wybierz rozkład i uzupełnij dane, aby wygenerować interpretację dopasowaną do Ciebie.",
    dob: "Data urodzenia",
    dobYear: "Rok",
    dobMonth: "Miesiąc",
    dobDay: "Dzień",
    tob: "Godzina urodzenia",
    tobHour: "Godzina",
    tobMinute: "Minuta",
    birthTimeUnknown: "Nie znam godziny urodzenia",
    pob: "Miejsce urodzenia",
    pobPlaceholder: "np. Warszawa, Polska",
    email: "E-mail",
    emailPlaceholder: "twoj@email.pl",
    reportSectionTitle: "Wybierz rodzaj raportu",
    dataStepTitle: "Uzupełnij swoje dane",
    paymentStepTitle: "Wybierz płatność",
    paymentOnceTitle: "Płatność jednorazowa",
    paymentOnceHintFreePreview: "Darmowy Kosmiczny Profil — potwierdzenie e-mailem",
    paymentOnceHintForecast:
      "5 EUR · Prognoza Energii na Tydzień lub Miesięczna Prognoza Kosmiczna · Stripe",
    paymentOnceHintPersonality: "10 EUR · Portret Osobowości · Stripe",
    paymentOnceFollowsReportPrice:
      "Zapłać za wybrany powyżej raport — kwota jest na karcie typu raportu.",
    paymentMonthlySubscriptionTitle: "Subskrypcja miesięczna Pro",
    paymentMonthlySubscriptionHint:
      "12 EUR / miesiąc · cotygodniowa prognoza energetyczna na e-mail · Portret Osobowości · 6 tokenów na tarota co miesiąc (odnawiane)",
    paymentYearlySubscriptionTitle: "Subskrypcja roczna Pro",
    paymentYearlySubscriptionHint:
      "99 EUR / rok · cotygodniowa prognoza energetyczna na e-mail · Portret Osobowości · 6 tokenów na tarota co miesiąc · korzystniej niż 12× plan miesięczny",
    paymentTarotOnceHint: "5 EUR · pakiet tokenów tarota · Stripe",
    pickPaymentError: "Wybierz formę płatności, aby kontynuować.",
    paySubmit: "Zapłać",
    proceedToSubscriptionPayment: "Przejdź do płatności subskrypcji",
    sendSubscriptionMagicLink: "Wyślij link potwierdzający na e-mail",
    paymentFooterHint: "Bezpieczna płatność przez Stripe.",
    reports: {
      natal_basic: {
        title: "Kosmiczny Profil",
        desc: "Poznaj podstawę swojego kosmogramu i odkryj znaczenie znaku Słońca, Księżyca oraz Ascendentu. To pierwsze spojrzenie na Twoją osobowość, emocje i naturalną energię.",
        priceLabel: "Gratis · Pierwszy dostęp",
      },
      personality: {
        title: "Portret Osobowości",
        desc: "Dogłębna, spersonalizowana analiza pokazująca Twoje schematy emocjonalne, mocne strony, dynamikę relacji, ukryte motywacje i najważniejsze życiowe motywy. Zrozum, co naprawdę Cię napędza — i co może Cię blokować.",
        priceLabel: "10 EUR",
      },
      weekly: {
        title: "Prognoza Energii na Tydzień",
        desc: "Poznaj energie wpływające na najbliższy tydzień — emocjonalne zmiany, relacje, szanse oraz momenty, w których warto działać lub zwolnić.",
        priceLabel: "5 EUR",
      },
      monthly: {
        title: "Miesięczna Prognoza Kosmiczna",
        desc: "Spersonalizowana prognoza na kolejne 30 dni pokazująca najważniejsze tematy emocjonalne, relacyjne i zawodowe nadchodzącego miesiąca. Zyskaj większą jasność wokół zmian, które właśnie rozwijają się w Twoim życiu.",
        priceLabel: "5 EUR",
      },
    },
    submit: "Generuj raport",
    submitting: "Przekierowanie…",
    termsAcceptBefore: "Akceptuję ",
    termsAcceptLink: "Terms of Service",
    termsAcceptAfter: " (regulamin).",
    footer:
      "Astrologia służy refleksji i rozrywce. Zawsze decydujesz o swoich wyborach.",
    footerArticlesTitle: "Artykuły",
    footerContactTitle: "Kontakt",
    footerReportsTitle: "Zapisane raporty",
    navLogoHomeAria: "CosmoTips — strona główna z formularzem zamówienia",
    langLabel: "Język raportu",
    placeNoMatch: "Brak dopasowań",
    freeBasicUsedHint:
      "Z Kosmicznego Profilu można skorzystać tylko raz. Wybierz poniżej opcję pełnego raportu.",
    freeBasicAlreadyUsedError:
      "Darmowy Kosmiczny Profil był już użyty na tym urządzeniu. Wybierz typ raportu płatnego.",
  },
  es: {
    heroTitle: "Tu historia escrita antes de nacer.",
    heroLead: "Descubre quién eres y qué puede estar por venir.",
    heroSub:
      "Introduce tus datos de nacimiento, elige un tipo de informe y paga con Stripe.",
    toolPitchParagraphs: [
      "Tu carta natal revela los patrones emocionales, talentos naturales, dinámicas en las relaciones y temas de vida que influyen en quién eres.",
      "Recibe interpretaciones astrológicas personalizadas con IA para comprenderte mejor, atravesar cambios con más claridad y conectar con tu próximo capítulo.",
      "Descubre el mapa escrito en las estrellas. ✨",
    ],
    tarotPitchParagraphs: [
      "El tarot ayuda a revelar patrones emocionales, tensiones internas y dinámicas ocultas que influyen en tu situación actual.",
      "Ya sea que estés atravesando una decisión, una relación, un cambio o un momento de incertidumbre, una lectura puede darte claridad, perspectiva y una comprensión más profunda de ti mismo.",
      "Recibe interpretaciones de tarot personalizadas con IA diseñadas para ayudarte a reconectar con tu intuición. ✨",
    ],
    moduleTabs: {
      natal: "Astrología",
      tarot: "Tarot",
    },
    moduleWorkspaceLabel: "Espacio de trabajo — Astrología y Tarot",
    tarotPanelTitle: "Tarot",
    tarotPanelLead:
      "Tiradas para reflexionar en transiciones, relaciones y cuando necesitas más claridad.",
    tarotPanelNote:
      "Elige una tirada y completa tus datos para generar una lectura personalizada.",
    dob: "Fecha de nacimiento",
    dobYear: "Año",
    dobMonth: "Mes",
    dobDay: "Día",
    tob: "Hora de nacimiento",
    tobHour: "Hora",
    tobMinute: "Minuto",
    birthTimeUnknown: "No sé mi hora de nacimiento",
    pob: "Lugar de nacimiento",
    pobPlaceholder: "p. ej., Madrid, España",
    email: "Correo electrónico",
    emailPlaceholder: "tu@ejemplo.com",
    reportSectionTitle: "Elige un tipo de reporte",
    dataStepTitle: "Completa tus datos",
    paymentStepTitle: "Elige el pago",
    paymentOnceTitle: "Pago único",
    paymentOnceHintFreePreview: "Perfil Cósmico gratuito — confirmación por email",
    paymentOnceHintForecast:
      "5 EUR · Pronóstico Energético Semanal o Pronóstico Cósmico Mensual · Stripe",
    paymentOnceHintPersonality: "10 EUR · Retrato de Personalidad · Stripe",
    paymentOnceFollowsReportPrice:
      "Paga el tipo de informe elegido arriba — el precio está en esa tarjeta.",
    paymentMonthlySubscriptionTitle: "Suscripción mensual Pro",
    paymentMonthlySubscriptionHint:
      "12 EUR / mes · pronóstico energético semanal por email · Retrato de Personalidad · 6 fichas de tarot al mes (renovables)",
    paymentYearlySubscriptionTitle: "Suscripción anual Pro",
    paymentYearlySubscriptionHint:
      "99 EUR / año · pronóstico energético semanal por email · Retrato de Personalidad · 6 fichas de tarot al mes (renovables) · más barato que 12 mensualidades",
    paymentTarotOnceHint: "5 EUR · paquete de fichas de tarot · Stripe",
    pickPaymentError: "Elige una opción de pago para continuar.",
    paySubmit: "Pagar",
    proceedToSubscriptionPayment: "Ir al pago de la suscripción",
    sendSubscriptionMagicLink: "Enviar enlace de confirmación por email",
    paymentFooterHint: "Pago seguro con Stripe.",
    reports: {
      natal_basic: {
        title: "Perfil Cósmico",
        desc: "Explora la base de tu carta natal y descubre el significado de tu Sol, Luna y Ascendente. Una primera mirada a tu personalidad, emociones y energía natural.",
        priceLabel: "Gratis · Primer acceso",
      },
      personality: {
        title: "Retrato de Personalidad",
        desc: "Una interpretación profundamente personalizada que revela tus patrones emocionales, fortalezas, dinámicas relacionales, motivaciones internas y temas clave de vida. Comprende qué te impulsa — y qué podría estar frenándote.",
        priceLabel: "10 EUR",
      },
      weekly: {
        title: "Pronóstico Energético Semanal",
        desc: "Descubre las energías que influirán en tu semana: cambios emocionales, relaciones, oportunidades y momentos para actuar o bajar el ritmo.",
        priceLabel: "5 EUR",
      },
      monthly: {
        title: "Pronóstico Cósmico Mensual",
        desc: "Un pronóstico personalizado para los próximos 30 días que revela los temas emocionales, relacionales y profesionales más importantes del mes. Obtén claridad sobre los cambios, oportunidades y procesos que están tomando forma en tu vida.",
        priceLabel: "5 EUR",
      },
    },
    submit: "Generar informe",
    submitting: "Redirigiendo…",
    termsAcceptBefore: "He leído y acepto los ",
    termsAcceptLink: "Términos de servicio (Terms of Service)",
    termsAcceptAfter: ".",
    footer:
      "La astrología es para reflexionar y entretener. Tú decides siempre.",
    footerArticlesTitle: "Artículos",
    footerContactTitle: "Contacto",
    footerReportsTitle: "Informes guardados",
    navLogoHomeAria: "CosmoTips — inicio con el formulario de pedido",
    langLabel: "Idioma del informe",
    placeNoMatch: "Sin coincidencias",
    freeBasicUsedHint:
      "El Perfil Cósmico gratuito solo puede usarse una vez. Elige abajo una opción de reporte completo.",
    freeBasicAlreadyUsedError:
      "La vista previa gratuita del Perfil Cósmico ya se usó en este dispositivo. Elige un tipo de reporte de pago.",
  },
};

export type CancelPageCopy = {
  badge: string;
  title: string;
  body: string;
  backHome: string;
};

export const cancelPageCopy: Record<AppLang, CancelPageCopy> = {
  en: {
    badge: "Checkout cancelled",
    title: "No worries — you weren’t charged.",
    body: "If you’d like to try again, go back to the form and generate your report when you’re ready.",
    backHome: "Back home",
  },
  pl: {
    badge: "Płatność anulowana",
    title: "Bez obaw — nie pobraliśmy opłaty.",
    body: "Możesz wrócić do formularza i wygenerować raport, gdy będziesz gotowa lub gotowy.",
    backHome: "Strona główna",
  },
  es: {
    badge: "Pago cancelado",
    title: "Tranquilidad — no se ha cobrado nada.",
    body: "Si quieres intentarlo de nuevo, vuelve al formulario y genera tu informe cuando estés lista o listo.",
    backHome: "Inicio",
  },
};

export type TermsPageCopy = {
  title: string;
  backHome: string;
  /** Markdown shown above the English Terms body (PL/ES only). */
  preambleMarkdown?: string;
};

export const termsPageCopy: Record<AppLang, TermsPageCopy> = {
  en: {
    title: "Terms of Service",
    backHome: "Back home",
  },
  pl: {
    title: "Terms of Service",
    backHome: "Strona główna",
    preambleMarkdown:
      "**Wersja językowa.** Poniżej znajduje się pełny tekst **Terms of Service** (regulamin świadczenia usług) CosmoTips w języku angielskim — wersja 1.0, obowiązuje od 1 maja 2025 r. W razie rozbieżności między tłumaczeniami pierwszeństwo ma brzmienie angielskie.",
  },
  es: {
    title: "Terms of Service",
    backHome: "Inicio",
    preambleMarkdown:
      "**Idioma.** A continuación figura el texto completo de los **Terms of Service** (términos de servicio) de CosmoTips en inglés — versión 1.0, vigente desde el 1 de mayo de 2025. En caso de discrepancia entre traducciones, prevalecerá la versión en inglés.",
  },
};
