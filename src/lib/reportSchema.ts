import { z } from "zod";

export const ReportTypeSchema = z.enum([
  "natal_basic",
  "personality",
  "weekly",
  "monthly",
]);

export type ReportType = z.infer<typeof ReportTypeSchema>;

export const AppLangSchema = z.enum(["en", "pl", "es"]);

export type AppLang = z.infer<typeof AppLangSchema>;

export const CheckoutPayloadSchema = z.object({
  email: z.string().trim().email().max(254),
  dob: z.string().min(1),
  tob: z.string().min(1),
  pob: z.string().min(1).max(120),
  reportType: ReportTypeSchema,
  lang: AppLangSchema.default("en"),
});

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;

