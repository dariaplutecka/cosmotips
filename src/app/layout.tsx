import type { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { Lato, Montserrat } from "next/font/google";
import type { AppLang } from "@/lib/reportSchema";
import { buildAlternates, getSiteUrl } from "@/lib/seoUtils";
import {
  cancelPageCopy,
  contactPageCopy,
  savedReportsPageCopy,
  seoMeta,
  termsPageCopy,
} from "@/lib/uiCopy";
import "./globals.css";

const GTM_ID = "GTM-PQLLTGHC";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

function parseAppLang(value: string | null): AppLang {
  if (value === "pl" || value === "es" || value === "en") return value;
  return "en";
}

const ogLocale: Record<AppLang, string> = {
  en: "en_US",
  pl: "pl_PL",
  es: "es_ES",
};

function shareAndIndexMetadata(
  title: string,
  description: string,
  path: string,
  lang: AppLang,
): Pick<Metadata, "openGraph" | "twitter" | "robots"> {
  const base = getSiteUrl();
  const url = `${base}${path}`;
  return {
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "CosmoTips",
      locale: ogLocale[lang],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function metadataForPath(lang: AppLang, pathnameRaw: string): Metadata {
  const meta = seoMeta[lang];
  const pathname =
    pathnameRaw === "" ? "/" : pathnameRaw.startsWith("/") ? pathnameRaw : `/${pathnameRaw}`;

  if (pathname === "/success") {
    return {
      title: meta.successTitle,
      description: meta.homeDescription,
      robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    };
  }

  if (pathname === "/cancel") {
    const cc = cancelPageCopy[lang];
    return {
      title: `${cc.title} — CosmoTips`,
      description: cc.body,
      alternates: buildAlternates("/cancel"),
      robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    };
  }

  if (pathname === "/reports") {
    const sr = savedReportsPageCopy[lang];
    return {
      title: `${sr.pageTitle} — CosmoTips`,
      description: sr.subtitle,
      alternates: buildAlternates("/reports"),
      robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    };
  }

  if (pathname === "/contact") {
    const c = contactPageCopy[lang];
    const title = `${c.pageTitle} — CosmoTips`;
    return {
      title,
      description: c.lead,
      alternates: buildAlternates("/contact"),
      ...shareAndIndexMetadata(title, c.lead, "/contact", lang),
    };
  }

  if (pathname === "/terms") {
    const tt = termsPageCopy[lang];
    const title = `${tt.title} — CosmoTips`;
    const description =
      "CosmoTips Terms of Service — personalised reports, Stripe payments, subscriptions, and consumer rights.";
    return {
      title,
      description,
      alternates: buildAlternates("/terms"),
      ...shareAndIndexMetadata(title, description, "/terms", lang),
    };
  }

  if (pathname === "/articles") {
    return {
      title: meta.articlesTitle,
      description: meta.articlesDescription,
      alternates: buildAlternates("/articles"),
      ...shareAndIndexMetadata(
        meta.articlesTitle,
        meta.articlesDescription,
        "/articles",
        lang,
      ),
    };
  }

  return {
    title: meta.homeTitle,
    description: meta.homeDescription,
    alternates: buildAlternates("/"),
    ...shareAndIndexMetadata(meta.homeTitle, meta.homeDescription, "/", lang),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const lang = parseAppLang(h.get("x-cosmotips-lang"));
  const pathname = h.get("x-cosmotips-pathname") ?? "/";
  return metadataForPath(lang, pathname);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const lang = parseAppLang(h.get("x-cosmotips-lang"));

  return (
    <html lang={lang}>
      <body className={`${lato.variable} ${montserrat.variable} antialiased`}>
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'? '&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  );
}
