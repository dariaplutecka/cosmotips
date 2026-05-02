import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthToken, storeMagicLinkToken } from "@/lib/authStore";
import { sendMagicLinkEmail } from "@/lib/authEmail";
import { AppLangSchema, CheckoutPayloadSchema } from "@/lib/reportSchema";

const MagicLinkPayloadSchema = z.object({
  email: CheckoutPayloadSchema.shape.email,
  lang: AppLangSchema.default("en"),
});

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = MagicLinkPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const token = createAuthToken();
  const { email, lang } = parsed.data;

  try {
    await storeMagicLinkToken({ token, email, lang });
    const url = `${getBaseUrl(request)}/api/auth/verify?token=${encodeURIComponent(token)}&lang=${lang}`;
    await sendMagicLinkEmail({ email, url, lang });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/magic-link] failed:", err);
    return NextResponse.json({ error: "auth_unavailable" }, { status: 503 });
  }
}
