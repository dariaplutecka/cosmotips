import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  success: boolean;
};

let ratelimit: Ratelimit | null | undefined;
let missingEnvWarned = false;

function getRateLimit() {
  if (ratelimit !== undefined) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (!missingEnvWarned) {
      console.warn(
        "[rateLimit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set; allowing requests without rate limiting.",
      );
      missingEnvWarned = true;
    }
    ratelimit = null;
    return ratelimit;
  }

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "60 s"),
  });
  return ratelimit;
}

export async function checkRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getRateLimit();
  if (!limiter) return { success: true };

  try {
    const { success } = await limiter.limit(identifier);
    return { success };
  } catch (err) {
    console.warn("[rateLimit] Upstash rate limit check failed; allowing request.", err);
    return { success: true };
  }
}
