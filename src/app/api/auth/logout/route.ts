import { NextResponse } from "next/server";
import { clearAuthSessionCookie } from "@/lib/authSession";

export async function POST() {
  return clearAuthSessionCookie(NextResponse.json({ ok: true }));
}
