import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import pdfMake, { ensurePdfFontsRegistered, MONO_NO_LIGATURES, PDF_FONTS } from "./pdfFonts";

/**
 * Arabic text below is passed through untouched — no manual reshaping/bidi-reordering.
 * pdfkit's bundled fontkit already does both correctly on its own for plain, logical-
 * order Arabic (contextual letter joining AND right-to-left glyph placement per script
 * run), as long as the surrounding paragraph/text `alignment` is "right" (set as the
 * document default below). Pre-shaping the text ourselves (Arabic Presentation Forms
 * + a manual bidi pass) was tried first and made things worse: it visibly scrambled
 * the output, because fontkit still runs its own shaping on whatever string it's
 * given, and doing that twice corrupts the result.
 */
import { markdownToPdfContent } from "./markdownToPdf";
import { codeBox } from "./codeBox";
import { LANGUAGES } from "../languages";
import type { Folder, PdfExportSettings, Topic } from "../../types";

const PALETTE = {
  text: "#2b2620",
  muted: "#8a8171",
  subtle: "#a89f8e",
  accent: "#b3541e",
  jade: "#0f7a6a",
  border: "#e2ddd0",
  codeBg: "#f6f4ef",
};

const PAGE_WIDTHS: Record<PdfExportSettings["pageSize"], number> = {
  A4: 595.28,
  LETTER: 612,
};

const MARGIN_X = 42;
const COLUMN_GAP = 16;

function contentWidth(settings: PdfExportSettings): number {
  return PAGE_WIDTHS[settings.pageSize] - MARGIN_X * 2;
}

function columnWidth(settings: PdfExportSettings): number {
  const full = contentWidth(settings);
  return settings.columns === 2 ? (full - COLUMN_GAP) / 2 : full;
}

function sanitizeFilename(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]+/g, "-").slice(0, 80);
  return cleaned || "CodeBank";
}

function buildCover(settings: PdfExportSettings, folderCount: number, topicCount: number): Content {
  const dateLabel = new Intl.DateTimeFormat("ar", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(),
  );
  return {
    pageBreak: "after",
    stack: [
      { text: "", margin: [0, 130, 0, 0] },
      { text: "CodeBank", font: PDF_FONTS.heading, bold: true, fontSize: 36, color: PALETTE.accent, alignment: "center" },
      {
        text: settings.title || "مرجع حلول البرمجة التنافسية",
        font: PDF_FONTS.heading,
        bold: true,
        fontSize: 19,
        color: PALETTE.text,
        alignment: "center",
        margin: [40, 14, 40, 0],
      },
      ...(settings.subtitle
        ? [
            {
              text: settings.subtitle,
              font: PDF_FONTS.body,
              fontSize: 12,
              color: PALETTE.muted,
              alignment: "center" as const,
              margin: [40, 8, 40, 0] as [number, number, number, number],
            },
          ]
        : []),
      { text: "── ✻ ──", color: PALETTE.border, alignment: "center", margin: [0, 26, 0, 26] },
      {
        text: `${folderCount} فولدر  ·  ${topicCount} مسألة`,
        font: PDF_FONTS.body,
        fontSize: 11,
        color: PALETTE.muted,
        alignment: "center",
      },
      {
        text: dateLabel,
        font: PDF_FONTS.mono,
        fontFeatures: MONO_NO_LIGATURES,
        fontSize: 9,
        color: PALETTE.subtle,
        alignment: "center",
        margin: [0, 6, 0, 0],
      },
    ],
  };
}

function buildToc(): Content {
  return {
    pageBreak: "after",
    toc: {
      title: { text: "المحتويات", font: PDF_FONTS.heading, bold: true, fontSize: 17, color: PALETTE.text },
      textStyle: { font: PDF_FONTS.body, fontSize: 10, color: PALETTE.text },
      numberStyle: { font: PDF_FONTS.mono, fontFeatures: MONO_NO_LIGATURES, fontSize: 9, color: PALETTE.subtle },
    },
  };
}

function buildTopicSection(topic: Topic, index: number, settings: PdfExportSettings, colWidth: number): Content[] {
  const lang = LANGUAGES[topic.language];
  const items: Content[] = [];

  items.push({
    text: `${index}.  ${topic.title}`,
    font: PDF_FONTS.heading,
    bold: true,
    fontSize: 12.5,
    color: PALETTE.text,
    tocItem: true,
    tocMargin: [14, 1, 0, 1] as [number, number, number, number],
    tocStyle: { fontSize: 9.5 },
    outline: true,
    outlineText: `${index}. ${topic.title}`,
    margin: [0, 10, 0, 3],
    unbreakable: true,
  });

  const metaRuns: Content[] = [{ text: lang.label, bold: true, color: PALETTE.accent }];
  if (topic.complexity) {
    metaRuns.push(
      { text: "   ·   ", color: PALETTE.border },
      { text: topic.complexity, font: PDF_FONTS.mono, fontFeatures: MONO_NO_LIGATURES, fontSize: 8.5, color: PALETTE.jade },
    );
  }
  if (topic.tags.length > 0) {
    metaRuns.push(
      { text: "   ·   ", color: PALETTE.border },
      {
        text: topic.tags.map((t) => `#${t}`).join("  "),
        font: PDF_FONTS.mono,
        fontFeatures: MONO_NO_LIGATURES,
        fontSize: 8.5,
        color: PALETTE.muted,
      },
    );
  }
  items.push({ text: metaRuns, font: PDF_FONTS.body, fontSize: 9, margin: [0, 0, 0, 7] });

  items.push(codeBox(topic.code, topic.language, settings.codeFontSize, PALETTE));
  items.push(...markdownToPdfContent(topic.explanation, settings.codeFontSize, PALETTE));

  items.push({
    canvas: [{ type: "line", x1: 0, y1: 0, x2: colWidth, y2: 0, lineWidth: 0.5, lineColor: PALETTE.border }],
    margin: [0, 8, 0, 6],
  });

  return items;
}

