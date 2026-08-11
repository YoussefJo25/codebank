import { createLowlight } from "lowlight";
import cpp from "highlight.js/lib/languages/cpp";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import type { Element, RootContent } from "hast";
import type { Language } from "../../types";
import { LANGUAGES } from "../languages";

const lowlight = createLowlight({ cpp, python, java, javascript });

export interface CodeRun {
  text: string;
  color: string;
  bold?: boolean;
  italics?: boolean;
}

const CODE_INK = "#2b2620";

/** Print-friendly syntax palette — tuned for a light code box in the exported PDF. */
const CLASS_COLORS: Record<string, { color: string; bold?: boolean; italics?: boolean }> = {
  "hljs-keyword": { color: "#b3541e", bold: true },
  "hljs-built_in": { color: "#8a4b13" },
  "hljs-type": { color: "#8a4b13" },
  "hljs-literal": { color: "#0f7a6a" },
  "hljs-number": { color: "#0f7a6a" },
  "hljs-operator": { color: "#5a5245" },
  "hljs-punctuation": { color: "#5a5245" },
  "hljs-property": { color: "#1c5f8a" },
  "hljs-regexp": { color: "#0f7a6a" },
  "hljs-string": { color: "#146b5c" },
  "hljs-char": { color: "#146b5c" },
  "hljs-escape": { color: "#146b5c" },
  "hljs-subst": { color: CODE_INK },
  "hljs-symbol": { color: "#0f7a6a" },
  "hljs-class": { color: "#8a4b13", bold: true },
  "hljs-function": { color: "#1c5f8a" },
  "hljs-variable": { color: CODE_INK },
  "hljs-title": { color: "#1c5f8a", bold: true },
  "hljs-title.class_": { color: "#8a4b13", bold: true },
  "hljs-title.function_": { color: "#1c5f8a", bold: true },
  "hljs-params": { color: CODE_INK },
  "hljs-comment": { color: "#8a8271", italics: true },
  "hljs-doctag": { color: "#8a8271", italics: true },
  "hljs-meta": { color: "#a13f5c" },
  "hljs-meta-string": { color: "#146b5c" },
  "hljs-section": { color: "#b3541e", bold: true },
  "hljs-tag": { color: "#b3541e" },
  "hljs-name": { color: "#b3541e" },
  "hljs-attr": { color: "#1c5f8a" },
  "hljs-attribute": { color: "#1c5f8a" },
  "hljs-bullet": { color: CODE_INK },
  "hljs-addition": { color: "#146b5c" },
  "hljs-deletion": { color: "#a13f5c" },
  "hljs-selector-tag": { color: "#b3541e" },
  "hljs-selector-id": { color: "#1c5f8a" },
  "hljs-selector-class": { color: "#1c5f8a" },
  "hljs-template-variable": { color: "#a13f5c" },
  "hljs-template-tag": { color: "#a13f5c" },
  "hljs-formula": { color: "#0f7a6a" },
};

function resolveStyle(className: string[] | undefined, inherited: { color: string; bold?: boolean; italics?: boolean }) {
  if (!className || className.length === 0) return inherited;
  for (const cls of className) {
    const match = CLASS_COLORS[cls];
    if (match) return { color: match.color, bold: match.bold, italics: match.italics };
  }
  return inherited;
}

function walk(
  nodes: RootContent[],
  inherited: { color: string; bold?: boolean; italics?: boolean },
  out: CodeRun[],
) {
  for (const node of nodes) {
    if (node.type === "text") {
      if (node.value.length === 0) continue;
      out.push({ text: node.value, color: inherited.color, bold: inherited.bold, italics: inherited.italics });
    } else if (node.type === "element") {
      const el = node as Element;
      const classNames = (el.properties?.className as string[] | undefined) ?? undefined;
      const style = resolveStyle(classNames, inherited);
      walk(el.children as RootContent[], style, out);
    }
  }
}

/** Tokenizes source code into pdfmake-ready colored text runs for the given language. */
export function highlightToRuns(code: string, language: Language): CodeRun[] {
  const alias = LANGUAGES[language].hljsAlias;
  const out: CodeRun[] = [];
  try {
    const tree = lowlight.highlight(alias, code);
    walk(tree.children as RootContent[], { color: CODE_INK }, out);
  } catch {
    out.push({ text: code, color: CODE_INK });
  }
  if (out.length === 0) out.push({ text: code || " ", color: CODE_INK });
  return out;
}
