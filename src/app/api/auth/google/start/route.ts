import { NextResponse } from "next/server";
import { createAuthToken, storeGoogleState } from "@/lib/authStore";

function getBaseUrl(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const requestHost = new URL(request.url).hostname;
  if (requestHost === "localhost" || requestHost === "127.0.0.1") {
    return requestOrigin;
  }
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return requestOrigin;
}

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json({ error: "Google auth is not configured." }, { status: 503 });
  }

  const requestUrl = new URL(request.url);
  const lang = requestUrl.searchParams.get("lang") ?? "en";
  const baseUrl = getBaseUrl(request);
  const state = createAuthToken();

  try {
    await storeGoogleState(state);
  } catch (err) {
    console.error("[auth/google/start] failed:", err);
    return NextResponse.json({ error: "Auth storage is not configured." }, { status: 503 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state: `${state}:${lang}`,
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
