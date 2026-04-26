"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { AppLang } from "@/lib/reportSchema";
import { CosmotipsTopBar } from "@/components/CosmotipsTopBar";
import { articleContent } from "@/lib/articleContent";
import { articlesPageCopy, homeCopy } from "@/lib/uiCopy";

function ArticlesContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("lang");
  const lang: AppLang =
    raw === "pl" || raw === "es" ? raw : "en";
  const c = articlesPageCopy[lang];
  const article = articleContent[lang];

  const cardShell =
    "w-full rounded-3xl border border-white/10 bg-white/5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur";

  const hc = homeCopy[lang];

  return (
    <div className="min-h-dvh">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-5 sm:py-14 2xl:max-w-[min(100vw-2rem,112rem)]">
        <CosmotipsTopBar
          lang={lang}
          langLabel={hc.langLabel}
          logoAriaLabel={hc.navLogoHomeAria}
        />
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="cosmotips-headline font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {c.pageTitle}
          </h2>
          <Link
            href={`/?lang=${lang}`}
            className="inline-flex shrink-0 items-center justify-center self-start rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition hover:from-violet-200 hover:to-violet-500 sm:self-auto"
          >
            {c.backHome}
          </Link>
        </div>

        <article
          className={`${cardShell} relative overflow-x-clip overflow-y-visible p-6 pb-10 sm:p-9 sm:pb-12 md:p-12 md:pb-14 lg:px-14 lg:pb-16`}
        >
          <h1 className="font-heading text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-[1.7rem] lg:text-[1.85rem]">
            {article.title}
          </h1>
          <div className="mt-8 w-full max-w-none border-t border-white/10 pt-8 text-pretty text-base leading-[1.75] text-white/85 sm:text-lg sm:leading-[1.8] md:text-[1.0625rem] md:leading-[1.82]">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="mt-8 mb-3 font-heading text-xl font-semibold tracking-tight text-violet-100 sm:text-2xl">
                    {children}
                  </h2>
                ),
                p: ({ children }) => <p className="mb-5">{children}</p>,
              }}
            >
              {article.body}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}

function ArticlesFallback() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-14">
        <div className="h-12 w-48 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="mt-8 space-y-4">
          <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
          <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
        </div>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<ArticlesFallback />}>
      <ArticlesContent />
    </Suspense>
  );
}
