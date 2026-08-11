import pdfMake from "pdfmake";
import notoRegularUrl from "@expo-google-fonts/noto-sans-arabic/400Regular/NotoSansArabic_400Regular.ttf";
import notoBoldUrl from "@expo-google-fonts/noto-sans-arabic/700Bold/NotoSansArabic_700Bold.ttf";
import plexRegularUrl from "@expo-google-fonts/ibm-plex-sans-arabic/400Regular/IBMPlexSansArabic_400Regular.ttf";
import plexBoldUrl from "@expo-google-fonts/ibm-plex-sans-arabic/700Bold/IBMPlexSansArabic_700Bold.ttf";
import monoRegularUrl from "@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf";
import monoBoldUrl from "@expo-google-fonts/jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf";
import monoItalicUrl from "@expo-google-fonts/jetbrains-mono/400Regular_Italic/JetBrainsMono_400Regular_Italic.ttf";

/**
 * Font families available inside pdfmake document definitions, registered lazily
 * by `ensurePdfFontsRegistered`. All three are plain .ttf files, not .woff2 — this
 * pdfmake build's bundled fontkit silently fails to render glyphs from .woff2 fonts
 * (no error, but no visible text either), so every embedded PDF font must be a .ttf.
 * The Arabic-capable families are Noto Sans Arabic / IBM Plex Sans Arabic rather than
 * the app's UI fonts (Cairo/Tajawal): pdfmake/pdfkit render plain, unshaped Arabic
 * text correctly on their own (see pdfBuilder.ts for why we don't pre-shape it), but
 * Cairo/Tajawal are still missing a few common glyphs that these two cover fully.
 */
export const PDF_FONTS = {
  heading: "NotoSansArabicPDF",
  body: "IBMPlexArabicPDF",
  mono: "JetBrainsMonoPDF",
} as const;

/**
 * JetBrains Mono's programming-ligature glyphs (e.g. "<<", "->") are composite glyphs
 * that trigger a subsetting bug in this pdfmake build's bundled fontkit (a `DataView`
 * offset write goes out of bounds while re-numbering a composite glyph's components).
 * Disabling contextual/ligature substitution keeps every glyph simple and avoids it —
 * apply this to every piece of text rendered with `PDF_FONTS.mono`. pdfmake's Style
 * type only declares `fontFeatures` as an array (add-only), but its runtime forwards
 * the value straight through to fontkit's `setFeatureOverrides`, which also accepts
 * an object of `{tag: false}` overrides to turn default-on features off — hence the cast.
 */
export const MONO_NO_LIGATURES = {
  calt: false,
  liga: false,
  clig: false,
  dlig: false,
  rlig: false,
} as unknown as PDFKit.Mixins.OpenTypeFeatures[];

async function toBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

let registration: Promise<void> | null = null;

/** Fetches + registers the PDF's embedded fonts with pdfmake. Safe to call repeatedly. */
export function ensurePdfFontsRegistered(): Promise<void> {
  if (!registration) {
    registration = (async () => {
      const [notoRegular, notoBold, plexRegular, plexBold, monoRegular, monoBold, monoItalic] = await Promise.all(
        [notoRegularUrl, notoBoldUrl, plexRegularUrl, plexBoldUrl, monoRegularUrl, monoBoldUrl, monoItalicUrl].map(
          toBase64,
        ),
      );

      pdfMake.addVirtualFileSystem({
        "NotoSansArabic-Regular.ttf": notoRegular,
        "NotoSansArabic-Bold.ttf": notoBold,
        "IBMPlexArabic-Regular.ttf": plexRegular,
        "IBMPlexArabic-Bold.ttf": plexBold,
        "JetBrainsMono-Regular.ttf": monoRegular,
        "JetBrainsMono-Bold.ttf": monoBold,
        "JetBrainsMono-Italic.ttf": monoItalic,
      });

      pdfMake.addFonts({
        [PDF_FONTS.heading]: {
          normal: "NotoSansArabic-Regular.ttf",
          bold: "NotoSansArabic-Bold.ttf",
          italics: "NotoSansArabic-Regular.ttf",
          bolditalics: "NotoSansArabic-Bold.ttf",
        },
        [PDF_FONTS.body]: {
          normal: "IBMPlexArabic-Regular.ttf",
          bold: "IBMPlexArabic-Bold.ttf",
          italics: "IBMPlexArabic-Regular.ttf",
          bolditalics: "IBMPlexArabic-Bold.ttf",
        },
        [PDF_FONTS.mono]: {
          normal: "JetBrainsMono-Regular.ttf",
          bold: "JetBrainsMono-Bold.ttf",
          italics: "JetBrainsMono-Italic.ttf",
          bolditalics: "JetBrainsMono-Bold.ttf",
        },
      });
    })();
  }
  return registration;
}

export default pdfMake;
