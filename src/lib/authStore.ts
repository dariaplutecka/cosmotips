import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { normalizeAuthEmail } from "@/lib/authSession";

type MagicLinkRecord = {
  email: string;
  lang: string;
  createdAt: number;
  /** Stringified PendingFreeNatalV1 JSON (cross-browser resume after magic link). */
  pendingFreeNatalJson?: string;
  /** Stringified PendingProSubscriptionMagicV1 JSON → Stripe subscription Checkout after verify. */
  pendingProSubscriptionJson?: string;
};

let redis: Redis | undefined;
let missingEnvWarned = false;

function getRedisClient(): Redis {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (!missingEnvWarned) {
      console.warn(
        "[authStore] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set; auth tokens require Redis storage.",
      );
      missingEnvWarned = true;
    }
    throw new Error("Auth storage is not configured.");
  }
  redis = new Redis({ url, token });
  return redis;
}

const magicLinkKey = (tokenHash: string) => `auth:magic:${tokenHash}`;
const googleStateKey = (stateHash: string) => `auth:google_state:${stateHash}`;
const fnbResumeKey = (tokenHash: string) => `auth:fnb_resume:${tokenHash}`;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createAuthToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function storeMagicLinkToken(opts: {
  token: string;
  email: string;
  lang: string;
  pendingFreeNatalJson?: string;
  pendingProSubscriptionJson?: string;
}): Promise<void> {
  const record: MagicLinkRecord = {
    email: normalizeAuthEmail(opts.email),
    lang: opts.lang,
    createdAt: Date.now(),
    ...(opts.pendingFreeNatalJson !== undefined
      ? { pendingFreeNatalJson: opts.pendingFreeNatalJson }
      : {}),
    ...(opts.pendingProSubscriptionJson !== undefined
      ? { pendingProSubscriptionJson: opts.pendingProSubscriptionJson }
      : {}),
  };
  await getRedisClient().set(magicLinkKey(hashToken(opts.token)), record, {
    ex: 60 * 15,
  });
}

export async function consumeMagicLinkToken(
  token: string,
): Promise<MagicLinkRecord | null> {
  const redisClient = getRedisClient();
  const key = magicLinkKey(hashToken(token));
  const script = `
local value = redis.call("GET", KEYS[1])
if not value then
  return nil
end
redis.call("DEL", KEYS[1])
return value
`;
  const raw = await redisClient.eval<[], string | MagicLinkRecord | null>(
    script,
    [key],
    [],
  );
  if (!raw) return null;
  const data =
    typeof raw === "string" ? (JSON.parse(raw) as MagicLinkRecord) : raw;
  return data;
}

export async function storeGoogleState(state: string): Promise<void> {
  await getRedisClient().set(googleStateKey(hashToken(state)), "1", {
    ex: 60 * 10,
  });
}

export async function consumeGoogleState(state: string): Promise<boolean> {
  const redisClient = getRedisClient();
  const key = googleStateKey(hashToken(state));
  const script = `
local value = redis.call("GET", KEYS[1])
if not value then
  return 0
end
redis.call("DEL", KEYS[1])
return 1
`;
  const consumed = await redisClient.eval<[], number>(script, [key], []);
  return consumed === 1;
}

export async function storeFnbResumePayload(
  plainToken: string,
  rawJson: string,
): Promise<void> {
  await getRedisClient().set(fnbResumeKey(hashToken(plainToken)), rawJson, {
    ex: 60 * 15,
  });
}

/** Read without consuming until session validates (caller must delete after success). */
export async function readFnbResumePayload(plainToken: string): Promise<string | null> {
  const raw = await getRedisClient().get(fnbResumeKey(hashToken(plainToken)));
  return typeof raw === "string" ? raw : null;
}

export async function deleteFnbResumePayload(plainToken: string): Promise<void> {
  await getRedisClient().del(fnbResumeKey(hashToken(plainToken)));
}
