/**
 * Unicode Bidirectional Text (UBA) and Arabic Shaping
 *
 * Implements a simplified Unicode Bidirectional Algorithm for proper
 * RTL/LTR text rendering in PDFs. Includes Arabic presentation forms
 * for connected letter rendering.
 *
 * Based on Unicode Standard Annex #9 (UBA) and Unicode Standard
 * Annex #41 (Arabic).
 */

// ─── BIDI CHARACTER TYPES (simplified) ────────────────────────────────

const enum BidiType {
  L = 'L',       // Left-to-Right
  R = 'R',       // Right-to-Left
  AL = 'AL',     // Right-to-Left Arabic
  EN = 'EN',     // European Number
  ES = 'ES',     // European Separator
  ET = 'ET',     // European Terminator
  AN = 'AN',     // Arabic Number
  CS = 'CS',     // Common Separator
  NSM = 'NSM',   // Nonspacing Mark
  BN = 'BN',     // Boundary Neutral
  B = 'B',       // Paragraph Separator
  S = 'S',       // Segment Separator
  WS = 'WS',     // Whitespace
  ON = 'ON',     // Other Neutral
  LRE = 'LRE',   // Left-to-Right Embedding
  RLE = 'RLE',   // Right-to-Left Embedding
  PDF = 'PDF',   // Pop Directional Format
  LRO = 'LRO',   // Left-to-Right Override
  RLO = 'RLO',   // Right-to-Left Override
  LRI = 'LRI',   // Left-to-Right Isolate
  RLI = 'RLI',   // Right-to-Left Isolate
  FSI = 'FSI',   // First Strong Isolate
  PDI = 'PDI',   // Pop Directional Isolate
}

/**
 * Get the Bidi class of a character (simplified mapping).
 */
function getBidiType(char: string): BidiType {
  const code = char.codePointAt(0)!;

  // Arabic ranges
  if (
    (code >= 0x0600 && code <= 0x06FF) ||
    (code >= 0x0750 && code <= 0x077F) ||
    (code >= 0x08A0 && code <= 0x08FF) ||
    (code >= 0xFB50 && code <= 0xFDFF) ||
    (code >= 0xFE70 && code <= 0xFEFF)
  ) {
    return BidiType.AL;
  }

  // Hebrew ranges (RTL)
  if (code >= 0x0590 && code <= 0x05FF) return BidiType.R;
  if (code >= 0xFB1D && code <= 0xFB4F) return BidiType.R;

  // Devanagari, Bengali, etc. (LTR as per UBA, but RTL-aware rendering)
  if (code >= 0x0900 && code <= 0x09FF) return BidiType.L;
  if (code >= 0x0980 && code <= 0x09FF) return BidiType.L;
  if (code >= 0x0A00 && code <= 0x0A7F) return BidiType.L;
  if (code >= 0x0B00 && code <= 0x0B7F) return BidiType.L;
  if (code >= 0x0C00 && code <= 0x0C7F) return BidiType.L;
  if (code >= 0x0D00 && code <= 0x0D7F) return BidiType.L;

  // CJK (LTR)
  if (
    (code >= 0x4E00 && code <= 0x9FFF) ||
    (code >= 0x3400 && code <= 0x4DBF) ||
    (code >= 0x3000 && code <= 0x303F) ||
    (code >= 0x3040 && code <= 0x309F) ||
    (code >= 0x30A0 && code <= 0x30FF) ||
    (code >= 0xAC00 && code <= 0xD7AF) ||
    (code >= 0xF900 && code <= 0xFAFF)
  ) {
    return BidiType.L;
  }

  // European numbers
  if (code >= 0x0030 && code <= 0x0039) return BidiType.EN; // 0-9
  if (code >= 0x2020 && code <= 0x2029) return BidiType.ON;
  if (code >= 0x00A0 && code <= 0x00BF) return BidiType.ON; // Latin punctuation
  if (code >= 0x2000 && code <= 0x206F) return BidiType.ON; // General punctuation
  if (code >= 0x2070 && code <= 0x209F) return BidiType.EN; // Superscripts/subscripts
  if (code >= 0x2150 && code <= 0x218F) return BidiType.ON; // Number forms

  // Whitespace
  if (code === 0x0020 || code === 0x0009 || code === 0x000A || code === 0x000D) return BidiType.WS;
  if (code >= 0x2000 && code <= 0x200B) return BidiType.WS;

  // Latin letters
  if (code >= 0x0041 && code <= 0x005A) return BidiType.L; // A-Z
  if (code >= 0x0061 && code <= 0x007A) return BidiType.L; // a-z
  if (code >= 0x00C0 && code <= 0x024F) return BidiType.L; // Extended Latin
  if (code >= 0x1E00 && code <= 0x1EFF) return BidiType.L; // Latin Extended Additional

  // Cyrillic
  if (code >= 0x0400 && code <= 0x04FF) return BidiType.L;
  if (code >= 0x0500 && code <= 0x052F) return BidiType.L;

  // Default: treat as neutral
  return BidiType.ON;
}

