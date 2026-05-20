import { Redis } from "@upstash/redis";
import { getReport } from "@/lib/reportCache";

const KEY_PREFIX = "report_rating:";
/** Keep long enough to correlate with support; rating is idempotent per session. */
const TTL_SECONDS = 60 * 60 * 24 * 120;

let redis: Redis | null | undefined;
let missingEnvWarned = false;

const memoryVotes = new Map<string, { stars: number; at: string }>();

function getRedisClient(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (!missingEnvWarned) {
      console.warn(
        "[reportRatingStore] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set; using in-memory report rating fallback (not durable across instances).",
      );
      missingEnvWarned = true;
    }
    redis = null;
    return redis;
  }
  redis = new Redis({ url, token });
  return redis;
}

function ratingKey(sessionId: string): string {
  return `${KEY_PREFIX}${sessionId}`;
}

export type SubmitReportRatingResult = "saved" | "duplicate" | "no_report";

/**
 * One submission per checkout session — SET NX after verifying the report exists in cache.
 */
export async function submitReportRatingAfterVerify(
  sessionId: string,
  stars: number,
): Promise<SubmitReportRatingResult> {
  if (!sessionId || stars < 1 || stars > 5) return "no_report";

  const report = await getReport(sessionId);
  if (!report) return "no_report";

  const at = new Date().toISOString();
  const value = JSON.stringify({ stars, at });
  const key = ratingKey(sessionId);

  const client = getRedisClient();
  if (!client) {
    if (memoryVotes.has(sessionId)) return "duplicate";
    memoryVotes.set(sessionId, { stars, at });
    return "saved";
  }

  const result = await client.set(key, value, { nx: true, ex: TTL_SECONDS });
  if (result === null) return "duplicate";
  return "saved";
}
