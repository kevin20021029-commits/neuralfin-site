import { findDurations, looksLikeTotalLabelLine } from "./ocrSanitizer";

// Two-pass OCR. The full eng+chi_tra+tha worker is needed for category
// names and labels, but it is exactly why latin h/m unit letters misread as
// Thai ท on duration lines. Pass two re-recognizes duration regions with an
// eng-only worker restricted to a digits+h+m whitelist in single-line mode:
// whole lines when they are pure values rows, and just the trailing
// duration words (word-level bboxes) for app rows, so app names keep their
// multilingual read. Resolution order per region: restricted-pass result →
// original text (the parser's ท confusion-form fallback) → drop. Any
// failure here degrades to single-pass behaviour — it never fails a parse.

export type OcrWordBox = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

export type OcrLineBox = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  words: OcrWordBox[];
};

export type RecognizedScreenTime = {
  text: string;
  confidence: number;
  restrictedPassFailed: boolean;
};

export const RESTRICTED_WHITELIST = "0123456789hm";
const RESTRICTED_PAD_PX = 4;

// A line is worth whole-line restriction when it has digits and consists of
// (almost) nothing but duration-shaped tokens — values rows, headline
// values, bare durations.
export function isRestrictableValuesLine(text: string): boolean {
  if (!/\d/.test(text)) return false;
  const residue = text
    .replace(/[0-9hmท:\s.,·•]/gi, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
  return residue.length <= 1;
}

// Samsung right-aligns app-row durations: split the trailing run of
// duration-shaped words ("3", "ท", "16", "ท" / "3h16m") from the name words
// so only the duration region goes through the restricted pass.
const DURATION_WORD = /^[0-9hmท.,:า]{1,7}$/i;

export function splitTrailingDurationWords(words: OcrWordBox[]): { nameWords: OcrWordBox[]; durationWords: OcrWordBox[] } | null {
  let split = words.length;
  while (split > 0 && DURATION_WORD.test(words[split - 1].text)) split -= 1;
  const durationWords = words.slice(split);
  if (durationWords.length === 0 || !durationWords.some((word) => /\d/.test(word.text))) return null;
  if (split === 0) return null; // pure values line — handled whole-line
  return { nameWords: words.slice(0, split), durationWords };
}

// The restricted pass only replaces a region when its output actually
// parses as at least one valid duration; anything else keeps the original
// text so the parser-level fallback still gets its chance. Acceptance is
// lenient on magnitude (week cap) — the parser applies the strict gates.
export function acceptRestrictedLine(candidate: string): string | null {
  const cleaned = candidate.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return findDurations(cleaned, 168).some((match) => match.hours !== null) ? cleaned : null;
}

type RawOcrData = {
  blocks?: Array<{
    paragraphs?: Array<{
      lines?: Array<{
        text?: string;
        bbox?: OcrLineBox["bbox"];
        words?: Array<{ text?: string; bbox?: OcrLineBox["bbox"] }>;
      }>;
    }>;
  }> | null;
};

export function collectOcrLines(data: RawOcrData): OcrLineBox[] {
  const lines: OcrLineBox[] = [];
  for (const block of data.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        const text = (line.text ?? "").replace(/\s+/g, " ").trim();
        if (!text || !line.bbox) continue;
        const words: OcrWordBox[] = [];
        for (const word of line.words ?? []) {
          const wordText = (word.text ?? "").trim();
          if (wordText && word.bbox) words.push({ text: wordText, bbox: word.bbox });
        }
        lines.push({ text, bbox: line.bbox, words });
      }
    }
  }
  return lines;
}

function unionBbox(words: OcrWordBox[]): OcrLineBox["bbox"] {
  return {
    x0: Math.min(...words.map((word) => word.bbox.x0)),
    y0: Math.min(...words.map((word) => word.bbox.y0)),
    x1: Math.max(...words.map((word) => word.bbox.x1)),
    y1: Math.max(...words.map((word) => word.bbox.y1)),
  };
}

function paddedRectangle(bbox: OcrLineBox["bbox"]) {
  return {
    left: Math.max(0, bbox.x0 - RESTRICTED_PAD_PX),
    top: Math.max(0, bbox.y0 - RESTRICTED_PAD_PX),
    width: bbox.x1 - bbox.x0 + RESTRICTED_PAD_PX * 2,
    height: bbox.y1 - bbox.y0 + RESTRICTED_PAD_PX * 2,
  };
}

type TesseractLike = File | Blob | string;

