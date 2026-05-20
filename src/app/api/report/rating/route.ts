import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { submitReportRatingAfterVerify } from "@/lib/reportRatingStore";

export const runtime = "nodejs";

const BodySchema = z.object({
  session_id: z.string().min(8).max(200),
  rating: z.number().int().min(1).max(5),
});

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(req: Request) {
  const rateLimit = await checkRateLimit(`report-rating:${getClientIp(req)}`);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const result = await submitReportRatingAfterVerify(
    parsed.data.session_id,
    parsed.data.rating,
  );

  if (result === "no_report") {
    return NextResponse.json(
      { error: "Report not found or session invalid." },
      { status: 404 },
    );
  }

  if (result === "duplicate") {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  return NextResponse.json({ ok: true });
}
