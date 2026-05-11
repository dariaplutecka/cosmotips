import { assertCronAuthorized, currentMonthlyPeriod, runProReportDelivery } from "@/lib/proCron";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  const result = await runProReportDelivery({
    kind: "monthly",
    reportType: "monthly",
    period: currentMonthlyPeriod(),
  });
  return Response.json(result);
}
