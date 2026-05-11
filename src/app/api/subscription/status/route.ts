import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/authSession";
import {
  getProSubscription,
  getProSubscriberProfile,
  hasUsedProPersonalityPortrait,
  isActiveProStatus,
} from "@/lib/subscriptionStore";
import { getTarotBalance } from "@/lib/tarotTokenStore";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.email) {
    return NextResponse.json({ authenticated: false, pro: false });
  }

  const [subscription, profile, tarotBalance, personalityUsed] = await Promise.all([
    getProSubscription(session.email),
    getProSubscriberProfile(session.email),
    getTarotBalance(session.email),
    hasUsedProPersonalityPortrait(session.email),
  ]);

  return NextResponse.json({
    authenticated: true,
    pro: isActiveProStatus(subscription?.status),
    subscription,
    profile,
    tarotBalance,
    personalityPortraitUsed: personalityUsed,
  });
}