/**
 * Check if a Bidi type is RTL.
 */
function isRTL(type: BidiType): boolean {
  return type === BidiType.R || type === BidiType.AL;
}

/**
 * Check if a Bidi type is LTR.
 */
function isLTR(type: BidiType): boolean {
  return type === BidiType.L || type === BidiType.EN || type === BidiType.AN;
}

// ─── BIDI ALGORITHM (simplified) ──────────────────────────────────────

export interface BidiChar {
  char: string;
  type: BidiType;
  resolvedLevel: number;
}

/**
 * Resolve embedding levels for a string of text.
 * This is a simplified implementation of the Unicode Bidi Algorithm (UBA).
 *
 * Returns an array of characters with their resolved embedding levels.
 * Level 0 = LTR, Level 1 = RTL.
 */
export function resolveBidiLevels(text: string): BidiChar[] {
  if (!text) return [];

  const chars: BidiChar[] = [];
  for (const char of text) {
    if (char === '\n' || char === '\r') continue;
    chars.push({
      char,
      type: getBidiType(char),
      resolvedLevel: 0,
    });
  }

  if (chars.length === 0) return [];

  // Determine paragraph embedding level
  let paragraphLevel = 0;
  for (const ch of chars) {
    if (isRTL(ch.type)) {
      paragraphLevel = 1;
      break;
    }
  }

  // X1-X8: Process explicit embedding levels (simplified)
  let embeddingLevel = paragraphLevel;
  for (const ch of chars) {
    ch.resolvedLevel = embeddingLevel;
  }

  // W1-W7: Resolve weak types
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch.type === BidiType.NSM) {
      ch.resolvedLevel = i > 0 ? chars[i - 1].resolvedLevel : paragraphLevel;
    }
  }

  // Resolve European and Arabic numbers
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch.type === BidiType.EN) {
      let prevLevel = paragraphLevel;
      for (let j = i - 1; j >= 0; j--) {
        if (chars[j].resolvedLevel !== 0) {
          prevLevel = chars[j].resolvedLevel;
          break;
        }
      }
      ch.resolvedLevel = prevLevel;
    }
    if (ch.type === BidiType.AN) {
      ch.resolvedLevel = 1; // Arabic numbers always level 1
    }
  }

  // N1-N2: Resolve neutral types
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch.type === BidiType.ON || ch.type === BidiType.WS || ch.type === BidiType.B || ch.type === BidiType.S) {
      const prevLevel = i > 0 ? chars[i - 1].resolvedLevel : paragraphLevel;
      const nextLevel = i < chars.length - 1 ? chars[i + 1].resolvedLevel : paragraphLevel;
      if (prevLevel === nextLevel) {
        ch.resolvedLevel = prevLevel;
      } else {
        ch.resolvedLevel = paragraphLevel;
      }
    }
  }

  // I1-I2: Resolve implicit levels
  for (const ch of chars) {
    if (ch.resolvedLevel % 2 === 0) {
      // LTR: even level
      if (isRTL(ch.type)) {
        ch.resolvedLevel += 1;
      }
    } else {
      // RTL: odd level
      if (ch.type !== BidiType.NSM) {
        ch.resolvedLevel += 1;
      }
    }
  }

  return chars;
}

