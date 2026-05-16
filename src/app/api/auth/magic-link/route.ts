import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthToken, storeMagicLinkToken } from "@/lib/authStore";
import { sendMagicLinkEmail } from "@/lib/authEmail";
import {
  AppLangSchema,
  CheckoutPayloadSchema,
  PendingFreeNatalV1Schema,
  PendingProSubscriptionMagicV1Schema,
} from "@/lib/reportSchema";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/requestIp";
import { normalizeAuthEmail } from "@/lib/authSession";

const MagicLinkPayloadSchema = z
  .object({
    email: CheckoutPayloadSchema.shape.email,
    lang: AppLangSchema.default("en"),
    pendingFreeNatal: PendingFreeNatalV1Schema.optional(),
    pendingProSubscription: PendingProSubscriptionMagicV1Schema.optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.pendingFreeNatal &&
      normalizeAuthEmail(data.pendingFreeNatal.payload.email) !==
        normalizeAuthEmail(data.email)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "pending_email_mismatch",
        path: ["pendingFreeNatal", "payload", "email"],
      });
    }
    if (
      data.pendingProSubscription &&
      normalizeAuthEmail(data.pendingProSubscription.email) !==
        normalizeAuthEmail(data.email)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "pending_email_mismatch",
        path: ["pendingProSubscription", "email"],
      });
    }
    if (data.pendingFreeNatal && data.pendingProSubscription) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "only_one_pending_payload",
      });
    }
  });

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(`auth:${getClientIp(request)}`);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = MagicLinkPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const token = createAuthToken();
  const { email, lang } = parsed.data;

  try {
    await storeMagicLinkToken({
      token,
      email,
      lang,
      pendingFreeNatalJson:
        parsed.data.pendingFreeNatal !== undefined
          ? JSON.stringify(parsed.data.pendingFreeNatal)
          : undefined,
      pendingProSubscriptionJson:
        parsed.data.pendingProSubscription !== undefined
          ? JSON.stringify(parsed.data.pendingProSubscription)
          : undefined,
    });
    const url = `${getBaseUrl(request)}/api/auth/verify?token=${encodeURIComponent(token)}&lang=${lang}`;
    await sendMagicLinkEmail({ email, url, lang });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/magic-link] failed:", err);
    return NextResponse.json({ error: "auth_unavailable" }, { status: 503 });
  }
}
