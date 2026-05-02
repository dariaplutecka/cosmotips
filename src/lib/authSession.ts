import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type AuthProvider = "email" | "google";

export type AuthSessionUser = {
  email: string;
  name?: string;
  image?: string;
  provider: AuthProvider;
};

type SessionPayload = AuthSessionUser & {
  exp: number;
};

export const AUTH_SESSION_COOKIE = "cosmotips_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

let warnedMissingSecret = false;

export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

function authSecret(): string {
  const configured = process.env.AUTH_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production.");
  }
  if (!warnedMissingSecret) {
    console.warn("[auth] AUTH_SECRET is not set; using a development fallback.");
    warnedMissingSecret = true;
  }
  return "cosmotips-dev-auth-secret";
}

function base64UrlEncode(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", authSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function createSessionToken(user: AuthSessionUser): string {
  const payload: SessionPayload = {
    ...user,
    email: normalizeAuthEmail(user.email),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

function parseSessionToken(token: string | undefined): AuthSessionUser | null {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = signPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.email || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      email: normalizeAuthEmail(payload.email),
      name: payload.name,
      image: payload.image,
      provider: payload.provider,
    };
  } catch {
    return null;
  }
}

export async function getAuthSession(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  return parseSessionToken(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
}

export function setAuthSessionCookie(
  response: NextResponse,
  user: AuthSessionUser,
): NextResponse {
  response.cookies.set(AUTH_SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export function clearAuthSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
