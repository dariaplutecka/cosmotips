import { Redis } from "@upstash/redis";
import type { AppLang } from "@/lib/reportSchema";
import { normalizeAuthEmail } from "@/lib/authSession";

export type ProBillingInterval = "monthly" | "yearly";

export type ProSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "cancelled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type ProSubscriptionRecord = {
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: ProSubscriptionStatus;
  billingInterval: ProBillingInterval;
  currentPeriodEnd: number;
  cancelAtPeriodEnd?: boolean;
  updatedAt: string;
};

export type ProSubscriberProfile = {
  email: string;
  name: string;
  dob: string;
  tob: string;
  pob: string;
  birthTimeUnknown: boolean;
  lang: AppLang;
  updatedAt: string;
};

let redis: Redis | undefined;
let missingEnvWarned = false;
const memorySubscriptions = new Map<string, ProSubscriptionRecord>();
const memoryProfiles = new Map<string, ProSubscriberProfile>();
const memoryActiveEmails = new Set<string>();
const memoryCustomerEmails = new Map<string, string>();
const memorySubscriptionEmails = new Map<string, string>();
const memoryPersonalityUsed = new Set<string>();

function getRedisClient(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (!missingEnvWarned) {
      console.warn(
        "[subscriptionStore] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set; using in-memory subscription fallback.",
      );
      missingEnvWarned = true;
    }
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

function subscriptionKey(email: string) {
  return `pro:subscription:${normalizeAuthEmail(email)}`;
}

function profileKey(email: string) {
  return `pro:profile:${normalizeAuthEmail(email)}`;
}

function customerKey(customerId: string) {
  return `pro:customer:${customerId}`;
}

function subscriptionIdKey(subscriptionId: string) {
  return `pro:subscription_id:${subscriptionId}`;
}

function personalityUsedKey(email: string) {
  return `pro:personality_used:${normalizeAuthEmail(email)}`;
}

const activeEmailsKey = "pro:active_emails";

export function isActiveProStatus(status?: string | null): boolean {
  return status === "active" || status === "trialing";
}

export async function setProSubscriberProfile(
  profile: Omit<ProSubscriberProfile, "email" | "updatedAt"> & { email: string },
): Promise<ProSubscriberProfile> {
  const record: ProSubscriberProfile = {
    ...profile,
    email: normalizeAuthEmail(profile.email),
    updatedAt: new Date().toISOString(),
  };
  const client = getRedisClient();
  if (!client) {
    memoryProfiles.set(record.email, record);
    return record;
  }
  await client.set(profileKey(record.email), record);
  return record;
}

export async function getProSubscriberProfile(
  email: string,
): Promise<ProSubscriberProfile | null> {
  const normalized = normalizeAuthEmail(email);
  const client = getRedisClient();
  if (!client) return memoryProfiles.get(normalized) ?? null;
  return await client.get<ProSubscriberProfile>(profileKey(normalized));
}

export async function setProSubscription(
  record: Omit<ProSubscriptionRecord, "email" | "updatedAt"> & { email: string },
): Promise<ProSubscriptionRecord> {
  const normalized = normalizeAuthEmail(record.email);
  const subscription: ProSubscriptionRecord = {
    ...record,
    email: normalized,
    updatedAt: new Date().toISOString(),
  };
  const client = getRedisClient();
  if (!client) {
    memorySubscriptions.set(normalized, subscription);
    memoryCustomerEmails.set(subscription.stripeCustomerId, normalized);
    memorySubscriptionEmails.set(subscription.stripeSubscriptionId, normalized);
    if (isActiveProStatus(subscription.status)) memoryActiveEmails.add(normalized);
    else memoryActiveEmails.delete(normalized);
    return subscription;
  }
  await Promise.all([
    client.set(subscriptionKey(normalized), subscription),
    client.set(customerKey(subscription.stripeCustomerId), normalized),
    client.set(subscriptionIdKey(subscription.stripeSubscriptionId), normalized),
    isActiveProStatus(subscription.status)
      ? client.sadd(activeEmailsKey, normalized)
      : client.srem(activeEmailsKey, normalized),
  ]);
  return subscription;
}

export async function getProSubscription(
  email: string,
): Promise<ProSubscriptionRecord | null> {
  const normalized = normalizeAuthEmail(email);
  const client = getRedisClient();
  if (!client) return memorySubscriptions.get(normalized) ?? null;
  return await client.get<ProSubscriptionRecord>(subscriptionKey(normalized));
}

export async function getEmailByStripeCustomerId(
  customerId: string,
): Promise<string | null> {
  const client = getRedisClient();
  if (!client) return memoryCustomerEmails.get(customerId) ?? null;
  return await client.get<string>(customerKey(customerId));
}

export async function getEmailByStripeSubscriptionId(
  subscriptionId: string,
): Promise<string | null> {
  const client = getRedisClient();
  if (!client) return memorySubscriptionEmails.get(subscriptionId) ?? null;
  return await client.get<string>(subscriptionIdKey(subscriptionId));
}

export async function isProSubscriber(email: string): Promise<boolean> {
  const subscription = await getProSubscription(email);
  return Boolean(subscription && isActiveProStatus(subscription.status));
}

export async function listActiveProSubscriberEmails(): Promise<string[]> {
  const client = getRedisClient();
  if (!client) return Array.from(memoryActiveEmails);
  return await client.smembers<string[]>(activeEmailsKey);
}

export async function hasUsedProPersonalityPortrait(email: string): Promise<boolean> {
  const normalized = normalizeAuthEmail(email);
  const client = getRedisClient();
  if (!client) return memoryPersonalityUsed.has(normalized);
  return (await client.get<string>(personalityUsedKey(normalized))) === "1";
}

export async function markProPersonalityPortraitUsed(email: string): Promise<boolean> {
  const normalized = normalizeAuthEmail(email);
  const client = getRedisClient();
  if (!client) {
    if (memoryPersonalityUsed.has(normalized)) return false;
    memoryPersonalityUsed.add(normalized);
    return true;
  }
  const result = await client.eval<[], number>(
    `
if redis.call("GET", KEYS[1]) then
  return 0
end
redis.call("SET", KEYS[1], "1")
return 1
`,
    [personalityUsedKey(normalized)],
    [],
  );
  return result === 1;
}