/**
 * Reorder a string for visual display (used when drawing text left-to-right
 * in the PDF, but the text should visually appear RTL).
 *
 * For each run of RTL characters, reverses them. For mixed text, segments
 * are reversed within their RTL runs.
 */
export function reorderForDisplay(text: string): string {
  const chars = resolveBidiLevels(text);
  if (chars.length === 0) return text;

  const hasRTL = chars.some(c => c.resolvedLevel % 2 === 1);
  if (!hasRTL) return text;

  // Group by runs of same direction
  const runs: BidiChar[][] = [];
  let currentRun: BidiChar[] = [chars[0]];

  for (let i = 1; i < chars.length; i++) {
    const prevIsRTL = currentRun[currentRun.length - 1].resolvedLevel % 2 === 1;
    const currIsRTL = chars[i].resolvedLevel % 2 === 1;
    if (prevIsRTL === currIsRTL) {
      currentRun.push(chars[i]);
    } else {
      runs.push(currentRun);
      currentRun = [chars[i]];
    }
  }
  runs.push(currentRun);

  // Reverse RTL runs
  const result: string[] = [];
  for (const run of runs) {
    if (run[0].resolvedLevel % 2 === 1) {
      result.push(...run.reverse().map(c => c.char));
    } else {
      result.push(...run.map(c => c.char));
    }
  }

  return result.join('');
}

/**
 * For a complex script, check if it needs visual reordering for PDF rendering.
 * Scripts like Arabic and Hebrew need their characters drawn right-to-left.
 */
export function needsRTLReordering(text: string): boolean {
  for (const char of text) {
    if (isRTL(getBidiType(char))) return true;
  }
  return false;
}

// ─── ARABIC SHAPING ───────────────────────────────────────────────────

/**
 * Arabic character forms for shaping.
 * Maps: isolated -> initial -> medial -> final
 */
