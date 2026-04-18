"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AppLang } from "@/lib/reportSchema";
import { CosmotipsTopBar } from "@/components/CosmotipsTopBar";
import { contactPageCopy, homeCopy } from "@/lib/uiCopy";

function ContactContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("lang");
  const lang: AppLang =
    raw === "pl" || raw === "es" ? raw : "en";
  const c = contactPageCopy[lang];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [showFallback, setShowFallback] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setShowFallback(false);
    setFormError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          lang,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        reason?: string;
      } | null;

      if (data?.reason === "not_configured") {
        setShowFallback(true);
        setStatus("idle");
        return;
      }

      if (res.ok && data?.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        return;
      }

      if (res.status === 400) {
        setFormError(c.errorValidation);
        setStatus("idle");
        return;
      }

      setFormError(c.errorSend);
      setStatus("idle");
    } catch {
      setFormError(c.errorSend);
      setStatus("idle");
    }
  }

  const cardShell =
    "w-full rounded-3xl border border-white/10 bg-white/5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur";

  const hc = homeCopy[lang];

  return (
    <div className="min-h-dvh">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-5 sm:py-14">
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

        <div className={`${cardShell} p-5 sm:p-7`}>
          <p className="text-pretty text-sm leading-relaxed text-white/75 sm:text-base">
            {c.lead}
          </p>

          {showFallback ? (
            <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/95">
              <p>{c.fallbackNotConfigured}</p>
              <a
                href={`mailto:${c.supportEmail}?subject=${encodeURIComponent(c.pageTitle)}`}
                className="mt-2 inline-block font-medium text-violet-200 underline decoration-violet-400/45 underline-offset-4 hover:text-violet-100"
              >
                {c.supportEmail}
              </a>
            </div>
          ) : null}

          {status === "success" ? (
            <p className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {c.success}
            </p>
          ) : null}

          {formError ? (
            <p className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {formError}
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="contact-name"
                className="text-xs font-medium text-white/70"
              >
                {c.fieldName}{" "}
                <span className="font-normal text-white/45">
                  ({c.fieldNameHint})
                </span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/30 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="text-xs font-medium text-white/70"
              >
                {c.fieldEmail}
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/30 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="contact-message"
                className="text-xs font-medium text-white/70"
              >
                {c.fieldMessage}
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength={10}
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1.5 w-full resize-y rounded-xl border border-white/12 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/30 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition hover:from-violet-200 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {status === "sending" ? c.submitting : c.submit}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/45">
            <a
              href={`mailto:${c.supportEmail}`}
              className="text-violet-300/90 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200"
            >
              {c.supportEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactFallback() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactFallback />}>
      <ContactContent />
    </Suspense>
  );
}
