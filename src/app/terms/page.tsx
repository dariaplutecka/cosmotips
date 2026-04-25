"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { AppLang } from "@/lib/reportSchema";
import { CosmotipsTopBar } from "@/components/CosmotipsTopBar";
import { COSMOTIPS_TERMS_OF_SERVICE_EN } from "@/content/cosmotipsTermsOfServiceEn";
import { homeCopy, termsPageCopy } from "@/lib/uiCopy";

/** Page `<h1>` is localized; strip duplicate “# TERMS OF SERVICE” from the doc export. */
function stripDuplicateDocH1(md: string): string {
  if (md.startsWith("# TERMS OF SERVICE")) {
    return md.replace(/^#\s+TERMS OF SERVICE\s*\n+/, "");
  }
  return md;
}

function termsMarkdownBody(lang: AppLang): string {
  const core = stripDuplicateDocH1(COSMOTIPS_TERMS_OF_SERVICE_EN);
  const pre = termsPageCopy[lang].preambleMarkdown;
  if (pre) {
    return `${pre}\n\n---\n\n${core}`;
  }
  return core;
}

function TermsContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("lang");
  const lang: AppLang =
    raw === "pl" || raw === "es" ? raw : "en";
  const c = termsPageCopy[lang];
  const hc = homeCopy[lang];
  const bodyMd = useMemo(() => termsMarkdownBody(lang), [lang]);

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <CosmotipsTopBar
          lang={lang}
          langLabel={hc.langLabel}
          logoAriaLabel={hc.navLogoHomeAria}
        />
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:p-8">
          <h1 className="cosmotips-headline font-heading text-3xl font-semibold tracking-tight sm:text-[2rem]">
            {c.title}
          </h1>
          <div className="mt-6 max-w-none space-y-4 text-base leading-7 text-white/80 [&_a]:text-violet-200 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-violet-100">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2 className="cosmotips-headline mt-10 mb-4 text-2xl font-semibold tracking-tight text-white first:mt-0">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h2 className="cosmotips-headline mt-10 mb-3 text-xl font-semibold tracking-tight text-violet-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-6 mb-2 text-lg font-semibold text-violet-100/95">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 leading-7 text-white/80">{children}</p>
                ),
                hr: () => <hr className="my-8 border-white/15" />,
                strong: ({ children }) => (
                  <strong className="font-semibold text-white/95">{children}</strong>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-200 underline underline-offset-2 hover:text-violet-100"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {bodyMd}
            </ReactMarkdown>
          </div>
          <div className="mt-10">
            <Link
              href={`/?lang=${lang}`}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition hover:from-violet-200 hover:to-violet-500"
            >
              {c.backHome}
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

function TermsFallback() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Suspense fallback={<TermsFallback />}>
      <TermsContent />
    </Suspense>
  );
}