interface ArabicForms {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

const ARABIC_FORMS: Record<string, ArabicForms> = {
  '\u0621': { isolated: '\uFE80', initial: '\uFE80', medial: '\uFE80', final: '\uFE80' }, // HAMZA
  '\u0622': { isolated: '\uFE81', initial: '\uFE81', medial: '\uFE82', final: '\uFE82' }, // ALEF WITH MADDA ABOVE
  '\u0623': { isolated: '\uFE83', initial: '\uFE83', medial: '\uFE84', final: '\uFE84' }, // ALEF WITH HAMZA ABOVE
  '\u0624': { isolated: '\uFE85', initial: '\uFE85', medial: '\uFE86', final: '\uFE86' }, // WAW WITH HAMZA ABOVE
  '\u0625': { isolated: '\uFE87', initial: '\uFE87', medial: '\uFE88', final: '\uFE88' }, // ALEF WITH HAMZA BELOW
  '\u0626': { isolated: '\uFE89', initial: '\uFE8B', medial: '\uFE8C', final: '\uFE8A' }, // YEH WITH HAMZA ABOVE
  '\u0627': { isolated: '\uFE8D', initial: '\uFE8D', medial: '\uFE8E', final: '\uFE8E' }, // ALEF
  '\u0628': { isolated: '\uFE8F', initial: '\uFE91', medial: '\uFE92', final: '\uFE90' }, // BEH
  '\u0629': { isolated: '\uFE93', initial: '\uFE93', medial: '\uFE93', final: '\uFE94' }, // TEH MARBUTA
  '\u062A': { isolated: '\uFE95', initial: '\uFE97', medial: '\uFE98', final: '\uFE96' }, // TEH
  '\u062B': { isolated: '\uFE99', initial: '\uFE9B', medial: '\uFE9C', final: '\uFE9A' }, // THEH
  '\u062C': { isolated: '\uFE9D', initial: '\uFE9F', medial: '\uFEA0', final: '\uFE9E' }, // JEEM
  '\u062D': { isolated: '\uFEA1', initial: '\uFEA3', medial: '\uFEA4', final: '\uFEA2' }, // HAH
  '\u062E': { isolated: '\uFEA5', initial: '\uFEA7', medial: '\uFEA8', final: '\uFEA6' }, // KHAH
  '\u062F': { isolated: '\uFEA9', initial: '\uFEA9', medial: '\uFEA9', final: '\uFEAA' }, // DAL
  '\u0630': { isolated: '\uFEAB', initial: '\uFEAB', medial: '\uFEAB', final: '\uFEAC' }, // THAL
  '\u0631': { isolated: '\uFEAD', initial: '\uFEAD', medial: '\uFEAD', final: '\uFEAE' }, // REH
  '\u0632': { isolated: '\uFEAF', initial: '\uFEAF', medial: '\uFEAF', final: '\uFEB0' }, // ZAIN
  '\u0633': { isolated: '\uFEB1', initial: '\uFEB3', medial: '\uFEB4', final: '\uFEB2' }, // SEEN
  '\u0634': { isolated: '\uFEB5', initial: '\uFEB7', medial: '\uFEB8', final: '\uFEB6' }, // SHEEN
  '\u0635': { isolated: '\uFEB9', initial: '\uFEBB', medial: '\uFEBC', final: '\uFEBA' }, // SAD
  '\u0636': { isolated: '\uFEBD', initial: '\uFEBF', medial: '\uFEC0', final: '\uFEBE' }, // DAD
  '\u0637': { isolated: '\uFEC1', initial: '\uFEC3', medial: '\uFEC4', final: '\uFEC2' }, // TAH
  '\u0638': { isolated: '\uFEC5', initial: '\uFEC7', medial: '\uFEC8', final: '\uFEC6' }, // ZAH
  '\u0639': { isolated: '\uFEC9', initial: '\uFECB', medial: '\uFECC', final: '\uFECA' }, // AIN
  '\u063A': { isolated: '\uFECD', initial: '\uFECF', medial: '\uFED0', final: '\uFECE' }, // GHAIN
  '\u0640': { isolated: '\u0640', initial: '\u0640', medial: '\u0640', final: '\u0640' }, // TATWEEL (connecting)
  '\u0641': { isolated: '\uFED1', initial: '\uFED3', medial: '\uFED4', final: '\uFED2' }, // FEH
  '\u0642': { isolated: '\uFED5', initial: '\uFED7', medial: '\uFED8', final: '\uFED6' }, // QAF
  '\u0643': { isolated: '\uFED9', initial: '\uFEDB', medial: '\uFEDC', final: '\uFEDA' }, // KAF
  '\u0644': { isolated: '\uFEDD', initial: '\uFEDF', medial: '\uFEE0', final: '\uFEDE' }, // LAM
  '\u0645': { isolated: '\uFEE1', initial: '\uFEE3', medial: '\uFEE4', final: '\uFEE2' }, // MEEM
  '\u0646': { isolated: '\uFEE5', initial: '\uFEE7', medial: '\uFEE8', final: '\uFEE6' }, // NOON
  '\u0647': { isolated: '\uFEE9', initial: '\uFEEB', medial: '\uFEEC', final: '\uFEEA' }, // HEH
  '\u0648': { isolated: '\uFEED', initial: '\uFEED', medial: '\uFEED', final: '\uFEEE' }, // WAW
  '\u0649': { isolated: '\uFEEF', initial: '\uFEF3', medial: '\uFEF4', final: '\uFEF0' }, // ALEF MAKSURA
  '\u064A': { isolated: '\uFEF1', initial: '\uFEF3', medial: '\uFEF4', final: '\uFEF2' }, // YEH
  '\u0671': { isolated: '\uFB50', initial: '\uFB50', medial: '\uFB50', final: '\uFB51' }, // ALEF WASLA
  '\u0677': { isolated: '\uFB53', initial: '\uFB53', medial: '\uFB53', final: '\uFB54' }, // U WITH HAMZA ABOVE
  '\u0679': { isolated: '\uFB57', initial: '\uFB5B', medial: '\uFB5C', final: '\uFB58' }, // TTEH
  '\u067A': { isolated: '\uFB5D', initial: '\uFB5F', medial: '\uFB60', final: '\uFB5E' }, // TEHEH
  '\u067E': { isolated: '\uFB57', initial: '\uFB59', medial: '\uFB5A', final: '\uFB58' }, // PEH
  '\u0683': { isolated: '\uFB5D', initial: '\uFB5F', medial: '\uFB60', final: '\uFB5E' }, // NYEH
  '\u0686': { isolated: '\uFB77', initial: '\uFB79', medial: '\uFB7A', final: '\uFB78' }, // TCHEH
  '\u0688': { isolated: '\uFB81', initial: '\uFB81', medial: '\uFB81', final: '\uFB82' }, // DDAL
  '\u068C': { isolated: '\uFB85', initial: '\uFB85', medial: '\uFB85', final: '\uFB86' }, // DAHAL
  '\u0691': { isolated: '\uFB8D', initial: '\uFB8D', medial: '\uFB8D', final: '\uFB8E' }, // RREH
  '\u0698': { isolated: '\uFB8B', initial: '\uFB8B', medial: '\uFB8B', final: '\uFB8C' }, // JEH
  '\u06A4': { isolated: '\uFB65', initial: '\uFB67', medial: '\uFB68', final: '\uFB66' }, // VEH
  '\u06A6': { isolated: '\uFB69', initial: '\uFB6B', medial: '\uFB6C', final: '\uFB6A' }, // PEHEH
  '\u06A9': { isolated: '\uFB8F', initial: '\uFB91', medial: '\uFB92', final: '\uFB90' }, // KEHEH
  '\u06AD': { isolated: '\uFB93', initial: '\uFB95', medial: '\uFB96', final: '\uFB94' }, // NG
  '\u06AF': { isolated: '\uFB97', initial: '\uFB99', medial: '\uFB9A', final: '\uFB98' }, // GAF
  '\u06B1': { isolated: '\uFB9B', initial: '\uFB9D', medial: '\uFB9E', final: '\uFB9C' }, // NGOEH
  '\u06B3': { isolated: '\uFB9F', initial: '\uFBA1', medial: '\uFBA2', final: '\uFBA0' }, // GUEH
  '\u06BA': { isolated: '\uFB9F', initial: '\uFB9F', medial: '\uFB9F', final: '\uFBA0' }, // NOON GHUNNA
  '\u06BB': { isolated: '\uFBA1', initial: '\uFBA3', medial: '\uFBA4', final: '\uFBA2' }, // RNOON
  '\u06BE': { isolated: '\uFBA7', initial: '\uFBA9', medial: '\uFBAA', final: '\uFBA8' }, // HEH DOACHASHMEE
  '\u06C0': { isolated: '\uFBAF', initial: '\uFBAF', medial: '\uFBAF', final: '\uFBB0' }, // HEH WITH YEH ABOVE
  '\u06C1': { isolated: '\uFBB1', initial: '\uFBB3', medial: '\uFBB4', final: '\uFBB2' }, // HEH GOAL
  '\u06CC': { isolated: '\uFBFD', initial: '\uFBFF', medial: '\uFC00', final: '\uFBFE' }, // FARSI YEH
  '\u06D0': { isolated: '\uFBE8', initial: '\uFBEA', medial: '\uFBEB', final: '\uFBE9' }, // E
  '\u06D2': { isolated: '\uFBE5', initial: '\uFBE7', medial: '\uFBE8', final: '\uFBE6' }, // YEH BARREE
  '\u06D3': { isolated: '\uFBE9', initial: '\uFBEB', medial: '\uFBEC', final: '\uFBEA' }, // YEH BARREE WITH HAMZA ABOVE
};

/**
 * Check if an Arabic character connects to the left (has a medial/final form).
 */
function connectsToLeft(char: string): boolean {
  const forms = ARABIC_FORMS[char];
  if (!forms) return false;
  return forms.initial !== forms.isolated;
}

/**
 * Check if an Arabic character connects to the right.
 */
function connectsToRight(char: string): boolean {
  const forms = ARABIC_FORMS[char];
  if (!forms) return false;
  return forms.final !== forms.isolated;
}

/**
 * Apply Arabic shaping to a word (sequence of Arabic characters).
 * Converts each character to its appropriate presentation form based on
 * its position in the connected sequence.
 */
export function shapeArabicWord(word: string): string {
  const chars = Array.from(word);
  if (chars.length === 0) return word;

  const result: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const forms = ARABIC_FORMS[char];

    if (!forms) {
      result.push(char);
      continue;
    }

    const prevConnects = i > 0 && connectsToLeft(chars[i - 1]);
    const nextConnects = i < chars.length - 1 && connectsToRight(chars[i + 1]);

    if (prevConnects && nextConnects) {
      // Medial form
      result.push(forms.medial);
    } else if (prevConnects) {
      // Final form (connected from right)
      result.push(forms.final);
    } else if (nextConnects) {
      // Initial form (connected to left)
      result.push(forms.initial);
    } else {
      // Isolated form
      result.push(forms.isolated);
    }
  }

