import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import type { AppLang } from "@/lib/reportSchema";
import { tarotDeck, type TarotCard } from "@/lib/tarotDeck";

const DAILY_TTL_SECONDS = 60 * 60 * 24 * 3;
const WARSAW_TIME_ZONE = "Europe/Warsaw";

let redis: Redis | null | undefined;
let missingEnvWarned = false;
const memoryFallback = new Map<string, string>();

function getRedisClient(): Redis | null {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (!missingEnvWarned) {
      console.warn(
        "[tarotDailyStore] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set; using in-memory daily tarot fallback outside production.",
      );
      missingEnvWarned = true;
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error("Daily tarot storage is not configured.");
    }
    redis = null;
    return redis;
  }

  redis = new Redis({ url, token });
  return redis;
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function currentDailyTarotDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WARSAW_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function usageKey(email: string, date: string): string {
  return `tarot:daily:usage:${date}:${normalizeEmail(email)}`;
}

function interpretationKey(
  card: TarotCard,
  lang: AppLang,
  date: string,
  personalizationKey: string,
): string {
  return `tarot:daily:interpretation:${date}:${lang}:${card.id}:${card.reversed ? "r" : "u"}:${personalizationKey}`;
}

function hashToInt(input: string): number {
  return createHash("sha256").update(input).digest().readUInt32BE(0);
}

export function drawDailyCard(email: string, date = currentDailyTarotDate()): TarotCard {
  const base = hashToInt(`${date}:${normalizeEmail(email)}:card`);
  const reversedSeed = hashToInt(`${date}:${normalizeEmail(email)}:reversed`);
  const card = tarotDeck[base % tarotDeck.length];
  return {
    ...card,
    reversed: reversedSeed % 10 < 3,
  };
}

export async function hasClaimedDailyTarot(
  email: string,
  date = currentDailyTarotDate(),
): Promise<boolean> {
  const key = usageKey(email, date);
  const client = getRedisClient();
  if (!client) return memoryFallback.get(key) === "1";
  return (await client.get(key)) === "1";
}

export async function claimDailyTarot(
  email: string,
  date = currentDailyTarotDate(),
): Promise<boolean> {
  const key = usageKey(email, date);
  const client = getRedisClient();
  if (!client) {
    if (memoryFallback.get(key) === "1") return false;
    memoryFallback.set(key, "1");
    return true;
  }
  const result = await client.set(key, "1", { nx: true, ex: DAILY_TTL_SECONDS });
  return result === "OK";
}

export async function getCachedDailyInterpretation(
  card: TarotCard,
  lang: AppLang,
  date = currentDailyTarotDate(),
  personalizationKey: string,
): Promise<string | null> {
  const key = interpretationKey(card, lang, date, personalizationKey);
  const client = getRedisClient();
  if (!client) return memoryFallback.get(key) ?? null;
  return await client.get<string>(key);
}

export async function setCachedDailyInterpretation(
  card: TarotCard,
  lang: AppLang,
  interpretation: string,
  date = currentDailyTarotDate(),
  personalizationKey: string,
): Promise<void> {
  const key = interpretationKey(card, lang, date, personalizationKey);
  const client = getRedisClient();
  if (!client) {
    memoryFallback.set(key, interpretation);
    return;
  }
  await client.set(key, interpretation, { ex: DAILY_TTL_SECONDS });
}
