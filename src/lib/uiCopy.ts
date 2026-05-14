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
      "Get your personalized astrology report in minutes. Enter your birth data and receive an AI-generated horoscope report by email.",
    articlesTitle: "Astrology Articles — CosmoTips",
    articlesDescription:
      "Read our astrology articles and learn more about your birth chart.",
    tarotTitle: "Tarot Reading — CosmoTips",
    tarotDescription:
      "Choose a tarot spread and receive an intuitive AI-assisted reading for love, career, or health.",
    successTitle: "Your Report is Ready — CosmoTips",
  },
  pl: {
    homeTitle: "CosmoTips — Spersonalizowane Raporty Astrologiczne AI",
    homeDescription:
      "Otrzymaj spersonalizowany raport astrologiczny w kilka minut. Podaj dane urodzenia i odbierz horoskop na maila.",
    articlesTitle: "Artykuły Astrologiczne — CosmoTips",
    articlesDescription:
      "Czytaj nasze artykuły astrologiczne i dowiedz się więcej o swoim horoskopie.",
    tarotTitle: "Rozkład Tarota — CosmoTips",
    tarotDescription:
      "Wybierz rozkład tarota i otrzymaj intuicyjną interpretację AI dotyczącą miłości, kariery lub zdrowia.",
    successTitle: "Twój Raport Jest Gotowy — CosmoTips",
  },
  es: {
    homeTitle: "CosmoTips — Informes Astrológicos Personalizados con IA",
    homeDescription:
      "Obtén tu informe astrológico personalizado en minutos. Introduce tus datos de nacimiento y recibe tu horóscopo por email.",
    articlesTitle: "Artículos de Astrología — CosmoTips",
    articlesDescription:
      "Lee nuestros artículos de astrología y aprende más sobre tu carta natal.",
    tarotTitle: "Lectura de Tarot — CosmoTips",
    tarotDescription:
      "Elige una tirada de tarot y recibe una interpretación intuitiva con IA sobre amor, carrera o salud.",
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
    dailyCardDesc: "One guiding card for today",
    dailyCardBadge: "Free",
    dailyCardCost: "Free once a day",
    threeCard: "Three-Card Spread",
    threeCardDesc: "Past · Present · Future",
    celticCross: "Celtic Cross",
    celticCrossDesc: "Deep 10-card reading on a topic",
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
    chooseSpread: "Wybierz typ rozkładu",
    checkoutEmail: "E-mail do zakupu tokena",
    name: "Imię",
    namePlaceholder: "Twoje imię",
    birthDate: "Data urodzenia",
    dailyCard: "Karta dnia",
    dailyCardDesc: "Jedna karta przewodnia na dzisiaj",
    dailyCardBadge: "Darmowe",
    dailyCardCost: "Za darmo raz dziennie",
    threeCard: "Rozkład 3 Kart",
    threeCardDesc: "Przeszłość · Teraźniejszość · Przyszłość",
    celticCross: "Krzyż Celtycki",
    celticCrossDesc: "Głęboki rozkład 10 kart na wybrany temat",
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
    chooseSpread: "Elige el tipo de tirada",
    checkoutEmail: "Correo para comprar la ficha",
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    birthDate: "Fecha de nacimiento",
    dailyCard: "Carta del Día",
    dailyCardDesc: "Una carta guía para hoy",
    dailyCardBadge: "Gratis",
    dailyCardCost: "Gratis una vez al día",
    threeCard: "Tirada de 3 Cartas",
    threeCardDesc: "Pasado · Presente · Futuro",
    celticCross: "Cruz Celta",
    celticCrossDesc: "Tirada profunda de 10 cartas sobre un tema",
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
    articleOpen: "Read article",
    articleCloseAria: "Close article",
    articles: [
      natalHistoryArticleEn,
      emptyArticleSlot,
      emptyArticleSlot,
    ],
  },
  pl: {
    pageTitle: "Artykuły",
    backHome: "Strona główna",
    articleOpen: "Czytaj artykuł",
    articleCloseAria: "Zamknij artykuł",
    articles: [
      natalHistoryArticlePl,
      emptyArticleSlot,
      emptyArticleSlot,
    ],
  },
  es: {
    pageTitle: "Artículos",
    backHome: "Inicio",
    articleOpen: "Leer artículo",
    articleCloseAria: "Cerrar artículo",
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
  /** Encouraging copy about the currently selected module; shown below the hero. */
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
  reports: Record<
    ReportTypeId,
    { title: string; desc: string; freeBadge?: string }
  >;
  submit: string;
  submitting: string;
  /** Label around the terms link: `{before}{link}{after}` */
  termsAcceptBefore: string;
  termsAcceptLink: string;
  termsAcceptAfter: string;
  priceLine: string;
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
  /** Overlay po wysłaniu magic linka przed darmowym raportem natalnym */
  freeNatalInboxModalTitle: string;
  /** Tekst modala; zamień znakowy placeholder `{email}` na adres z formularza. */
  freeNatalInboxModalBodyTemplate: string;
  freeNatalInboxModalClose: string;
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
    regenerate: "Regenerate",
    print: "Download / Print",
    tryAgain: "Try again",
    backHome: "Back home",
    another: "Generate another report",
    saved: "View saved reports",
    chartLoading: "Computing chart…",
    chartError: "Chart unavailable",
    reportTitle: {
      natal_basic: "Basic natal chart",
      personality: "Personality portrait",
      weekly: "📅 Weekly forecast",
      monthly: "Monthly forecast",
    },
    pdfPreparing: "Preparing PDF…",
    pdfDownload: "Download PDF",
    pdfDownloadFailedAlert: "Could not download PDF. Try again later.",
    noReportFound: "No report found.",
    missingSession: "Missing session id from Stripe.",
    generateFailedGeneric: "Something went wrong.",
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
    regenerate: "Wygeneruj ponownie",
    print: "Pobierz / drukuj",
    tryAgain: "Spróbuj ponownie",
    backHome: "Strona główna",
    another: "Kolejny raport",
    saved: "Zapisane raporty",
    chartLoading: "Liczenie mapy…",
    chartError: "Nie udało się narysować mapy",
    reportTitle: {
      natal_basic: "Podstawowy wykres natalny",
      personality: "Opis osobowościowy",
      weekly: "📅 Prognoza tygodniowa",
      monthly: "Prognoza miesięczna",
    },
    pdfPreparing: "Przygotowuję PDF…",
    pdfDownload: "Pobierz PDF",
    pdfDownloadFailedAlert:
      "Nie udało się pobrać PDF. Spróbuj ponownie później.",
    noReportFound: "Nie znaleziono raportu.",
    missingSession: "Brak identyfikatora sesji Stripe.",
    generateFailedGeneric: "Coś poszło nie tak.",
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
    regenerate: "Regenerar",
    print: "Descargar / imprimir",
    tryAgain: "Reintentar",
    backHome: "Inicio",
    another: "Otro informe",
    saved: "Informes guardados",
    chartLoading: "Calculando carta…",
    chartError: "No se pudo dibujar la carta",
    reportTitle: {
      natal_basic: "Carta natal básica",
      personality: "Retrato de personalidad",
      weekly: "📅 Pronóstico semanal",
      monthly: "Pronóstico mensual",
    },
    pdfPreparing: "Preparando PDF…",
    pdfDownload: "Descargar PDF",
    pdfDownloadFailedAlert:
      "No se pudo descargar el PDF. Inténtalo de nuevo más tarde.",
    noReportFound: "No se encontró el informe.",
    missingSession: "Falta el id de sesión de Stripe.",
    generateFailedGeneric: "Algo salió mal.",
  },
};