  return result.join('');
}

/**
 * Shape a full Arabic text string, handling words and non-Arabic segments.
 */
export function shapeArabicText(text: string): string {
  const result: string[] = [];
  let arabicBuffer = '';

  for (const char of text) {
    const code = char.codePointAt(0)!;
    const isArabicChar =
      (code >= 0x0600 && code <= 0x06FF) ||
      (code >= 0x0750 && code <= 0x077F) ||
      (code >= 0x08A0 && code <= 0x08FF) ||
      (code >= 0xFB50 && code <= 0xFDFF) ||
      (code >= 0xFE70 && code <= 0xFEFF);

    if (isArabicChar) {
      arabicBuffer += char;
    } else {
      if (arabicBuffer) {
        result.push(shapeArabicWord(arabicBuffer));
        arabicBuffer = '';
      }
      result.push(char);
    }
  }

  if (arabicBuffer) {
    result.push(shapeArabicWord(arabicBuffer));
  }

  return result.join('');
}

/**
 * Process text for PDF rendering:
 * 1. Apply Arabic shaping
 * 2. Apply bidirectional reordering
 *
 * For non-Arabic text, returns the text as-is.
 */
export function processForPdfRendering(text: string): string {
  if (!text) return text;

  const hasArabic = text.split('').some(char => {
    const code = char.codePointAt(0)!;
    return (
      (code >= 0x0600 && code <= 0x06FF) ||
      (code >= 0x0750 && code <= 0x077F) ||
      (code >= 0x08A0 && code <= 0x08FF) ||
      (code >= 0xFB50 && code <= 0xFDFF) ||
      (code >= 0xFE70 && code <= 0xFEFF)
    );
  });

  if (!hasArabic) return text;

  let processed = shapeArabicText(text);
  processed = reorderForDisplay(processed);
  return processed;
}
