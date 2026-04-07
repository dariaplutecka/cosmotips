import { createRequire } from "node:module";
import { marked } from "marked";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Token, Tokens } from "marked";

const require = createRequire(import.meta.url);

// pdfmake is CommonJS-only; keep on server only.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinter = require("pdfmake/js/Printer").default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfFonts = require("pdfmake/build/vfs_fonts.js") as {
  pdfMake: { vfs: Record<string, string> };
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const virtualfs = require("pdfmake/js/virtual-fs").default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const URLResolver = require("pdfmake/js/URLResolver").default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const OutputDocument = require("pdfmake/js/OutputDocument").default;

let vfsPopulated = false;

function ensurePdfFontsInVfs() {
  if (vfsPopulated) return;
  const vfs = pdfFonts.pdfMake.vfs;
  for (const filename of Object.keys(vfs)) {
    virtualfs.writeFileSync(filename, Buffer.from(vfs[filename], "base64"));
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

function extractInlineText(tokens: Token[] | undefined): string {
  if (!tokens?.length) return "";
  return tokens
    .map((t) => {
      if (t.type === "text") return (t as Tokens.Text).text;
      if (t.type === "escape") return (t as Tokens.Escape).text;
      if (
        t.type === "strong" ||
        t.type === "em" ||
        t.type === "del" ||
        t.type === "link" ||
        t.type === "image"
      ) {
        const withInner = t as { tokens?: Token[]; text?: string };
        if (withInner.tokens?.length)
          return extractInlineText(withInner.tokens);
        return typeof withInner.text === "string" ? withInner.text : "";
      }
      if (t.type === "codespan") return (t as Tokens.Codespan).text;
      if (t.type === "br") return "\n";
      return "";
    })
    .join("");
}

function markdownBlocksToPdfContent(tokens: Token[]): Content[] {
  const content: Content[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const h = token as Tokens.Heading;
        const size = h.depth <= 1 ? 16 : h.depth === 2 ? 14 : 12;
        content.push({
          text: extractInlineText(h.tokens),
          fontSize: size,
          bold: true,
          margin: [0, 10, 0, 6],
        });
        break;
      }
      case "paragraph": {
        const p = token as Tokens.Paragraph;
        content.push({
          text: extractInlineText(p.tokens),
          fontSize: 11,
          margin: [0, 0, 0, 8],
          alignment: "justify",
        });
        break;
      }
      case "list": {
        const list = token as Tokens.List;
        let n =
          typeof list.start === "number" && Number.isFinite(list.start)
            ? list.start
            : 1;
        for (const item of list.items) {
          const bullet = list.ordered ? `${n++}. ` : "• ";
          content.push({
            text: bullet + extractInlineText(item.tokens),
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
        const c = token as Tokens.Code;
        content.push({
          text: c.text,
          fontSize: 9,
          margin: [0, 4, 0, 8],
        });
        break;
      }
      case "blockquote": {
        const b = token as Tokens.Blockquote;
        const inner = b.tokens?.length
          ? markdownBlocksToPdfContent(b.tokens)
          : [{ text: b.text, italics: true, fontSize: 11 }];
        content.push({
          stack: inner,
          margin: [16, 4, 0, 8],
        });
        break;
      }
      case "space":
        break;
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
  const blocks = marked.lexer(markdown);
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
