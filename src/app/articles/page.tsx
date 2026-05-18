"use client";

import Link from "next/link";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import type { AppLang } from "@/lib/reportSchema";
import { CosmotipsTopBar } from "@/components/CosmotipsTopBar";
import type { SiteArticle } from "@/lib/articleContent";
import { siteArticlesByLang } from "@/lib/articleContent";
import { articlesPageCopy, homeCopy } from "@/lib/uiCopy";

/** Teaser = markdown before first `---` line break; remainder is the expandable body. */
function splitArticleTeaser(body: string): { teaserMd: string; fullMd: string | null } {
  const trimmed = body.trimStart().replace(/\r\n/g, "\n");
  const re = /\n---\s*\n/;
  const match = re.exec(trimmed);
  if (!match) return { teaserMd: trimmed, fullMd: null };
  const teaserMd = trimmed.slice(0, match.index).trimEnd();
  const after = trimmed.slice(match.index + match[0].length).trimEnd();
  if (!after) return { teaserMd: trimmed, fullMd: null };
  return { teaserMd, fullMd: after };
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArticleAccordion(props: {
  article: SiteArticle;
  cardShell: string;
  bodyTextClass: string;
  markdownComponents: Components;
  isOpen: boolean;
  onToggle: () => void;
  openLabel: string;
  closeLabel: string;
}) {
  const {
    article,
    cardShell,
    bodyTextClass,
    markdownComponents,
    isOpen,
    onToggle,
    openLabel,
    closeLabel,
  } = props;
  const panelId = `article-${article.id}-rest`;
  const { teaserMd, fullMd } = splitArticleTeaser(article.body);
  const expandable = Boolean(fullMd);
  const teaserToShow = expandable ? teaserMd : article.body.trimStart();

  return (
    <article
      className={`${cardShell} relative overflow-x-clip overflow-y-visible p-6 sm:p-9 md:p-12 lg:px-14 ${
        expandable && !isOpen ? "pb-6 sm:pb-9 md:pb-12 lg:pb-14" : "pb-10 sm:pb-12 md:pb-14 lg:pb-16"
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <h2 className="cosmotips-heading-3 min-w-0 flex-1 text-balance">{article.title}</h2>
        {expandable ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={panelId}
            className="mt-0.5 inline-flex shrink-0 items-center gap-2 rounded-2xl border border-violet-400/35 bg-violet-500/20 px-3 py-2 text-sm font-semibold text-violet-100 shadow-sm shadow-violet-950/30 transition hover:border-violet-300/50 hover:bg-violet-500/30 hover:text-white active:scale-[0.98] sm:px-3.5"
          >
            <span className="max-w-[9.5rem] text-left leading-tight sm:max-w-none">
              {isOpen ? closeLabel : openLabel}
            </span>
            <ChevronDownIcon
              className={`h-5 w-5 shrink-0 transition-transform duration-200 ease-out ${isOpen ? "-rotate-180" : ""}`}
            />
          </button>
        ) : null}
      </div>
      <div className={`mt-6 border-t border-white/10 pt-6 ${bodyTextClass}`}>
        <ReactMarkdown components={markdownComponents}>{teaserToShow}</ReactMarkdown>
      </div>
      {expandable && fullMd ? (
        <div id={panelId} className={isOpen ? "block" : "hidden"} aria-hidden={!isOpen}>
          <div className={`mt-6 border-t border-white/10 pt-6 ${bodyTextClass}`}>
            <ReactMarkdown components={markdownComponents}>{fullMd}</ReactMarkdown>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function ArticlesContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("lang");
  const lang: AppLang =
    raw === "pl" || raw === "es" ? raw : "en";
  const c = articlesPageCopy[lang];
  const articles = siteArticlesByLang[lang];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const markdownComponents = useMemo<Components>(
    () => ({
      h2: ({ children }) => (
        <h3 className="cosmotips-heading-3 mb-4 mt-0 text-violet-100 first:mt-0 sm:mt-0">
          {children}
        </h3>
      ),
      h3: ({ children }) => (
        <h4 className="mt-6 mb-2 text-[1.05rem] font-semibold tracking-tight text-violet-200/95 first:mt-0">
          {children}
        </h4>
      ),
      p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
      ul: ({ children }) => (
        <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>
      ),
      li: ({ children }) => (
        <li className="pl-1 leading-relaxed">{children}</li>
      ),
      hr: () => (
        <hr className="my-8 border-t border-white/15" aria-hidden />
      ),
    }),
    [],
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const cardShell =
    "w-full rounded-3xl border border-white/10 bg-white/5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur";

  const hc = homeCopy[lang];

  const bodyTextClass =
    "w-full max-w-none text-pretty text-base leading-[1.75] text-white/85 sm:text-lg sm:leading-[1.8] md:text-[1.0625rem] md:leading-[1.82]";

  return (
    <div className="min-h-dvh">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-5 sm:py-14 2xl:max-w-[min(100vw-2rem,112rem)]">
        <CosmotipsTopBar
          lang={lang}
          langLabel={hc.langLabel}
          logoAriaLabel={hc.navLogoHomeAria}
        />
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="cosmotips-heading-2">
            {c.pageTitle}
          </h1>
          <Link
            href={`/?lang=${lang}`}
            className="inline-flex shrink-0 items-center justify-center self-start rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition hover:from-violet-200 hover:to-violet-500 sm:self-auto"
          >
            {c.backHome}
          </Link>
        </div>

        <div className="flex flex-col gap-6 sm:gap-8">
          {articles.map((article) => (
            <ArticleAccordion
              key={article.id}
              article={article}
              cardShell={cardShell}
              bodyTextClass={bodyTextClass}
              markdownComponents={markdownComponents}
              isOpen={expanded[article.id] ?? false}
              onToggle={() => toggleExpanded(article.id)}
              openLabel={c.articleOpen}
              closeLabel={c.articleCloseAria}
            />
          ))}
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
