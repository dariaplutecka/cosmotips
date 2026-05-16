/**
 * Google OAuth button in the UI (top bar, Pro subscribe modal).
 * Magic link is unaffected. API routes `/api/auth/google/*` stay in the codebase.
 */
export const FEATURE_GOOGLE_AUTH_UI = false;

/**
 * Subskrypcja Pro: krok 3 (wybór płatności z planami miesięcznym/rocznym), magic link / Stripe subscription,
 * powiadomienia `?subscription=`. Gdy false — tylko jednorazowe Stripe (raporty, pakiet tokenów tarota),
 * przycisk jak „Generuj raport”; logowanie w top barze jest ukryte.
 */
export const FEATURE_SUBSCRIPTION_UI = false;
