import { NextResponse } from "next/server";
import { z } from "zod";
import { computeNatalChart } from "@/lib/natalChart";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/requestIp";

const BodySchema = z.object({
  dob: z.string().min(1),
  tob: z.string().min(1),
  pob: z.string().min(1).max(120),
});

export async function POST(req: Request) {
  const rateLimit = await checkRateLimit(`natal-chart:${getClientIp(req)}`);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  try {
    const chart = await computeNatalChart(parsed.data);
    return NextResponse.json({ chart });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Chart failed.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
