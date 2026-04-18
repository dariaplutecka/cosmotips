"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AppLang } from "@/lib/reportSchema";
import { CosmotipsTopBar } from "@/components/CosmotipsTopBar";
import { articlesPageCopy, homeCopy } from "@/lib/uiCopy";

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function ArticlesContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("lang");
  const lang: AppLang =
    raw === "pl" || raw === "es" ? raw : "en";
  const c = articlesPageCopy[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const articles = c.articles;
  const hasArticle = (a: (typeof articles)[number]) => a.title.trim().length > 0;
  const isReading = openIndex !== null;

  const cardShell =
    "w-full rounded-3xl border border-white/10 bg-white/5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur";

  const hc = homeCopy[lang];

  return (
    <div className="min-h-dvh">
      <div
        className={`mx-auto w-full px-4 py-10 sm:px-5 sm:py-14 ${
          isReading
            ? "max-w-7xl 2xl:max-w-[min(100vw-2rem,112rem)]"
            : "max-w-6xl"
        }`}
      >
        <CosmotipsTopBar
          lang={lang}
          langLabel={hc.langLabel}
          logoAriaLabel={hc.navLogoHomeAria}
        />
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="cosmotips-headline font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {c.pageTitle}
          </h1>
          <Link
            href={`/?lang=${lang}`}
            className="inline-flex shrink-0 items-center justify-center self-start rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition hover:from-violet-200 hover:to-violet-500 sm:self-auto"
          >
            {c.backHome}
          </Link>
        </div>

        <div className="w-full space-y-4 sm:space-y-5">
          {openIndex === null ? (
            articles.map((article, i) =>
              hasArticle(article) ? (
                <article
                  key={i}
                  className={`${cardShell} flex flex-col p-5 sm:p-6 md:p-7`}
                >
                  <h2 className="font-heading text-lg font-semibold tracking-tight text-white sm:text-xl">
                    {article.title}
                  </h2>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-white/72 sm:text-base">
                    {article.teaser}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    className="mt-5 w-full rounded-xl border border-violet-400/35 bg-violet-500/15 py-3 text-sm font-medium text-violet-200 transition hover:border-violet-300/50 hover:bg-violet-500/25 sm:text-base"
                  >
                    {c.articleOpen}
                  </button>
                </article>
              ) : null,
            )
          ) : (
            <>
              <article
                className={`${cardShell} relative overflow-x-clip overflow-y-visible p-6 pb-10 sm:p-9 sm:pb-12 md:p-12 md:pb-14 lg:px-14 lg:pb-16`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(null)}
                  className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/90 shadow-md backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
                  aria-label={c.articleCloseAria}
                >
                  <CloseIcon />
                </button>
                <h2 className="font-heading pr-14 text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-[1.7rem] lg:text-[1.85rem]">
                  {articles[openIndex].title}
                </h2>
                <p className="mt-4 max-w-[85ch] text-pretty text-sm text-white/70 sm:text-base md:text-lg">
                  {articles[openIndex].teaser}
                </p>
                <div className="mt-8 w-full max-w-none border-t border-white/10 pt-8 whitespace-pre-line text-pretty text-base leading-[1.75] text-white/85 sm:text-lg sm:leading-[1.8] md:text-[1.0625rem] md:leading-[1.82]">
                  {articles[openIndex].body}
                </div>
              </article>

              {articles.map(
                (article, i) =>
                  i !== openIndex &&
                  hasArticle(article) && (
                    <article
                      key={i}
                      className={`${cardShell} flex flex-col p-5 sm:p-6 md:p-7`}
                    >
                      <h2 className="font-heading text-lg font-semibold tracking-tight text-white sm:text-xl">
                        {article.title}
                      </h2>
                      <p className="mt-3 text-pretty text-sm leading-relaxed text-white/72 sm:text-base">
                        {article.teaser}
                      </p>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(i)}
                        className="mt-5 w-full rounded-xl border border-violet-400/35 bg-violet-500/15 py-3 text-sm font-medium text-violet-200 transition hover:border-violet-300/50 hover:bg-violet-500/25 sm:text-base"
                      >
                        {c.articleOpen}
                      </button>
                    </article>
                  ),
              )}
            </>
          )}
        </div>
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
