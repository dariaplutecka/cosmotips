import { NextResponse } from "next/server";
import { consumeGoogleState } from "@/lib/authStore";
import { normalizeAuthEmail, setAuthSessionCookie } from "@/lib/authSession";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

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
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const rawState = url.searchParams.get("state") ?? "";
  const [state, lang = "en"] = rawState.split(":");
  const baseUrl = getBaseUrl(request);
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!code || !state || !clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/?lang=${lang}&auth=invalid`);
  }

  try {
    const validState = await consumeGoogleState(state);
    if (!validState) {
      return NextResponse.redirect(`${baseUrl}/?lang=${lang}&auth=invalid`);
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error ?? "Google token exchange failed.");
    }

    const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = (await userRes.json()) as GoogleUserInfo;
    if (!userRes.ok || !user.email || user.email_verified === false) {
      return NextResponse.redirect(`${baseUrl}/?lang=${lang}&auth=invalid`);
    }

    const response = NextResponse.redirect(`${baseUrl}/?lang=${lang}&auth=success`);
    return setAuthSessionCookie(response, {
      email: normalizeAuthEmail(user.email),
      name: user.name,
      image: user.picture,
      provider: "google",
    });
  } catch (err) {
    console.error("[auth/google/callback] failed:", err);
    return NextResponse.redirect(`${baseUrl}/?lang=${lang}&auth=error`);
  }
}
