import { NextResponse } from "next/server";
import { z } from "zod";
import { generateReportPdfBuffer } from "@/lib/reportPdf";

/** pdfmake + vfs_fonts need Node (not Edge). */
export const runtime = "nodejs";

const PdfPayloadSchema = z.object({
  report: z.string().min(1),
  title: z.string().min(1).max(160),
  filename: z.string().min(1).max(120).optional(),
});

function safePdfFilename(filename: string | undefined) {
  const safe =
    filename?.replace(/[^a-z0-9_-]/gi, "-").replace(/-+/g, "-").toLowerCase() ||
    "cosmotips-report";
  return `${safe.replace(/\.pdf$/i, "")}.pdf`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = PdfPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid PDF payload." },
      { status: 400 },
    );
  }

  const pdfBuffer = await generateReportPdfBuffer(
    parsed.data.report,
    parsed.data.title,
  );
  const filename = safePdfFilename(parsed.data.filename);

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
