import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";
import {
  consumeMagicLinkToken,
  storeFnbResumePayload,
} from "@/lib/authStore";
import {
  normalizeAuthEmail,
  setAuthSessionCookie,
} from "@/lib/authSession";
import { storeFreeReportPayload } from "@/lib/freeReportStore";
import { createProSubscriptionStripeCheckoutUrl } from "@/lib/proSubscriptionCheckout";
import {
  PendingFreeNatalV1Schema,
  PendingProSubscriptionMagicV1Schema,
} from "@/lib/reportSchema";

function coerceMagicLinkPendingJson(record: {
  pendingFreeNatalJson?: string;
}): string | null {
  const v = (record as { pendingFreeNatalJson?: unknown }).pendingFreeNatalJson;
  if (v == null) return null;
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : null;
  }
  try {
    return JSON.stringify(v);
  } catch {
    return null;
  }
}

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const lang = url.searchParams.get("lang") ?? "en";
  const baseUrl = getBaseUrl(request);

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/?lang=${encodeURIComponent(lang)}&auth=invalid`);
  }

  try {
    const record = await consumeMagicLinkToken(token);
    if (!record) {
      return NextResponse.redirect(`${baseUrl}/?lang=${encodeURIComponent(lang)}&auth=invalid`);
    }

    let redirectHref = `${baseUrl}/?lang=${encodeURIComponent(record.lang)}&auth=success`;

    const pendingFreeRaw = coerceMagicLinkPendingJson(record);
    if (pendingFreeRaw) {
      let directWorked = false;
      try {
        const asJson = JSON.parse(pendingFreeRaw) as unknown;
        const validated = PendingFreeNatalV1Schema.safeParse(asJson);
        if (
          validated.success &&
          normalizeAuthEmail(validated.data.payload.email) ===
            normalizeAuthEmail(record.email)
        ) {
          const sessionId = `fnb_${randomUUID()}`;
          await storeFreeReportPayload(sessionId, validated.data.payload);
          const qp = new URLSearchParams({
            session_id: sessionId,
            fnb: "1",
            lang: validated.data.payload.lang,
          });
          /** Server-side continuation: no SPA / homepage / fetch race (in‑app browsers, www split, etc.). */
          redirectHref = `${baseUrl}/success?${qp.toString()}`;
          directWorked = true;
        }
      } catch (prepErr) {
        console.error("[auth/verify] free natal → /success prep failed:", prepErr);
      }

      if (!directWorked) {
        try {
          const resumeTok = randomBytes(24).toString("base64url");
          await storeFnbResumePayload(resumeTok, pendingFreeRaw);
          redirectHref = `${baseUrl}/?lang=${encodeURIComponent(record.lang)}&auth=success&fn_resume=${encodeURIComponent(resumeTok)}`;
        } catch (resumeErr) {
          console.error("[auth/verify] fn_resume store failed:", resumeErr);
        }
      }
    } else if (record.pendingProSubscriptionJson) {
      try {
        const asJson = JSON.parse(record.pendingProSubscriptionJson) as unknown;
        const validated = PendingProSubscriptionMagicV1Schema.safeParse(asJson);
        if (
          validated.success &&
          normalizeAuthEmail(validated.data.email) ===
            normalizeAuthEmail(record.email)
        ) {
          const checkout = await createProSubscriptionStripeCheckoutUrl({
            email: record.email,
            name: validated.data.name,
            dob: validated.data.dob,
            tob: validated.data.tob,
            pob: validated.data.pob,
            birthTimeUnknown: validated.data.birthTimeUnknown,
            lang: validated.data.lang,
            interval: validated.data.interval,
            baseUrl,
          });
          if ("url" in checkout) {
            redirectHref = checkout.url;
          }
        }
      } catch (proErr) {
        console.error("[auth/verify] pro subscription checkout prep failed:", proErr);
      }
    }

    const response = NextResponse.redirect(redirectHref);
    return setAuthSessionCookie(response, {
      email: record.email,
      provider: "email",
    });
  } catch (err) {
    console.error("[auth/verify] failed:", err);
    return NextResponse.redirect(`${baseUrl}/?lang=${encodeURIComponent(lang)}&auth=error`);
  }
}