/** Transactional email when PDF is attached (server-side; Resend). */
export const reportEmailCopy: Record<
  AppLang,
  { subject: string; htmlBody: string; textBody: string }
> = {
  en: {
    subject: "CosmoTips Report",
    htmlBody:
      "<p>Thank you for your purchase.</p><p>Your personalized report is attached as a PDF.</p><p>— CosmoTips</p>",
    textBody:
      "Thank you for your purchase.\n\nYour personalized report is attached as a PDF.\n\n— CosmoTips",
  },
  pl: {
    subject: "CosmoTips Report",
    htmlBody:
      "<p>Dziękujemy za zakup.</p><p>Twój spersonalizowany raport znajdziesz w załączniku PDF.</p><p>— CosmoTips</p>",
    textBody:
      "Dziękujemy za zakup.\n\nTwój spersonalizowany raport znajdziesz w załączniku PDF.\n\n— CosmoTips",
  },
  es: {
    subject: "CosmoTips Report",
    htmlBody:
      "<p>Gracias por tu compra.</p><p>Tu informe personalizado va adjunto en PDF.</p><p>— CosmoTips</p>",
    textBody:
      "Gracias por tu compra.\n\nTu informe personalizado va adjunto en PDF.\n\n— CosmoTips",
  },
};

export const homeCopy: Record<AppLang, HomeCopy> = {
  en: {
    heroTitle: "Your story written before you were born.",
    heroLead: "Discover who you are and what’s coming next.",
    heroSub:
      "Enter your birth details, choose a report type, then check out securely to receive your report.",
    toolPitchParagraphs: [
      "A natal chart is a precise map of planetary positions at the exact moment of your birth, based on astronomical data. Its analysis helps identify your natural tendencies, behavioral patterns, and potential life directions.",
      "Based on this, you can receive both an in-depth personality profile and forecasts highlighting the trends and influences that may unfold in your future.",
      "Generate your report and discover what your unique cosmic blueprint reveals. ✨",
    ],
    tarotPitchParagraphs: [
      "Tarot works through symbols, archetypes, and intuitive reflection. A spread can help you name what is already moving beneath the surface of a question.",
      "Use it when you need a fresh perspective on a decision, relationship, emotional pattern, or moment of transition.",
      "Soon you’ll be able to generate a personalized tarot reading here. ✨",
    ],
    moduleTabs: {
      natal: "Personal birth horoscope",
      tarot: "Tarot reading",
    },
    moduleWorkspaceLabel: "Horoscope and tarot tools",
    tarotPanelTitle: "Tarot reading",
    tarotPanelLead:
      "A new CosmoTips module is coming here: an intuitive tarot spread for questions, decisions, and inner guidance.",
    tarotPanelNote:
      "For now, choose the birth horoscope tab to generate your astrological report.",
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
    reports: {
      natal_basic: {
        title: "Basic natal chart",
        desc: "Discover your natal chart and what your Sun, Moon, and Ascendant mean. Your first access is completely free.",
        freeBadge: "Free",
      },
      personality: {
        title: "Personality portrait",
        desc: "An in-depth, personalized reading of your birth chart — who you are, your talents, and what drives you.",
      },
      weekly: {
        title: "📅 Weekly forecast",
        desc: "A forecast from today for the next 7 days — highlights key influences and what matters most in the near term.",
      },
      monthly: {
        title: "Monthly forecast",
        desc: "A forecast from today for the next 30 days — main trends and key moments in the period ahead.",
      },
    },
    submit: "Generate report",
    submitting: "Redirecting…",
    termsAcceptBefore: "I have read and accept the ",
    termsAcceptLink: "Terms of Service",
    termsAcceptAfter: ".",
    priceLine: "Reports: 1 token = €5 · Instant delivery · Stripe",
    footer:
      "Astrology is for reflection and entertainment. You’re always in control of your choices.",
    footerArticlesTitle: "Articles",
    footerContactTitle: "Contact",
    footerReportsTitle: "Saved reports",
    navLogoHomeAria: "CosmoTips — home and order form",
    langLabel: "Report language",
    placeNoMatch: "No matches",
    freeBasicUsedHint:
      "The free report can only be used once. Please choose the full report option below.",
    freeBasicAlreadyUsedError:
      "The free basic natal preview was already used on this device. Pick a paid report type.",
    freeNatalInboxModalTitle: "Check your inbox!",
    freeNatalInboxModalBodyTemplate:
      "We sent a link to {email}. Click it to view your report.",
    freeNatalInboxModalClose: "Got it",
  },
  pl: {
    heroTitle: "Twoja historia została zapisana jeszcze przed Twoimi narodzinami.",
    heroLead: "Odkryj, kim jesteś i co może Cię czekać.",
    heroSub:
      "Podaj dane urodzenia, wybierz typ raportu i opłać bezpiecznie przez Stripe.",
    toolPitchParagraphs: [
      "Kosmogram urodzeniowy to precyzyjny zapis układu planet w chwili Twoich narodzin, oparty na danych astronomicznych. Jego analiza pozwala uchwycić Twoje predyspozycje, schematy działania oraz potencjalne kierunki rozwoju.",
      "Na tej podstawie można stworzyć zarówno pogłębiony opis osobowości, jak i prognozy wskazujące, jakie tendencje mogą pojawiać się w Twoim życiu w przyszłości.",
      "Wygeneruj swój raport i odkryj, co wynika z Twojego indywidualnego układu gwiazd. ✨",
    ],
    tarotPitchParagraphs: [
      "Tarot działa językiem symboli, archetypów i intuicyjnej refleksji. Rozkład może pomóc nazwać to, co już porusza się pod powierzchnią pytania.",
      "Sięgnij po niego, gdy potrzebujesz świeżego spojrzenia na decyzję, relację, emocjonalny wzorzec albo moment przejścia.",
      "Wkrótce wygenerujesz tutaj spersonalizowany rozkład tarota. ✨",
    ],
    moduleTabs: {
      natal: "Indywidualny horoskop urodzeniowy",
      tarot: "Rozkład tarota",
    },
    moduleWorkspaceLabel: "Narzędzia horoskopu i tarota",
    tarotPanelTitle: "Rozkład tarota",
    tarotPanelLead:
      "Tutaj pojawi się nowy moduł CosmoTips: intuicyjny rozkład tarota do pytań, decyzji i pracy z tym, co dzieje się wewnętrznie.",
    tarotPanelNote:
      "Na razie wybierz zakładkę horoskopu urodzeniowego, aby wygenerować raport astrologiczny.",
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
    reportSectionTitle: "Wybierz typ raportu",
    dataStepTitle: "Uzupełnij swoje dane",
    reports: {
      natal_basic: {
        title: "Podstawowy wykres natalny",
        desc: "Odkryj swój wykres natalny i znaczenie Słońca, Księżyca oraz Ascendentu. Pierwszy dostęp całkowicie za darmo.",
        freeBadge: "Darmowe",
      },
      personality: {
        title: "Opis osobowościowy",
        desc: "Pogłębiony, spersonalizowany opis Twojej mapy urodzeniowej — pokazuje, jaka jesteś, jakie masz talenty i co Cię napędza.",
      },
      weekly: {
        title: "📅 Prognoza tygodniowa",
        desc: "Prognoza od dzisiaj na 7 dni — wskazuje najważniejsze wpływy i wydarzenia w najbliższym czasie.",
      },
      monthly: {
        title: "Prognoza miesięczna",
        desc: "Prognoza od dzisiaj na kolejne 30 dni — pokazuje główne trendy i kluczowe momenty nadchodzącego okresu.",
      },
    },
    submit: "Generuj raport",
    submitting: "Przekierowanie…",
    termsAcceptBefore: "Akceptuję ",
    termsAcceptLink: "Terms of Service",
    termsAcceptAfter: " (regulamin).",
    priceLine: "Raporty: 1 token = 5 EUR · Od razu · Stripe",
    footer:
      "Astrologia służy refleksji i rozrywce. Zawsze decydujesz o swoich wyborach.",
    footerArticlesTitle: "Artykuły",
    footerContactTitle: "Kontakt",
    footerReportsTitle: "Zapisane raporty",
    navLogoHomeAria: "CosmoTips — strona główna z formularzem zamówienia",
    langLabel: "Język raportu",
    placeNoMatch: "Brak dopasowań",
    freeBasicUsedHint:
      "Z darmowego raportu można skorzystać tylko raz. Wybierz poniżej opcję pełnego raportu.",
    freeBasicAlreadyUsedError:
      "Darmowy podgląd mapy był już użyty na tym urządzeniu. Wybierz typ raportu płatnego.",
    freeNatalInboxModalTitle: "Sprawdź swoją skrzynkę!",
    freeNatalInboxModalBodyTemplate:
      "Wysłaliśmy link na {email}. Kliknij go, aby zobaczyć swój raport.",
    freeNatalInboxModalClose: "Rozumiem",
  },
  es: {
    heroTitle: "Tu historia escrita antes de nacer.",
    heroLead: "Descubre quién eres y qué puede estar por venir.",
    heroSub:
      "Introduce tus datos de nacimiento, elige un tipo de informe y paga con Stripe.",
    toolPitchParagraphs: [
      "La carta natal es un registro preciso de la posición de los planetas en el momento exacto de tu nacimiento, basado en datos astronómicos. Su análisis permite identificar tus tendencias naturales, patrones de comportamiento y posibles direcciones de desarrollo.",
      "A partir de ello, se puede crear tanto una descripción profunda de tu personalidad como predicciones sobre las tendencias que pueden manifestarse en tu futuro.",
      "Genera tu informe y descubre qué revela tu mapa cósmico único. ✨",
    ],
    tarotPitchParagraphs: [
      "El tarot habla a través de símbolos, arquetipos y reflexión intuitiva. Una tirada puede ayudarte a nombrar lo que ya se mueve bajo la superficie de una pregunta.",
      "Úsalo cuando necesites una perspectiva nueva sobre una decisión, una relación, un patrón emocional o un momento de transición.",
      "Pronto podrás generar aquí una lectura de tarot personalizada. ✨",
    ],
    moduleTabs: {
      natal: "Horóscopo natal personalizado",
      tarot: "Lectura de tarot",
    },
    moduleWorkspaceLabel: "Herramientas de carta natal y tarot",
    tarotPanelTitle: "Lectura de tarot",
    tarotPanelLead:
      "Aquí aparecerá un nuevo módulo de CosmoTips: una tirada intuitiva de tarot para preguntas, decisiones y orientación interior.",
    tarotPanelNote:
      "Por ahora, elige la pestaña del horóscopo natal para generar tu informe astrológico.",
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
    reportSectionTitle: "Elige el tipo de informe",
    dataStepTitle: "Completa tus datos",
    reports: {
      natal_basic: {
        title: "Carta natal básica",
        desc: "Descubre tu carta natal y el significado del Sol, la Luna y el Ascendente. El primer acceso es totalmente gratis.",
        freeBadge: "Gratis",
      },
      personality: {
        title: "Retrato de personalidad",
        desc: "Una lectura profunda y personalizada de tu carta natal: quién eres, tus talentos y qué te impulsa.",
      },
      weekly: {
        title: "📅 Pronóstico semanal",
        desc: "Pronóstico desde hoy para los próximos 7 días: destaca las influencias clave y lo más importante a corto plazo.",
      },
      monthly: {
        title: "Pronóstico mensual",
        desc: "Pronóstico desde hoy para los próximos 30 días: tendencias principales y momentos clave del período que viene.",
      },
    },
    submit: "Generar informe",
    submitting: "Redirigiendo…",
    termsAcceptBefore: "He leído y acepto los ",
    termsAcceptLink: "Términos de servicio (Terms of Service)",
    termsAcceptAfter: ".",
    priceLine: "Informes: 1 ficha = 5 EUR · Al instante · Stripe",
    footer:
      "La astrología es para reflexionar y entretener. Tú decides siempre.",
    footerArticlesTitle: "Artículos",
    footerContactTitle: "Contacto",
    footerReportsTitle: "Informes guardados",
    navLogoHomeAria: "CosmoTips — inicio con el formulario de pedido",
    langLabel: "Idioma del informe",
    placeNoMatch: "Sin coincidencias",
    freeBasicUsedHint:
      "El informe gratuito solo puede usarse una vez. Elige abajo la opción de informe completo.",
    freeBasicAlreadyUsedError:
      "La vista básica gratuita ya se usó en este dispositivo. Elige un tipo de informe de pago.",
    freeNatalInboxModalTitle: "¡Revisa tu correo!",
    freeNatalInboxModalBodyTemplate:
      "Te enviamos un enlace a {email}. Haz clic para ver tu informe.",
    freeNatalInboxModalClose: "Entendido",
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
