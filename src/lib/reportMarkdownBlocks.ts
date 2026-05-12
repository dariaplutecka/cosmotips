/** Shared markdown subset for reports and tarot (server + tests). */

export type MarkdownBlock =
  | { type: "heading"; depth: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; start: number; items: string[] }
  | { type: "hr" }
  | { type: "code"; text: string }
  | { type: "blockquote"; blocks: MarkdownBlock[]; text: string };

export function stripInlineMarkdown(text: string): string {
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

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
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
