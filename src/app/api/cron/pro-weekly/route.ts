import { assertCronAuthorized, currentWeeklyPeriod, runProReportDelivery } from "@/lib/proCron";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  const result = await runProReportDelivery({
    kind: "weekly",
    reportType: "weekly",
    period: currentWeeklyPeriod(),
  });
  return Response.json(result);
}
