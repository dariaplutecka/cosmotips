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
  birthTimeUnknown: z.boolean().default(false),
});

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;

/** Persisted snapshot for magic-link resume (server-backed for cross-browser / in-app browsers). */
export const PendingFreeNatalV1Schema = z
  .object({
    v: z.literal(1),
    createdAt: z.number(),
    payload: CheckoutPayloadSchema,
  })
  .refine((data) => data.payload.reportType === "natal_basic", {
    message: "free_natal_only",
    path: ["payload", "reportType"],
  });

export type PendingFreeNatalV1 = z.infer<typeof PendingFreeNatalV1Schema>;

