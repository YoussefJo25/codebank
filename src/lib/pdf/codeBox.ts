import type { Content } from "pdfmake/interfaces";
import { highlightToRuns } from "./highlightRuns";
import { MONO_NO_LIGATURES, PDF_FONTS } from "./pdfFonts";
import type { Language } from "../../types";

export interface CodeBoxPalette {
  codeBg: string;
  border: string;
  text: string;
}

/** Renders source code as a bordered, filled box of real colored text (not an image) — paginates cleanly since it's a single-row table cell. */
export function codeBox(code: string, language: Language | null, fontSize: number, palette: CodeBoxPalette): Content {
  const trimmed = code.replace(/\n+$/, "");
  const runs = language
    ? highlightToRuns(trimmed, language).map((r) => ({
        text: r.text,
        color: r.color,
        bold: r.bold,
        italics: r.italics,
      }))
    : [{ text: trimmed || " ", color: palette.text }];

  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            text: runs,
            font: PDF_FONTS.mono,
            fontFeatures: MONO_NO_LIGATURES,
            fontSize,
            lineHeight: 1.35,
            fillColor: palette.codeBg,
            alignment: "left",
            margin: [10, 8, 10, 8],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => palette.border,
      vLineColor: () => palette.border,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
    margin: [0, 2, 0, 10],
  };
}
