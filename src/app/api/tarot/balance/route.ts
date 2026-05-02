import { NextResponse } from "next/server";
import { CheckoutPayloadSchema } from "@/lib/reportSchema";
import { getTarotBalance } from "@/lib/tarotTokenStore";
import { getAuthSession } from "@/lib/authSession";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session = await getAuthSession();
  const email = session?.email ?? searchParams.get("email") ?? "";
  const parsed = CheckoutPayloadSchema.shape.email.safeParse(email);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  try {
    const balance = await getTarotBalance(parsed.data);
    return NextResponse.json({ balance });
  } catch (err) {
    console.error("[tarot/balance] token store unavailable:", err);
    return NextResponse.json(
      { error: "token_store_unavailable" },
      { status: 503 },
    );
  }
}
