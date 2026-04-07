import OpenAI from "openai";
import { requireEnv } from "@/lib/env";

let openaiSingleton: OpenAI | null = null;

export function getOpenAI() {
  if (!openaiSingleton) {
    openaiSingleton = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
  }
  return openaiSingleton;
}

