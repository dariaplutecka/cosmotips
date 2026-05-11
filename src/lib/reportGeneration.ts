import { getOpenAI } from "@/lib/openai";
import { computeNatalChart } from "@/lib/natalChart";
import { buildNatalBasicFreePrompt, buildReportPrompt } from "@/lib/reportPrompts";
import { buildNatalSampleBlurb } from "@/lib/natalSampleBlurb";
import type { AppLang, ReportType } from "@/lib/reportSchema";

function extractText(resp: unknown): string {
  if (!resp || typeof resp !== "object") return "";
  const output = (resp as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const c of content) {
      if (!c || typeof c !== "object") continue;
      const type = (c as { type?: unknown }).type;
      const text = (c as { text?: unknown }).text;
      if (type === "output_text" && typeof text === "string") return text;
    }
  }

  return "";
}

export async function generateAstrologyReportText(opts: {
  dob: string;
  tob: string;
  pob: string;
  reportType: ReportType;
  lang: AppLang;
  birthTimeUnknown: boolean;
}): Promise<string> {
  const chart = await computeNatalChart({
    dob: opts.dob,
    tob: opts.tob,
    pob: opts.pob,
  });
  const openai = getOpenAI();

  if (opts.reportType === "natal_basic") {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: buildNatalBasicFreePrompt({
        dob: opts.dob,
        tob: opts.tob,
        pob: opts.pob,
        lang: opts.lang,
        chart,
        birthTimeUnknown: opts.birthTimeUnknown,
      }),
    });
    const aiText = extractText(response);
    if (!aiText.trim()) throw new Error("No content returned from AI.");
    const blurb = buildNatalSampleBlurb(chart, opts.lang);
    return `${blurb}\n\n---\n\n${aiText.trim()}`;
  }

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: buildReportPrompt({
      dob: opts.dob,
      tob: opts.tob,
      pob: opts.pob,
      reportType: opts.reportType,
      lang: opts.lang,
      chart,
      birthTimeUnknown: opts.birthTimeUnknown,
    }),
  });
  const text = extractText(response);
  if (!text.trim()) throw new Error("No content returned from AI.");
  return text.trim();
}
