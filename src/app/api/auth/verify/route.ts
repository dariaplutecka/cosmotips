import { NextResponse } from "next/server";
import { consumeMagicLinkToken } from "@/lib/authStore";
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

    const response = NextResponse.redirect(`${baseUrl}/?lang=${record.lang}&auth=success`);
    return setAuthSessionCookie(response, {
      email: record.email,
      provider: "email",
    });
  } catch (err) {
    console.error("[auth/verify] failed:", err);
    return NextResponse.redirect(`${baseUrl}/?lang=${lang}&auth=error`);
  }
}
