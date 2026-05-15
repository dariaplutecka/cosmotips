import { Redis } from "@upstash/redis";
import type { CheckoutPayload } from "@/lib/reportSchema";

const FREE_REPORT_TTL_SECONDS = 60 * 30;
const KEY_PREFIX = "report:free:";

let redis: Redis | undefined;
let missingEnvWarned = false;
const memoryFreeReports = new Map<string, CheckoutPayload>();

function getRedisClient(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (!missingEnvWarned) {
      console.warn(
        "[freeReportStore] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set; using in-memory free report fallback.",
      );
      missingEnvWarned = true;
    }
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

function freeReportKey(sessionId: string) {
  return `${KEY_PREFIX}${sessionId}`;
}

export async function storeFreeReportPayload(
  sessionId: string,
  payload: CheckoutPayload,
): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    memoryFreeReports.set(sessionId, payload);
    return;
  }
  await client.set(freeReportKey(sessionId), payload, { ex: FREE_REPORT_TTL_SECONDS });
}

/** Read payload without consuming (supports parallel / double-fetch before generation finishes). */
export async function peekFreeReportPayload(
  sessionId: string,
): Promise<CheckoutPayload | null> {
  const client = getRedisClient();
  if (!client) {
    return memoryFreeReports.get(sessionId) ?? null;
  }
  const raw = await client.get(freeReportKey(sessionId));
  if (!raw) return null;
  return typeof raw === "string"
    ? (JSON.parse(raw) as CheckoutPayload)
    : (raw as CheckoutPayload);
}

export async function deleteFreeReportPayload(sessionId: string): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    memoryFreeReports.delete(sessionId);
    return;
  }
  await client.del(freeReportKey(sessionId));
}

export async function consumeFreeReportPayload(
  sessionId: string,
): Promise<CheckoutPayload | null> {
  const client = getRedisClient();
  if (!client) {
    const payload = memoryFreeReports.get(sessionId) ?? null;
    memoryFreeReports.delete(sessionId);
    return payload;
  }

  const key = freeReportKey(sessionId);
  const script = `
local value = redis.call("GET", KEYS[1])
if not value then
  return nil
end
redis.call("DEL", KEYS[1])
return value
`;
  const raw = await client.eval<[], string | CheckoutPayload | null>(
    script,
    [key],
    [],
  );
  if (!raw) return null;
  const data =
    typeof raw === "string" ? (JSON.parse(raw) as CheckoutPayload) : raw;
  return data;
}
