import { createRequire } from "node:module";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { AppLang } from "@/lib/reportSchema";
import {
  celticCrossPositions,
  type SpreadType,
  type TarotCard,
  type TarotTopic,
} from "@/lib/tarotDeck";
import {
  parseMarkdownBlocks,
  type MarkdownBlock,
} from "@/lib/reportMarkdownBlocks";

const require = createRequire(import.meta.url);

// pdfmake is CommonJS-only; keep on server only.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinter = require("pdfmake/js/Printer").default;
/**
 * pdfmake/build/vfs_fonts.js exports the vfs map directly (`module.exports = vfs`).
 * Some docs / older builds used `{ pdfMake: { vfs } }` — support both for bundlers.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vfsFontsModule = require("pdfmake/build/vfs_fonts.js") as
  | Record<string, string>
  | { pdfMake?: { vfs?: Record<string, string> } };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const virtualfs = require("pdfmake/js/virtual-fs").default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const URLResolver = require("pdfmake/js/URLResolver").default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const OutputDocument = require("pdfmake/js/OutputDocument").default;

let vfsPopulated = false;

function getRobotoVfs(): Record<string, string> {
  const m = vfsFontsModule as Record<string, unknown> & {
    pdfMake?: { vfs?: Record<string, string> };
  };
  const wrapped = m?.pdfMake?.vfs;
  if (wrapped && typeof wrapped === "object") {
    return wrapped;
  }
  if (m && typeof m === "object") {
    return m as Record<string, string>;
  }
  throw new Error("pdfmake vfs_fonts: module did not export a VFS map");
}

function ensurePdfFontsInVfs() {
  if (vfsPopulated) return;
  const vfs = getRobotoVfs();
  for (const filename of Object.keys(vfs)) {
    const b64 = vfs[filename];
    if (typeof b64 !== "string") continue;
    virtualfs.writeFileSync(filename, Buffer.from(b64, "base64"));
  }
  vfsPopulated = true;
}

const robotoFontPaths = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
};

function markdownBlocksToPdfContent(tokens: MarkdownBlock[]): Content[] {
  const content: Content[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const size = token.depth <= 1 ? 16 : token.depth === 2 ? 14 : 12;
        content.push({
          text: token.text,
          fontSize: size,
          bold: true,
          margin: [0, 10, 0, 6],
        });
        break;
      }
      case "paragraph": {
        content.push({
          text: token.text,
          fontSize: 11,
          margin: [0, 0, 0, 8],
          alignment: "justify",
        });
        break;
      }
      case "list": {
        let n = Number.isFinite(token.start) ? token.start : 1;
        for (const item of token.items) {
          const bullet = token.ordered ? `${n++}. ` : "• ";
          content.push({
            text: bullet + item,
            fontSize: 11,
            margin: [14, 0, 0, 4],
          });
        }
        break;
      }
      case "hr":
        content.push({
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: "#888888",
            },
          ],
          margin: [0, 8, 0, 8],
        });
        break;
      case "code": {
        content.push({
          text: token.text,
          fontSize: 9,
          margin: [0, 4, 0, 8],
        });
        break;
      }
      case "blockquote": {
        const inner = token.blocks.length
          ? markdownBlocksToPdfContent(token.blocks)
          : [{ text: token.text, italics: true, fontSize: 11 }];
        content.push({
          stack: inner,
          margin: [16, 4, 0, 8],
        });
        break;
      }
      default:
        break;
    }
  }
  return content;
}

export async function generateReportPdfBuffer(
  markdown: string,
  docTitle: string,
): Promise<Buffer> {
  ensurePdfFontsInVfs();
  const printer = new PdfPrinter(
    robotoFontPaths,
    virtualfs,
    new URLResolver(virtualfs),
  );
  const blocks = parseMarkdownBlocks(markdown);
  const docDefinition: TDocumentDefinitions = {
    info: { title: docTitle },
    defaultStyle: { font: "Roboto", fontSize: 11 },
    content: [
      { text: docTitle, fontSize: 18, bold: true, margin: [0, 0, 0, 14] },
      ...markdownBlocksToPdfContent(blocks),
    ],
  };
  const pdfDocPromise = printer.createPdfKitDocument(docDefinition);
  const doc = new OutputDocument(pdfDocPromise);
  return doc.getBuffer();
}

function tarotCardName(card: TarotCard, lang: AppLang): string {
  if (lang === "pl") {
    return card.reversed ? `${card.namePl} (odwrócona)` : card.namePl;
  }
  if (lang === "es") {
    return card.reversed ? `${card.nameEs} (invertida)` : card.nameEs;
  }
  return card.reversed ? `${card.name} (Reversed)` : card.name;
}

function tarotPositions(spreadType: SpreadType, lang: AppLang): string[] {
  if (spreadType === "daily_card") {
    if (lang === "pl") return ["Karta dnia"];
    if (lang === "es") return ["Carta del Día"];
    return ["Card of the Day"];
  }
  if (spreadType === "celtic_cross") return celticCrossPositions[lang];
  if (lang === "pl") return ["Przeszłość", "Teraźniejszość", "Przyszłość"];
  if (lang === "es") return ["Pasado", "Presente", "Futuro"];
  return ["Past", "Present", "Future"];
}

function tarotTopicLabel(topic: TarotTopic, lang: AppLang): string {
  if (topic === "love") {
    if (lang === "pl") return "Miłość i relacje";
    if (lang === "es") return "Amor y relaciones";
    return "Love & Relationships";
  }
  if (topic === "finance_career") {
    if (lang === "pl") return "Kariera i finanse";
    if (lang === "es") return "Carrera y finanzas";
    return "Career & Finance";
  }
  if (lang === "pl") return "Zdrowie";
  if (lang === "es") return "Salud";
  return "Health";
}

export async function generateTarotPdfBuffer(opts: {
  title: string;
  cards: TarotCard[];
  interpretation: string;
  spreadType: SpreadType;
  topic: TarotTopic;
  lang: AppLang;
}): Promise<Buffer> {
  ensurePdfFontsInVfs();
  const printer = new PdfPrinter(
    robotoFontPaths,
    virtualfs,
    new URLResolver(virtualfs),
  );
  const positions = tarotPositions(opts.spreadType, opts.lang);
  const spreadContext =
    opts.spreadType === "daily_card" ? "" : tarotTopicLabel(opts.topic, opts.lang);
  const cardContent: Content[] = opts.cards.map((card, index) => ({
    text: `${positions[index] ?? index + 1}: ${tarotCardName(card, opts.lang)}`,
    fontSize: 11,
    bold: true,
    margin: [0, 0, 0, 5],
    color: "#3a2b0a",
  }));
  const interpretationContent: Content[] = markdownBlocksToPdfContent(
    parseMarkdownBlocks(opts.interpretation),
  );

  const docDefinition: TDocumentDefinitions = {
    info: { title: opts.title },
    defaultStyle: { font: "Roboto", fontSize: 11 },
    content: [
      { text: opts.title, fontSize: 18, bold: true, margin: [0, 0, 0, 6] },
      {
        text: spreadContext,
        fontSize: 11,
        color: "#7a5a10",
        margin: [0, 0, 0, 14],
      },
      {
        stack: cardContent,
        margin: [0, 0, 0, 14],
      },
      ...interpretationContent,
    ],
  };
  const pdfDocPromise = printer.createPdfKitDocument(docDefinition);
  const doc = new OutputDocument(pdfDocPromise);
  return doc.getBuffer();
}
