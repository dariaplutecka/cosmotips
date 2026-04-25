import { Redis } from "@upstash/redis";

const REPORT_TTL_SECONDS = 60 * 60 * 24 * 7;
const KEY_PREFIX = "report:";

let redis: Redis | null | undefined;
let missingEnvWarned = false;
const memoryFallback = new Map<string, string>();

/**
 * Cache for generated reports keyed by Stripe / dev session_id.
 *
 * Production uses Upstash Redis with a 7-day TTL so a paid report can be reused
 * across Vercel cold starts and multiple function instances. If Upstash env vars
 * are missing, local/dev environments fall back to an in-memory Map and log a
 * warning; that fallback is process-local and not durable.
 */
function getRedisClient() {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (!missingEnvWarned) {
      console.warn(
        "[reportCache] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set; using in-memory report cache fallback.",
      );
      missingEnvWarned = true;
    }
    redis = null;
    return redis;
  }

  redis = new Redis({ url, token });
  return redis;
}

function cacheKey(sessionId: string) {
  return `${KEY_PREFIX}${sessionId}`;
}

export async function setReport(
  sessionId: string,
  report: string,
): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    memoryFallback.set(sessionId, report);
    return;
  }

  await client.set(cacheKey(sessionId), report, { ex: REPORT_TTL_SECONDS });
}

export async function getReport(sessionId: string): Promise<string | null> {
  const client = getRedisClient();
  if (!client) {
    return memoryFallback.get(sessionId) ?? null;
  }

  return await client.get<string>(cacheKey(sessionId));
}

export const reportCache = {
  get: getReport,
  set: setReport,
  async has(sessionId: string): Promise<boolean> {
    return (await getReport(sessionId)) !== null;
  },
};
