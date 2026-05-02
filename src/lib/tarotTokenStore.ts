import { Redis } from "@upstash/redis";

let redis: Redis | undefined;
let missingEnvWarned = false;

function shouldBypassTarotTokensForDev(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.STRIPE_SKIP_PAYMENT_FOR_DEV === "true"
  );
}

function getRedisClient(): Redis {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (!missingEnvWarned) {
      console.warn(
        "[tarotTokenStore] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set; tarot tokens require durable Redis storage.",
      );
      missingEnvWarned = true;
    }
    throw new Error("Tarot token storage is not configured.");
  }

  redis = new Redis({ url, token });
  return redis;
}

const key = (email: string) => `tarot:tokens:${email.toLowerCase().trim()}`;

export async function getTarotBalance(email: string): Promise<number> {
  if (shouldBypassTarotTokensForDev()) return 2;
  const val = await getRedisClient().get<number>(key(email));
  return val ?? 0;
}

export async function addTarotTokens(
  email: string,
  amount: number,
): Promise<number> {
  if (shouldBypassTarotTokensForDev()) return amount;
  return await getRedisClient().incrby(key(email), amount);
}

// Returns true when a token was deducted, false when the balance is empty.
export async function deductTarotToken(email: string): Promise<boolean> {
  if (shouldBypassTarotTokensForDev()) return true;
  const result = await getRedisClient().eval<[], number>(
    `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
if current <= 0 then
  return 0
end
redis.call("DECRBY", KEYS[1], 1)
return 1
`,
    [key(email)],
    [],
  );
  return result === 1;
}
