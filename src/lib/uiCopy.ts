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
  /** Encouraging copy about the natal chart; shown between hero and form */
  toolPitchParagraphs: string[];
  dob: string;
  dobYear: string;
  dobMonth: string;
  dobDay: string;
  tob: string;
  tobHour: string;
  tobMinute: string;
  pob: string;
  pobPlaceholder: string;
  email: string;
  emailPlaceholder: string;
  reportSectionTitle: string;
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
    regenerate: string;
    print: string;
    tryAgain: string;
    backHome: string;
    another: string;
    saved: string;
    chartLoading: string;
    chartError: string;
    reportTitle: Record<ReportTypeId, string>;
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
  },
};

/** Transactional email when PDF is attached (server-side; Resend). */
export const reportEmailCopy: Record<
  AppLang,
  { subject: string; htmlBody: string; textBody: string }
> = {
  en: {
    subject: "Your AstroApka horoscope report (PDF)",
    htmlBody:
      "<p>Thank you for your purchase.</p><p>Your personalized report is attached as a PDF.</p><p>— AstroApka</p>",
    textBody:
      "Thank you for your purchase.\n\nYour personalized report is attached as a PDF.\n\n— AstroApka",
  },
  pl: {
    subject: "Twój raport AstroApka (PDF)",
    htmlBody:
      "<p>Dziękujemy za zakup.</p><p>Twój spersonalizowany raport znajdziesz w załączniku PDF.</p><p>— AstroApka</p>",
    textBody:
      "Dziękujemy za zakup.\n\nTwój spersonalizowany raport znajdziesz w załączniku PDF.\n\n— AstroApka",
  },
  es: {
    subject: "Tu informe AstroApka (PDF)",
    htmlBody:
      "<p>Gracias por tu compra.</p><p>Tu informe personalizado va adjunto en PDF.</p><p>— AstroApka</p>",
    textBody:
      "Gracias por tu compra.\n\nTu informe personalizado va adjunto en PDF.\n\n— AstroApka",
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
    dob: "Date of birth",
    dobYear: "Year",
    dobMonth: "Month",
    dobDay: "Day",
    tob: "Time of birth",
    tobHour: "Hour",
    tobMinute: "Minute",
    pob: "Place of birth",
    pobPlaceholder: "e.g., Warsaw, Poland",
    email: "Email",
    emailPlaceholder: "you@example.com",
    reportSectionTitle: "Choose a report type",
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
    priceLine: "Full reports: €5 each · Instant delivery · Stripe",
    footer:
      "Astrology is for reflection and entertainment. You’re always in control of your choices.",
    footerArticlesTitle: "Articles",
    footerContactTitle: "Contact",
    navLogoHomeAria: "CosmoTips — home and order form",
    langLabel: "Report language",
    placeNoMatch: "No matches",
    freeBasicUsedHint:
      "The free report can only be used once. Please choose the full report option below.",
    freeBasicAlreadyUsedError:
      "The free basic natal preview was already used on this device. Pick a paid report type.",
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
    dob: "Data urodzenia",
    dobYear: "Rok",
    dobMonth: "Miesiąc",
    dobDay: "Dzień",
    tob: "Godzina urodzenia",
    tobHour: "Godzina",
    tobMinute: "Minuta",
    pob: "Miejsce urodzenia",
    pobPlaceholder: "np. Warszawa, Polska",
    email: "E-mail",
    emailPlaceholder: "twoj@email.pl",
    reportSectionTitle: "Wybierz typ raportu",
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
    termsAcceptLink: "regulamin",
    termsAcceptAfter: ".",
    priceLine: "Pełne raporty: 5 EUR · Od razu · Stripe",
    footer:
      "Astrologia służy refleksji i rozrywce. Zawsze decydujesz o swoich wyborach.",
    footerArticlesTitle: "Artykuły",
    footerContactTitle: "Kontakt",
    navLogoHomeAria: "CosmoTips — strona główna z formularzem zamówienia",
    langLabel: "Język raportu",
    placeNoMatch: "Brak dopasowań",
    freeBasicUsedHint:
      "Z darmowego raportu można skorzystać tylko raz. Wybierz poniżej opcję pełnego raportu.",
    freeBasicAlreadyUsedError:
      "Darmowy podgląd mapy był już użyty na tym urządzeniu. Wybierz typ raportu płatnego.",
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
    dob: "Fecha de nacimiento",
    dobYear: "Año",
    dobMonth: "Mes",
    dobDay: "Día",
    tob: "Hora de nacimiento",
    tobHour: "Hora",
    tobMinute: "Minuto",
    pob: "Lugar de nacimiento",
    pobPlaceholder: "p. ej., Madrid, España",
    email: "Correo electrónico",
    emailPlaceholder: "tu@ejemplo.com",
    reportSectionTitle: "Elige el tipo de informe",
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
    termsAcceptLink: "términos y condiciones",
    termsAcceptAfter: ".",
    priceLine: "Informes completos: 5 EUR · Al instante · Stripe",
    footer:
      "La astrología es para reflexionar y entretener. Tú decides siempre.",
    footerArticlesTitle: "Artículos",
    footerContactTitle: "Contacto",
    navLogoHomeAria: "CosmoTips — inicio con el formulario de pedido",
    langLabel: "Idioma del informe",
    placeNoMatch: "Sin coincidencias",
    freeBasicUsedHint:
      "El informe gratuito solo puede usarse una vez. Elige abajo la opción de informe completo.",
    freeBasicAlreadyUsedError:
      "La vista básica gratuita ya se usó en este dispositivo. Elige un tipo de informe de pago.",
  },
};

export const termsPageCopy: Record<
  AppLang,
  { title: string; placeholderBody: string; backHome: string }
> = {
  en: {
    title: "Terms of Service",
    placeholderBody:
      "This is a placeholder. The full terms of service will be published here soon.",
    backHome: "Back home",
  },
  pl: {
    title: "Regulamin",
    placeholderBody:
      "To jest miejsce na treść regulaminu. Pełny tekst zostanie tu dodany wkrótce.",
    backHome: "Strona główna",
  },
  es: {
    title: "Términos y condiciones",
    placeholderBody:
      "Este es un texto provisional. Los términos completos se publicarán aquí próximamente.",
    backHome: "Inicio",
  },
};
