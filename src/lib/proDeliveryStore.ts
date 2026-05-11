import { Redis } from "@upstash/redis";
import { normalizeAuthEmail } from "@/lib/authSession";

let redis: Redis | undefined;
let missingEnvWarned = false;
const memoryKeys = new Set<string>();

function getRedisClient(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (!missingEnvWarned) {
      console.warn(
        "[proDeliveryStore] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set; using in-memory idempotency fallback.",
      );
      missingEnvWarned = true;
    }
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

export function proDeliveryKey(kind: "weekly" | "monthly", period: string, email: string) {
  return `pro:delivery:${kind}:${period}:${normalizeAuthEmail(email)}`;
}

export function proWebhookEventKey(eventId: string) {
  return `pro:webhook:${eventId}`;
}

export async function claimIdempotencyKey(
  key: string,
  ttlSeconds = 60 * 60 * 24 * 45,
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    if (memoryKeys.has(key)) return false;
    memoryKeys.add(key);
    return true;
  }
  const result = await client.set(key, "1", { nx: true, ex: ttlSeconds });
  return result === "OK";
}

export async function releaseIdempotencyKey(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    memoryKeys.delete(key);
    return;
  }
  await client.del(key);
}
