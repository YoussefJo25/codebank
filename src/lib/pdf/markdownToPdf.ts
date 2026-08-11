import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type {
  Blockquote,
  Code,
  Delete,
  Emphasis,
  Heading,
  InlineCode,
  Link,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
  Strong,
  Table,
  Text,
} from "mdast";
import type { Content, TableCell } from "pdfmake/interfaces";
import { MONO_NO_LIGATURES, PDF_FONTS } from "./pdfFonts";
import { codeBox } from "./codeBox";
import type { Language } from "../../types";

const processor = unified().use(remarkParse).use(remarkGfm);

export interface MarkdownPdfPalette {
  text: string;
  muted: string;
  accent: string;
  border: string;
  codeBg: string;
}

const DEFAULT_PALETTE: MarkdownPdfPalette = {
  text: "#2b2620",
  muted: "#7a7161",
  accent: "#b3541e",
  border: "#e2ddd0",
  codeBg: "#f6f4ef",
};

const LANGUAGE_ALIASES: Record<string, Language> = {
  cpp: "cpp",
  "c++": "cpp",
  c: "cpp",
  python: "python",
  py: "python",
  java: "java",
  javascript: "javascript",
  js: "javascript",
};

function parseMarkdown(markdown: string): Root {
  return processor.parse(markdown) as unknown as Root;
}

function inlineToRuns(nodes: PhrasingContent[], palette: MarkdownPdfPalette): Content[] {
  const runs: Content[] = [];
  for (const node of nodes) {
    runs.push(...inlineNodeToRuns(node, palette));
  }
  return runs;
}

function inlineNodeToRuns(node: PhrasingContent, palette: MarkdownPdfPalette): Content[] {
  switch (node.type) {
    case "text": {
      const t = node as Text;
      return [{ text: t.value }];
    }
    case "strong": {
      const n = node as Strong;
      return [{ text: inlineToRuns(n.children, palette), bold: true }];
    }
    case "emphasis": {
      const n = node as Emphasis;
      return [{ text: inlineToRuns(n.children, palette), color: palette.accent }];
    }
    case "delete": {
      const n = node as Delete;
      return [{ text: inlineToRuns(n.children, palette), decoration: "lineThrough" }];
    }
    case "inlineCode": {
      const n = node as InlineCode;
      return [
        {
          text: n.value,
          font: PDF_FONTS.mono,
          fontFeatures: MONO_NO_LIGATURES,
          fontSize: 9,
          color: palette.accent,
          background: palette.codeBg,
        },
      ];
    }
    case "link": {
      const n = node as Link;
      return [{ text: inlineToRuns(n.children, palette), color: palette.accent, decoration: "underline", link: n.url }];
    }
    case "break": {
      return [{ text: "\n" }];
    }
    case "image": {
      return [{ text: `[${node.alt ?? "صورة"}]`, italics: true, color: palette.muted }];
    }
    default:
      return [];
  }
}

function listItemContent(item: ListItem, palette: MarkdownPdfPalette): Content {
  const children = item.children.map((child) => blockToPdf(child, palette)).filter((c): c is Content => c !== null);
  const body: Content = children.length === 1 ? children[0] : { stack: children };
  if (item.checked !== null && item.checked !== undefined) {
    return { text: [{ text: item.checked ? "☑ " : "☐ ", color: palette.accent }, ...flattenAsInline(body)] };
  }
  return body;
}

function flattenAsInline(content: Content): Content[] {
  if (typeof content === "object" && content !== null && "text" in content) {
    const c = content as { text: Content };
    return Array.isArray(c.text) ? c.text : [c.text];
  }
  return [content];
}

function tableCellContent(
  cellNode: Table["children"][number]["children"][number],
  palette: MarkdownPdfPalette,
  isHeader = false,
): TableCell {
  return {
    text: inlineToRuns(cellNode.children, palette),
    font: isHeader ? PDF_FONTS.heading : PDF_FONTS.body,
    bold: isHeader,
    fontSize: 9.5,
    color: palette.text,
    fillColor: isHeader ? palette.codeBg : undefined,
    margin: [4, 3, 4, 3],
  };
}

function codeBlockContent(node: Code, palette: MarkdownPdfPalette, codeFontSize: number): Content {
  const lang = (node.lang ?? "").toLowerCase();
  const resolved: Language | null = LANGUAGE_ALIASES[lang] ?? null;
  return codeBox(node.value, resolved, Math.max(codeFontSize - 1, 7), palette);
}

function blockToPdf(node: RootContent, palette: MarkdownPdfPalette, codeFontSize = 9): Content | null {
  switch (node.type) {
    case "paragraph": {
      const n = node as Paragraph;
      return {
        text: inlineToRuns(n.children, palette),
        font: PDF_FONTS.body,
        fontSize: 10,
        color: palette.text,
        lineHeight: 1.5,
        margin: [0, 0, 0, 7],
      };
    }
    case "heading": {
      const n = node as Heading;
      const sizes = [15, 13, 11.5, 10.5, 10, 10];
      return {
        text: inlineToRuns(n.children, palette),
        font: PDF_FONTS.heading,
        bold: true,
        fontSize: sizes[Math.min(n.depth - 1, sizes.length - 1)],
        color: palette.text,
        margin: [0, n.depth === 1 ? 4 : 10, 0, 5],
      };
    }
    case "thematicBreak": {
      return {
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: palette.border }],
        margin: [0, 8, 0, 8],
      };
    }
    case "blockquote": {
      const n = node as Blockquote;
      const children = n.children.map((c) => blockToPdf(c, palette, codeFontSize)).filter((c): c is Content => c !== null);
      return {
        table: {
          widths: ["*"],
          body: [[{ stack: children, margin: [8, 5, 4, 5], color: palette.muted }]],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: (col: number) => (col === 0 ? 2.5 : 0),
          vLineColor: () => palette.accent,
        },
        margin: [0, 4, 0, 8],
      };
    }
    case "code": {
      return codeBlockContent(node as Code, palette, codeFontSize);
    }
    case "list": {
      const n = node as List;
      const items = n.children.map((item) => listItemContent(item, palette));
      if (n.ordered) {
        return { ol: items, font: PDF_FONTS.body, fontSize: 10, color: palette.text, margin: [0, 0, 0, 7] };
      }
      return { ul: items, font: PDF_FONTS.body, fontSize: 10, color: palette.text, margin: [0, 0, 0, 7] };
    }
    case "table": {
      const n = node as Table;
      const [headerRow, ...bodyRows] = n.children;
      if (!headerRow) return null;
      const widths = headerRow.children.map(() => "*");
      const body: TableCell[][] = [
        headerRow.children.map((cell) => tableCellContent(cell, palette, true)),
        ...bodyRows.map((row) => row.children.map((cell) => tableCellContent(cell, palette))),
      ];
      return {
        table: { widths, body, headerRows: 1 },
        layout: {
          hLineWidth: () => 0.75,
          vLineWidth: () => 0.75,
          hLineColor: () => palette.border,
          vLineColor: () => palette.border,
        },
        margin: [0, 4, 0, 8],
      };
    }
    default:
      return null;
  }
}

/** Converts a topic's Markdown explanation into pdfmake content nodes. */
export function markdownToPdfContent(
  markdown: string,
  codeFontSize = 9,
  palette: MarkdownPdfPalette = DEFAULT_PALETTE,
): Content[] {
  const trimmed = markdown.trim();
  if (!trimmed) return [];
  const tree = parseMarkdown(trimmed);
  return tree.children.map((n) => blockToPdf(n, palette, codeFontSize)).filter((c): c is Content => c !== null);
}
