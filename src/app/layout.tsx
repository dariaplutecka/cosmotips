import type { Metadata } from "next";
import { headers } from "next/headers";
import { Lato, Montserrat } from "next/font/google";
import type { AppLang } from "@/lib/reportSchema";
import { seoMeta } from "@/lib/uiCopy";
import "./globals.css";

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

function metadataForPath(lang: AppLang, pathname: string): Metadata {
  const meta = seoMeta[lang];
  if (pathname === "/articles") {
    return {
      title: meta.articlesTitle,
      description: meta.articlesDescription,
    };
  }
  if (pathname === "/success") {
    return {
      title: meta.successTitle,
      description: meta.homeDescription,
    };
  }
  return {
    title: meta.homeTitle,
    description: meta.homeDescription,
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
        {children}
      </body>
    </html>
  );
}
