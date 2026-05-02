import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/authSession";

export async function GET() {
  const user = await getAuthSession();
  return NextResponse.json({ user });
}
