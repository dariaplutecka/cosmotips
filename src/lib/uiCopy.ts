import type { AppLang } from "@/lib/reportSchema";

export type ReportTypeId = "personality" | "weekly" | "monthly";

type HomeCopy = {
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
    { title: string; desc: string }
  >;
  submit: string;
  submitting: string;
  /** Label around the terms link: `{before}{link}{after}` */
  termsAcceptBefore: string;
  termsAcceptLink: string;
  termsAcceptAfter: string;
  priceLine: string;
  footer: string;
  langLabel: string;
  placeNoMatch: string;
};

export const successUi: Record<
  AppLang,
  {
    pendingTitle: string;
    paymentOk: string;
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
    paymentOk: "Payment confirmed",
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
      personality: "Personality portrait",
      weekly: "🗓️ Weekly forecast",
      monthly: "Monthly forecast",
    },
  },
  pl: {
    pendingTitle: "Twój raport",
    paymentOk: "Płatność potwierdzona",
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
      personality: "Opis osobowościowy",
      weekly: "🗓️ Prognoza tygodniowa",
      monthly: "Prognoza miesięczna",
    },
  },
  es: {
    pendingTitle: "Tu informe",
    paymentOk: "Pago confirmado",
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
      personality: "Retrato de personalidad",
      weekly: "🗓️ Pronóstico semanal",
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
      personality: {
        title: "Personality portrait",
        desc: "A deep, personalized snapshot of your astrological blueprint.",
      },
      weekly: {
        title: "🗓️ Weekly forecast",
        desc: "Seven days starting from the day you generate the report — not Mon–Sun by default.",
      },
      monthly: {
        title: "Monthly forecast",
        desc: "Thirty consecutive days from the day you generate — rolling window, not calendar month.",
      },
    },
    submit: "Generate report",
    submitting: "Redirecting…",
    termsAcceptBefore: "I have read and accept the ",
    termsAcceptLink: "Terms of Service",
    termsAcceptAfter: ".",
    priceLine:
      "Price: €5 per report · Delivered instantly · Secure Stripe Checkout",
    footer:
      "Astrology is for reflection and entertainment. You’re always in control of your choices.",
    langLabel: "Report language",
    placeNoMatch: "No matches",
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
      personality: {
        title: "Opis osobowościowy",
        desc: "Głęboki, spersonalizowany portret Twojej mapy urodzeniowej.",
      },
      weekly: {
        title: "🗓️ Prognoza tygodniowa",
        desc: "7 kolejnych dni od wygenerowania raportu — bez sztywnego pon–niedz.",
      },
      monthly: {
        title: "Prognoza miesięczna",
        desc: "30 kolejnych dni od wygenerowania — okno kroczące, nie kalendarzowy 1.–ostatni.",
      },
    },
    submit: "Generuj raport",
    submitting: "Przekierowanie…",
    termsAcceptBefore: "Akceptuję ",
    termsAcceptLink: "regulamin",
    termsAcceptAfter: ".",
    priceLine:
      "Cena: 5 USD za raport · Dostawa od razu · Bezpieczna płatność Stripe",
    footer:
      "Astrologia służy refleksji i rozrywce. Zawsze decydujesz o swoich wyborach.",
    langLabel: "Język raportu",
    placeNoMatch: "Brak dopasowań",
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
      personality: {
        title: "Retrato de personalidad",
        desc: "Un retrato profundo y personalizado de tu carta natal.",
      },
      weekly: {
        title: "🗓️ Pronóstico semanal",
        desc: "7 días seguidos desde que generas el informe — no necesariamente lun–dom.",
      },
      monthly: {
        title: "Pronóstico mensual",
        desc: "30 días seguidos desde la generación; ventana móvil, no mes de calendario.",
      },
    },
    submit: "Generar informe",
    submitting: "Redirigiendo…",
    termsAcceptBefore: "He leído y acepto los ",
    termsAcceptLink: "términos y condiciones",
    termsAcceptAfter: ".",
    priceLine:
      "Precio: 5 EUR por informe · Entrega al instante · Pago seguro con Stripe",
    footer:
      "La astrología es para reflexionar y entretener. Tú decides siempre.",
    langLabel: "Idioma del informe",
    placeNoMatch: "Sin coincidencias",
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
