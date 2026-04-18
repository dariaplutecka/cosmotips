import Link from "next/link";
import type { AppLang } from "@/lib/reportSchema";
import type { HomeCopy } from "@/lib/uiCopy";

type Props = {
  copy: HomeCopy;
  lang: AppLang;
};

export function HomeFooter({ copy, lang }: Props) {
  const q = `lang=${lang}`;

  return (
    <footer className="mx-auto mt-14 max-w-6xl border-t border-white/10 pt-8 text-center sm:mt-16 sm:pt-10">
      <nav
        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm"
        aria-label="Footer"
      >
        <Link
          href={`/articles?${q}`}
          className="font-medium text-violet-200 underline decoration-violet-400/45 underline-offset-4 transition hover:text-violet-100"
        >
          {copy.footerArticlesTitle}
        </Link>
        <Link
          href={`/contact?${q}`}
          className="font-medium text-violet-200 underline decoration-violet-400/45 underline-offset-4 transition hover:text-violet-100"
        >
          {copy.footerContactTitle}
        </Link>
      </nav>
      <p className="mx-auto mt-6 max-w-2xl text-xs leading-relaxed text-white/45">
        {copy.footer}
      </p>
    </footer>
  );
}
