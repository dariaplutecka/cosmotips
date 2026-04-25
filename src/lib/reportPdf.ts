import { createRequire } from "node:module";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";

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

type MarkdownBlock =
  | { type: "heading"; depth: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; start: number; items: string[] }
  | { type: "hr" }
  | { type: "code"; text: string }
  | { type: "blockquote"; blocks: MarkdownBlock[]; text: string };

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\\\n/g, "\n")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/\\([\\`*{}\[\]()#+\-.!_>])/g, "$1");
}

function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let i = 0;

  const pushParagraph = (parts: string[]) => {
    const text = stripInlineMarkdown(parts.join(" ").trim());
    if (text) blocks.push({ type: "paragraph", text });
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i++;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({
        type: "heading",
        depth: heading[1].length,
        text: stripInlineMarkdown(heading[2].trim()),
      });
      i++;
      continue;
    }

    if (/^\s*(?:---|\*\*\*|___)\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (/^```/.test(line)) {
      i++;
      const code: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i] ?? "")) {
        code.push(lines[i] ?? "");
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i] ?? "")) {
        quote.push((lines[i] ?? "").replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "blockquote",
        blocks: parseMarkdownBlocks(quote.join("\n")),
        text: stripInlineMarkdown(quote.join(" ").trim()),
      });
      continue;
    }

    const unordered = /^\s*[-*+]\s+(.+)$/.exec(line);
    const ordered = /^\s*(\d+)\.\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      const items: string[] = [];
      const listOrdered = Boolean(ordered);
      const start = ordered ? Number(ordered[1]) : 1;
      while (i < lines.length) {
        const current = lines[i] ?? "";
        const match = listOrdered
          ? /^\s*\d+\.\s+(.+)$/.exec(current)
          : /^\s*[-*+]\s+(.+)$/.exec(current);
        if (!match) break;
        items.push(stripInlineMarkdown(match[1].trim()));
        i++;
      }
      blocks.push({ type: "list", ordered: listOrdered, start, items });
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length) {
      const current = lines[i] ?? "";
      if (
        !current.trim() ||
        /^(#{1,6})\s+/.test(current) ||
        /^\s*(?:---|\*\*\*|___)\s*$/.test(current) ||
        /^```/.test(current) ||
        /^>\s?/.test(current) ||
        /^\s*[-*+]\s+/.test(current) ||
        /^\s*\d+\.\s+/.test(current)
      ) {
        break;
      }
      paragraph.push(current.trim());
      i++;
    }
    pushParagraph(paragraph);
  }

  return blocks;
}

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
