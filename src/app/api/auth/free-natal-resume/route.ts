import { NextResponse } from "next/server";
import { getAuthSession, normalizeAuthEmail } from "@/lib/authSession";
import { readFnbResumePayload, deleteFnbResumePayload } from "@/lib/authStore";
import { PendingFreeNatalV1Schema } from "@/lib/reportSchema";

/**
 * Consumes `fn_resume` server token (issued after magic-link verify).
 * Enables free-natal continuation when mail opens in another browser/profile
 * without localStorage (e.g. Facebook / Gmail embedded browsers).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  let raw: string | null;
  try {
    raw = await readFnbResumePayload(token);
  } catch {
    return NextResponse.json({ error: "resume_unavailable" }, { status: 503 });
  }

  if (!raw) {
    return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    await deleteFnbResumePayload(token);
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const validated = PendingFreeNatalV1Schema.safeParse(json);
  if (!validated.success) {
    await deleteFnbResumePayload(token);
    return NextResponse.json({ error: "bad_pending_shape" }, { status: 400 });
  }

  const user = await getAuthSession();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  if (
    normalizeAuthEmail(validated.data.payload.email) !==
    normalizeAuthEmail(user.email)
  ) {
    await deleteFnbResumePayload(token);
    return NextResponse.json({ error: "email_mismatch" }, { status: 403 });
  }

  await deleteFnbResumePayload(token);
  return NextResponse.json({ payload: validated.data.payload });
}