export async function recognizeScreenTime(image: TesseractLike): Promise<RecognizedScreenTime> {
  const mod = await import("tesseract.js");
  // chi_sim matters most for the WeChat/mainland audience: without it the
  // chi_tra model coerces Simplified glyphs and shreds unit tokens
  // (confidence 84 -> 92 with it, measured on a rendered zh category list).
  const fullWorker = await mod.createWorker("eng+chi_sim+chi_tra+tha");
  try {
    const full = await fullWorker.recognize(image, {}, { text: true, blocks: true });
    const confidence = full.data.confidence;
    const lines = collectOcrLines(full.data as RawOcrData);
    if (lines.length === 0) {
      // No line-level bboxes available — single-pass text, parser fallback.
      return { text: full.data.text, confidence, restrictedPassFailed: false };
    }

    type Target =
      | { index: number; kind: "whole"; rectangle: ReturnType<typeof paddedRectangle> }
      | { index: number; kind: "tail"; rectangle: ReturnType<typeof paddedRectangle>; namePrefix: string }
      | { index: number; kind: "anchor-region"; rectangle: ReturnType<typeof paddedRectangle> };

    const targets: Target[] = [];
    lines.forEach((line, index) => {
      if (isRestrictableValuesLine(line.text)) {
        targets.push({ index, kind: "whole", rectangle: paddedRectangle(line.bbox) });
        return;
      }
      if (!/\d/.test(line.text) || line.words.length < 2) return;
      const split = splitTrailingDurationWords(line.words);
      if (!split) return;
      targets.push({
        index,
        kind: "tail",
        rectangle: paddedRectangle(unionBbox(split.durationWords)),
        namePrefix: split.nameWords.map((word) => word.text).join(" "),
      });
    });

    // Anchor-region recovery: big headline numerals next to charts are
    // sometimes missed by the full pass entirely (observed: "Screen time
    // today O" with the 3h26m numeral absent). For a total/average label
    // line with no parseable value on it or on the next line, re-scan the
    // numeral zone directly below the label with the restricted worker.
    const maxX = Math.max(...lines.map((line) => line.bbox.x1));
    const maxY = Math.max(...lines.map((line) => line.bbox.y1));
    lines.forEach((line, index) => {
      if (!looksLikeTotalLabelLine(line.text)) return;
      const hasValue = (text: string) => findDurations(text, 168).some((d) => d.hours !== null);
      if (hasValue(line.text)) return;
      // Only a value the parser could actually ANCHOR suppresses recovery:
      // a leading (prefix-clean) duration on the next line. A legend or app
      // row below the label ("© Instagram 1h38m") is not the total.
      const next = lines[index + 1];
      if (next) {
        const first = findDurations(next.text, 168).find((d) => d.hours !== null);
        if (first && next.text.slice(0, first.index).replace(/[^\p{L}\p{N}]/gu, "").length <= 1) return;
      }
      // Chart glyphs OCR'd into the label line (a donut ring reads as "O")
      // inflate the line bbox to chart height; measure the label from its
      // real words only so the region starts right under the text.
      const labelWords = line.words.filter((word) => word.text.length >= 2);
      const labelBox = labelWords.length > 0 ? unionBbox(labelWords) : line.bbox;
      const labelHeight = labelBox.y1 - labelBox.y0;
      targets.push({
        index,
        kind: "anchor-region",
        rectangle: {
          left: Math.max(0, labelBox.x0 - RESTRICTED_PAD_PX),
          top: labelBox.y1,
          width: Math.min(maxX - labelBox.x0, Math.max((labelBox.x1 - labelBox.x0) * 2.5, 360)),
          height: Math.min(Math.max(0, maxY - labelBox.y1), Math.ceil(labelHeight * 3.5)),
        },
      });
    });

    const replacements = new Map<number, string>();
    const insertions = new Map<number, string>();
    let restrictedPassFailed = false;

    if (targets.length > 0) {
      let restrictedWorker: Awaited<ReturnType<typeof mod.createWorker>> | null = null;
      try {
        restrictedWorker = await mod.createWorker("eng");
        await restrictedWorker.setParameters({
          tessedit_char_whitelist: RESTRICTED_WHITELIST,
          tessedit_pageseg_mode: mod.PSM.SINGLE_LINE,
        });
        for (const target of targets) {
          if (target.rectangle.width <= 8 || target.rectangle.height <= 8) continue;
          try {
            const restricted = await restrictedWorker.recognize(image, { rectangle: target.rectangle });
            const accepted = acceptRestrictedLine(restricted.data.text);
            if (!accepted) continue;
            if (target.kind === "anchor-region") insertions.set(target.index, accepted);
            else replacements.set(target.index, target.kind === "whole" ? accepted : `${target.namePrefix} ${accepted}`);
          } catch {
            // one bad region must not kill the other targets
          }
        }
      } catch {
        // Restricted pass failed entirely — keep the multilingual text; the
        // parser's confusion-form fallback is the safety net.
        replacements.clear();
        insertions.clear();
        restrictedPassFailed = true;
      } finally {
        if (restrictedWorker) await restrictedWorker.terminate();
      }
    }

    return {
      text: lines
        .flatMap((line, index) => {
          const rendered = replacements.get(index) ?? line.text;
          const inserted = insertions.get(index);
          return inserted ? [rendered, inserted] : [rendered];
        })
        .join("\n"),
      confidence,
      restrictedPassFailed,
    };
  } finally {
    await fullWorker.terminate();
  }
}
