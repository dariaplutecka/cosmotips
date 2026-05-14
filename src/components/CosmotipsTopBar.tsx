"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FEATURE_GOOGLE_AUTH_UI } from "@/lib/featureFlags";
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
  onLogoClick?: () => void;
  /** Zwiększ po odświeżeniu statusu subskrypcji/tokenów (np. na stronie głównej), aby ponownie pobrać saldo. */
  sessionSyncKey?: number;
};

type AuthUser = {
  email: string;
  name?: string;
  image?: string;
  provider: "email" | "google";
};

type SubscriptionStatus = {
  authenticated: boolean;
  pro: boolean;
  tarotBalance?: number;
};

function tarotBalanceAria(lang: AppLang, n: number): string {
  if (lang === "pl") return `Saldo tokenów tarota: ${n}`;
  if (lang === "es") return `Saldo de fichas de tarot: ${n}`;
  return `Tarot token balance: ${n}`;
}

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
      emailInvalid: "Podaj poprawny adres e-mail.",
      pro: "Pro",
      manage: "Zarządzaj subskrypcją",
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
      emailInvalid: "Introduce un correo válido.",
      pro: "Pro",
      manage: "Gestionar suscripción",
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
    emailInvalid: "Enter a valid email address.",
    pro: "Pro",
    manage: "Manage subscription",
  };
}

export function CosmotipsTopBar({
  lang,
  langLabel,
  logoAriaLabel,
  onLangChange,
  onLogoClick,
  sessionSyncKey,
}: Props) {
  const pathname = usePathname() || "/";
  const homeHref = `/?lang=${lang}`;
  const copy = authText(lang);
  const authBtnRef = useRef<HTMLButtonElement>(null);
  const authPanelRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  async function refreshSession() {
    const res = await fetch("/api/auth/session");
    const data = (await res.json().catch(() => null)) as { user?: AuthUser | null } | null;
    setUser(data?.user ?? null);
    const subRes = await fetch("/api/subscription/status");
    const subData = (await subRes.json().catch(() => null)) as SubscriptionStatus | null;
    setSubscription(subData);
  }

  useEffect(() => {
    void refreshSession();
    // sessionSyncKey: gdy przekazany, każdy przyrost odnawia dane; gdy brak — tylko mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, sessionSyncKey !== undefined ? [sessionSyncKey] : []);

  useEffect(() => {
    if (!authOpen) return;
    function onPointerDown(ev: MouseEvent | PointerEvent) {
      const node = ev.target as Node | null;
      if (!node) return;
      if (authBtnRef.current?.contains(node)) return;
      if (authPanelRef.current?.contains(node)) return;
      setAuthOpen(false);
    }
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.key === "Escape") setAuthOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [authOpen]);

  async function sendMagicLink() {
    const clean = authEmail.trim();
    const emailLooksValid =
      clean.includes("@") && clean.includes(".") && clean.indexOf("@") < clean.lastIndexOf(".");
    if (!emailLooksValid) {
      setAuthError(copy.emailInvalid);
      setAuthMessage(null);
      return;
    }
    setAuthLoading(true);
    setAuthMessage(null);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: clean, lang }),
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
    setSubscription(null);
    setAuthOpen(false);
  }

  async function openCustomerPortal() {
    setPortalLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/stripe/customer-portal", { method: "POST" });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) throw new Error(data?.error ?? copy.error);
      window.location.assign(data.url);
    } catch {
      setAuthError(copy.error);
      setPortalLoading(false);
    }
  }

  return (
    <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8 sm:gap-4">
      <Link
        href={homeHref}
        onClick={onLogoClick}
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
          id="cosmotips-auth-button"
          ref={authBtnRef}
          type="button"
          aria-expanded={authOpen}
          aria-controls="cosmotips-auth-panel"
          aria-haspopup="dialog"
          onClick={() => setAuthOpen((current) => !current)}
          className="rounded-full border border-violet-200/30 bg-violet-400/15 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-black/20 transition hover:bg-violet-400/25"
        >
          {user ? (
            <span className="inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 sm:max-w-none sm:gap-2">
              <span className="min-w-0 truncate">{user.email.split("@")[0]}</span>
              {subscription?.pro ? (
                <span className="shrink-0 rounded-full bg-amber-300 px-1.5 py-0.5 text-[0.6rem] font-black uppercase text-black">
                  {copy.pro}
                </span>
              ) : null}
              {typeof subscription?.tarotBalance === "number" ? (
                <span
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-violet-200/35 bg-violet-950/55 px-1.5 py-0.5 text-[0.65rem] font-bold tabular-nums text-violet-100"
                  aria-label={tarotBalanceAria(lang, subscription.tarotBalance)}
                >
                  <span aria-hidden className="text-[0.7rem] leading-none">
                    🎴
                  </span>
                  <span>{subscription.tarotBalance}</span>
                </span>
              ) : null}
            </span>
          ) : (
            copy.signIn
          )}
        </button>

        {authOpen ? (
          <div
            id="cosmotips-auth-panel"
            ref={authPanelRef}
            role="dialog"
            aria-label={copy.signIn}
            className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-white/12 bg-[#130b25]/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur"
          >
            {user ? (
              <div className="space-y-3">
                <p className="text-xs text-white/55">{user.provider}</p>
                <p className="text-sm font-semibold">{user.email}</p>
                {subscription?.pro ? (
                  <button
                    type="button"
                    onClick={() => void openCustomerPortal()}
                    disabled={portalLoading}
                    className="w-full rounded-2xl bg-gradient-to-b from-amber-200 to-amber-400 px-4 py-2 text-sm font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {portalLoading ? "..." : copy.manage}
                  </button>
                ) : null}
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
                {FEATURE_GOOGLE_AUTH_UI ? (
                  <a
                    href={`/api/auth/google/start?lang=${lang}`}
                    className="block rounded-2xl border border-white/15 px-4 py-2 text-center text-sm font-bold text-white/85 transition hover:bg-white/10"
                  >
                    {copy.google}
                  </a>
                ) : null}
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
