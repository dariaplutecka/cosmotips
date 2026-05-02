"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { AppLang } from "@/lib/reportSchema";

const LANGS: Array<{ code: AppLang; flag: string; abbr: string }> = [
  { code: "en", flag: "🇬🇧", abbr: "EN" },
  { code: "pl", flag: "🇵🇱", abbr: "PL" },
  { code: "es", flag: "🇪🇸", abbr: "ES" },
];

type Props = {
  lang: AppLang;
  langLabel: string;
  logoAriaLabel: string;
  /** Strona główna: zmiana języka bez przeładowania. Podstrony: pomijamy — linki `?lang=` */
  onLangChange?: (code: AppLang) => void;
};

type AuthUser = {
  email: string;
  name?: string;
  image?: string;
  provider: "email" | "google";
};

function authText(lang: AppLang) {
  if (lang === "pl") {
    return {
      signIn: "Zaloguj",
      signOut: "Wyloguj",
      emailPlaceholder: "Twój e-mail",
      magicLink: "Kontynuuj przez e-mail",
      google: "Kontynuuj z Google",
      sent: "Sprawdź skrzynkę. Wysłaliśmy link do logowania.",
      error: "Nie udało się zalogować. Spróbuj ponownie.",
    };
  }
  if (lang === "es") {
    return {
      signIn: "Iniciar sesión",
      signOut: "Cerrar sesión",
      emailPlaceholder: "Tu correo",
      magicLink: "Continuar con correo",
      google: "Continuar con Google",
      sent: "Revisa tu correo. Te enviamos un enlace de acceso.",
      error: "No se pudo iniciar sesión. Inténtalo de nuevo.",
    };
  }
  return {
    signIn: "Sign in",
    signOut: "Sign out",
    emailPlaceholder: "Your email",
    magicLink: "Continue with email",
    google: "Continue with Google",
    sent: "Check your email. We sent you a sign-in link.",
    error: "Could not sign in. Try again.",
  };
}

export function CosmotipsTopBar({
  lang,
  langLabel,
  logoAriaLabel,
  onLangChange,
}: Props) {
  const pathname = usePathname() || "/";
  const homeHref = `/?lang=${lang}`;
  const copy = authText(lang);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  async function refreshSession() {
    const res = await fetch("/api/auth/session");
    const data = (await res.json().catch(() => null)) as { user?: AuthUser | null } | null;
    setUser(data?.user ?? null);
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  async function sendMagicLink() {
    setAuthLoading(true);
    setAuthMessage(null);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: authEmail, lang }),
      });
      if (!res.ok) throw new Error("magic_link_failed");
      setAuthMessage(copy.sent);
    } catch {
      setAuthError(copy.error);
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setAuthOpen(false);
  }

  return (
    <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8 sm:gap-4">
      <Link
        href={homeHref}
        className="inline-flex shrink-0 items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/55"
        aria-label={logoAriaLabel}
      >
        <Image
          src="/logo-cosmotips.svg"
          alt=""
          width={530}
          height={429}
          className="h-16 w-auto sm:h-[4.5rem]"
          priority
        />
      </Link>

      <div className="relative flex shrink-0 items-center gap-2">
        <div
          className="flex gap-0.5 rounded-full border border-white/15 bg-black/35 p-1 shadow-lg shadow-black/20 backdrop-blur-sm"
          role="group"
          aria-label={langLabel}
        >
          {LANGS.map(({ code, flag, abbr }) => {
            const on = lang === code;
            const aria =
              code === "en" ? "English" : code === "pl" ? "Polski" : "Español";

            const pillClass = [
              "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold tracking-wide transition",
              on
                ? "bg-violet-400/30 text-white ring-1 ring-violet-300/45"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            ].join(" ");

            if (onLangChange) {
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLangChange(code)}
                  className={pillClass}
                  aria-pressed={on}
                  aria-label={aria}
                >
                  <span className="text-[1.05rem] leading-none" aria-hidden>
                    {flag}
                  </span>
                  <span>{abbr}</span>
                </button>
              );
            }

            const href = `${pathname === "/" ? "/" : pathname}?lang=${code}`;
            return (
              <Link
                key={code}
                href={href}
                className={pillClass}
                aria-current={on ? "true" : undefined}
                aria-label={aria}
              >
                <span className="text-[1.05rem] leading-none" aria-hidden>
                  {flag}
                </span>
                <span>{abbr}</span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setAuthOpen((current) => !current)}
          className="rounded-full border border-violet-200/30 bg-violet-400/15 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-black/20 transition hover:bg-violet-400/25"
        >
          {user ? user.email.split("@")[0] : copy.signIn}
        </button>

        {authOpen ? (
          <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-white/12 bg-[#130b25]/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur">
            {user ? (
              <div className="space-y-3">
                <p className="text-xs text-white/55">{user.provider}</p>
                <p className="text-sm font-semibold">{user.email}</p>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="w-full rounded-2xl border border-white/15 px-4 py-2 text-sm font-bold text-white/85 transition hover:bg-white/10"
                >
                  {copy.signOut}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="w-full rounded-2xl border border-violet-200/30 bg-white px-3 py-2 text-sm text-gray-950 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/35"
                />
                <button
                  type="button"
                  onClick={() => void sendMagicLink()}
                  disabled={authLoading || !authEmail.trim()}
                  className="w-full rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {copy.magicLink}
                </button>
                <a
                  href={`/api/auth/google/start?lang=${lang}`}
                  className="block rounded-2xl border border-white/15 px-4 py-2 text-center text-sm font-bold text-white/85 transition hover:bg-white/10"
                >
                  {copy.google}
                </a>
                {authMessage ? (
                  <p className="text-xs leading-5 text-emerald-200">{authMessage}</p>
                ) : null}
                {authError ? (
                  <p className="text-xs leading-5 text-red-200">{authError}</p>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
