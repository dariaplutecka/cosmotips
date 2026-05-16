import { Redis } from "@upstash/redis";
import type { AppLang } from "@/lib/reportSchema";

const REPORT_TTL_SECONDS = 60 * 60 * 24 * 7;
const KEY_PREFIX = "report:";
const FNB_META_PREFIX = "report:fnb_meta:";
const COMP_META_PREFIX = "report:comp_meta:";

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

function fnbMetaKey(sessionId: string) {
  return `${FNB_META_PREFIX}${sessionId}`;
}

export type FnNatalCachedMeta = {
  email: string;
  dob: string;
  tob: string;
  pob: string;
  reportType: "natal_basic";
  lang: AppLang;
  birthTimeUnknown: boolean;
};

/** Sidecar for free natal `fnb_*` when Redis payload is already deleted but report text is cached. */
export async function setFnNatalReportMeta(
  sessionId: string,
  meta: FnNatalCachedMeta,
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  await client.set(fnbMetaKey(sessionId), meta, { ex: REPORT_TTL_SECONDS });
}

export async function getFnNatalReportMeta(
  sessionId: string,
): Promise<FnNatalCachedMeta | null> {
  const client = getRedisClient();
  if (!client) return null;
  const raw = await client.get<FnNatalCachedMeta>(fnbMetaKey(sessionId));
  return raw ?? null;
}

function compMetaKey(sessionId: string) {
  return `${COMP_META_PREFIX}${sessionId}`;
}

/** Sidecar dla `comp_*` (complimentary / allowlista e-mail): meta po usunięciu payloadu z freeReportStore. */
export type CompReportCachedMeta = {
  email: string;
  dob: string;
  tob: string;
  pob: string;
  reportType: "personality" | "weekly" | "monthly";
  lang: AppLang;
  birthTimeUnknown: boolean;
};

export async function setCompReportMeta(
  sessionId: string,
  meta: CompReportCachedMeta,
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  await client.set(compMetaKey(sessionId), meta, { ex: REPORT_TTL_SECONDS });
}

export async function getCompReportMeta(
  sessionId: string,
): Promise<CompReportCachedMeta | null> {
  const client = getRedisClient();
  if (!client) return null;
  const raw = await client.get<CompReportCachedMeta>(compMetaKey(sessionId));
  return raw ?? null;
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
