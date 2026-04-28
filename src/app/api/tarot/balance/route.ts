import { NextResponse } from "next/server";
import { CheckoutPayloadSchema } from "@/lib/reportSchema";
import { getTarotBalance } from "@/lib/tarotTokenStore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? "";
  const parsed = CheckoutPayloadSchema.shape.email.safeParse(email);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const balance = await getTarotBalance(parsed.data);
  return NextResponse.json({ balance });
}
