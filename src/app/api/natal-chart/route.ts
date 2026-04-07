import { NextResponse } from "next/server";
import { z } from "zod";
import { computeNatalChart } from "@/lib/natalChart";

const BodySchema = z.object({
  dob: z.string().min(1),
  tob: z.string().min(1),
  pob: z.string().min(1).max(120),
});

export async function POST(req: Request) {
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