function buildFolderHeading(folder: Folder): Content {
  return {
    text: folder.name,
    font: PDF_FONTS.heading,
    bold: true,
    fontSize: 12.5,
    color: PALETTE.accent,
    tocItem: true,
    tocStyle: { bold: true, color: PALETTE.text, fontSize: 10.5 },
    tocMargin: [0, 8, 0, 2] as [number, number, number, number],
    outline: true,
    outlineText: folder.name,
    margin: [0, 18, 0, 4],
  };
}

export type PdfExportMode = "full" | "single";

function buildDocDefinition(
  topics: Topic[],
  folders: Folder[],
  settings: PdfExportSettings,
  mode: PdfExportMode,
): TDocumentDefinitions {
  const colWidth = columnWidth(settings);

  const topicsByFolder = new Map<string, Topic[]>();
  for (const topic of topics) {
    const list = topicsByFolder.get(topic.folderId);
    if (list) list.push(topic);
    else topicsByFolder.set(topic.folderId, [topic]);
  }

  const bodyContent: Content[] = [];
  let counter = 0;

  if (mode === "single") {
    counter += 1;
    bodyContent.push(...buildTopicSection(topics[0], counter, settings, colWidth));
  } else {
    for (const folder of folders) {
      const folderTopics = topicsByFolder.get(folder.id);
      if (!folderTopics || folderTopics.length === 0) continue;
      bodyContent.push(buildFolderHeading(folder));
      for (const topic of folderTopics) {
        counter += 1;
        bodyContent.push(...buildTopicSection(topic, counter, settings, colWidth));
      }
    }
  }

  if (bodyContent.length === 0) {
    bodyContent.push({
      text: "لا توجد مسائل متضمنة في التصدير.",
      font: PDF_FONTS.body,
      color: PALETTE.muted,
      alignment: "center",
      margin: [0, 40, 0, 0],
    });
  }

  const content: Content[] = [];
  if (mode === "full") {
    const folderCount = new Set(topics.map((t) => t.folderId)).size;
    content.push(buildCover(settings, folderCount, topics.length));
    content.push(buildToc());
  }

  if (settings.columns === 2) {
    content.push({
      columns: [
        { stack: bodyContent, width: "*" },
        { stack: [], width: "*" },
      ],
      columnGap: COLUMN_GAP,
      snakingColumns: true,
    });
  } else {
    content.push({ stack: bodyContent });
  }

  const skipChromeOnPage1 = mode === "full";

  return {
    content,
    pageSize: settings.pageSize,
    pageMargins: [MARGIN_X, settings.showHeaders ? 48 : MARGIN_X, MARGIN_X, settings.showPageNumbers ? 42 : 30],
    defaultStyle: { font: PDF_FONTS.body, fontSize: 10, color: PALETTE.text, alignment: "right" },
    info: {
      title: settings.title || "CodeBank Reference",
      author: "CodeBank",
      creator: "CodeBank",
    },
    header: settings.showHeaders
      ? (currentPage) => {
          if (skipChromeOnPage1 && currentPage <= 2) return undefined;
          return {
            text: settings.title || "CodeBank",
            font: PDF_FONTS.body,
            fontSize: 8,
            color: PALETTE.subtle,
            alignment: "center",
            margin: [MARGIN_X, 22, MARGIN_X, 0],
          };
        }
      : undefined,
    footer: settings.showPageNumbers
      ? (currentPage, pageCount) => {
          if (skipChromeOnPage1 && currentPage === 1) return undefined;
          return {
            text: `${currentPage} / ${pageCount}`,
            font: PDF_FONTS.mono,
            fontFeatures: MONO_NO_LIGATURES,
            fontSize: 8,
            color: PALETTE.subtle,
            alignment: "center",
            margin: [0, 10, 0, 0],
          };
        }
      : undefined,
  };
}

export async function exportPdf(
  topics: Topic[],
  folders: Folder[],
  settings: PdfExportSettings,
  mode: PdfExportMode,
): Promise<void> {
  await ensurePdfFontsRegistered();
  const doc = buildDocDefinition(topics, folders, settings, mode);
  const nameSource = mode === "single" && topics[0] ? topics[0].title : settings.title || "CodeBank-Reference";
  await pdfMake.createPdf(doc).download(`${sanitizeFilename(nameSource)}.pdf`);
}
