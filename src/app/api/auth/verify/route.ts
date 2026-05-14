import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  consumeMagicLinkToken,
  storeFnbResumePayload,
} from "@/lib/authStore";
import { setAuthSessionCookie } from "@/lib/authSession";

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
    return NextResponse.redirect(`${baseUrl}/?lang=${lang}&auth=invalid`);
  }

  try {
    const record = await consumeMagicLinkToken(token);
    if (!record) {
      return NextResponse.redirect(`${baseUrl}/?lang=${lang}&auth=invalid`);
    }

    let redirectHref = `${baseUrl}/?lang=${encodeURIComponent(record.lang)}&auth=success`;
    if (record.pendingFreeNatalJson?.trim()) {
      try {
        const resumeTok = randomBytes(24).toString("base64url");
        await storeFnbResumePayload(resumeTok, record.pendingFreeNatalJson);
        redirectHref += `&fn_resume=${encodeURIComponent(resumeTok)}`;
      } catch (resumeErr) {
        console.error("[auth/verify] fn_resume store failed:", resumeErr);
      }
    }

    const response = NextResponse.redirect(redirectHref);
    return setAuthSessionCookie(response, {
      email: record.email,
      provider: "email",
    });
  } catch (err) {
    console.error("[auth/verify] failed:", err);
    return NextResponse.redirect(`${baseUrl}/?lang=${lang}&auth=error`);
  }
}
