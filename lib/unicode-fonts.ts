/**
 * Centralized Multilingual Unicode Font Management System
 *
 * Provides script detection, lazy font loading, caching, and font registration
 * for both pdf-lib and jsPDF libraries. Supports Latin, Bengali, Devanagari,
 * Arabic, Cyrillic, CJK (Chinese), and extensible to additional scripts.
 */

import { PDFDocument, PDFFont } from 'pdf-lib';
import jsPDF from 'jspdf';

// ─── SCRIPT DETECTION ──────────────────────────────────────────────────

export type ScriptType =
  | 'latin'
  | 'bengali'
  | 'devanagari'
  | 'arabic'
  | 'cyrillic'
  | 'cjk'
  | 'thai'
  | 'hangul'
  | 'kana'
  | 'georgian'
  | 'armenian'
  | 'ethiopic'
  | 'tibetan'
  | 'myanmar'
  | 'khmer'
  | 'unknown';

interface ScriptRange {
  script: ScriptType;
  ranges: [number, number][];
}

const SCRIPT_RANGES: ScriptRange[] = [
  { script: 'bengali', ranges: [[0x0980, 0x09FF]] },
  { script: 'devanagari', ranges: [[0x0900, 0x097F], [0xA8E0, 0xA8FF]] },
  { script: 'arabic', ranges: [[0x0600, 0x06FF], [0x0750, 0x077F], [0x08A0, 0x08FF], [0xFB50, 0xFDFF], [0xFE70, 0xFEFF]] },
  { script: 'cyrillic', ranges: [[0x0400, 0x04FF], [0x0500, 0x052F], [0x2DE0, 0x2DFF], [0xA640, 0xA69F]] },
  { script: 'cjk', ranges: [[0x4E00, 0x9FFF], [0x3400, 0x4DBF], [0x20000, 0x2A6DF], [0x2A700, 0x2B73F], [0x2B740, 0x2B81F], [0x2B820, 0x2CEAF], [0xF900, 0xFAFF], [0x2F800, 0x2FA1F]] },
  { script: 'hangul', ranges: [[0xAC00, 0xD7AF], [0x1100, 0x11FF], [0x3130, 0x318F]] },
  { script: 'kana', ranges: [[0x3040, 0x309F], [0x30A0, 0x30FF], [0x31F0, 0x31FF], [0x1B000, 0x1B001]] },
  { script: 'thai', ranges: [[0x0E00, 0x0E7F]] },
  { script: 'georgian', ranges: [[0x10A0, 0x10FF], [0x2D00, 0x2D2F]] },
  { script: 'armenian', ranges: [[0x0530, 0x058F], [0xFB00, 0xFB06]] },
  { script: 'ethiopic', ranges: [[0x1200, 0x137F], [0x1380, 0x139F], [0x2D80, 0x2DDF], [0xAB00, 0xAB2F]] },
  { script: 'tibetan', ranges: [[0x0F00, 0x0FFF]] },
  { script: 'myanmar', ranges: [[0x1000, 0x109F], [0xAA60, 0xAA7F]] },
  { script: 'khmer', ranges: [[0x1780, 0x17FF], [0x19E0, 0x19FF]] },
  { script: 'latin', ranges: [[0x0000, 0x007F], [0x0080, 0x00FF], [0x0100, 0x024F], [0x0250, 0x02AF], [0x1E00, 0x1EFF], [0x2C60, 0x2C7F], [0xA720, 0xA7FF]] },
];

function isInRanges(code: number, ranges: [number, number][]): boolean {
  for (const [start, end] of ranges) {
    if (code >= start && code <= end) return true;
  }
  return false;
}

/**
 * Detect all scripts present in a text string.
 * Returns an array of unique script types found, ordered by priority
 * (non-Latin scripts first, Latin last as fallback).
 */
export function detectScripts(text: string): ScriptType[] {
  const found = new Set<ScriptType>();
  for (const char of text) {
    const code = char.codePointAt(0)!;
    for (const { script, ranges } of SCRIPT_RANGES) {
      if (isInRanges(code, ranges)) {
        found.add(script);
      }
    }
  }
  const scripts = Array.from(found);
  const latinIndex = scripts.indexOf('latin');
  if (latinIndex > -1) scripts.splice(latinIndex, 1);
  if (found.has('latin')) scripts.push('latin');
  return scripts;
}

/**
 * Detect the primary (dominant) script of a text string.
 * Returns the first non-Latin script found, or 'latin' if only Latin chars.
 */
export function detectPrimaryScript(text: string): ScriptType {
  const scripts = detectScripts(text);
  return scripts[0] || 'latin';
}

/**
 * Check if a script requires a non-Latin font.
 */
export function isNonLatinScript(script: ScriptType): boolean {
  return script !== 'latin' && script !== 'unknown';
}

// ─── FONT CONFIGURATION ────────────────────────────────────────────────

interface FontConfig {
  regular: string;
  bold?: string;
  path: string;
}

const SCRIPT_FONT_MAP: Record<string, FontConfig> = {
  latin: { regular: 'NotoSans-Regular', path: '/fonts/NotoSans-Regular.ttf', bold: 'NotoSans-Bold' },
  cyrillic: { regular: 'NotoSans-Regular', path: '/fonts/NotoSans-Regular.ttf', bold: 'NotoSans-Bold' },
  bengali: { regular: 'NotoSansBengali-Regular', path: '/fonts/NotoSansBengali-Regular.ttf' },
  devanagari: { regular: 'NotoSansDevanagari-Regular', path: '/fonts/NotoSansDevanagari-Regular.ttf' },
  arabic: { regular: 'NotoSansArabic-Regular', path: '/fonts/NotoSansArabic-Regular.ttf' },
  cjk: { regular: 'NotoSansSC-Regular', path: '/fonts/NotoSansSC-Regular.ttf' },
  hangul: { regular: 'NotoSansSC-Regular', path: '/fonts/NotoSansSC-Regular.ttf' },
  kana: { regular: 'NotoSansJP-Regular', path: '/fonts/NotoSansJP-Regular.ttf' },
};

/**
 * Get the font configuration for a given script.
 * Falls back to Latin if no specific font is configured.
 */
export function getFontConfigForScript(script: ScriptType): FontConfig {
  return SCRIPT_FONT_MAP[script] || SCRIPT_FONT_MAP.latin;
}

/**
 * Get all font configurations needed for a set of scripts.
 */
export function getFontConfigsForScripts(scripts: ScriptType[]): FontConfig[] {
  const seen = new Set<string>();
  const configs: FontConfig[] = [];
  for (const script of scripts) {
    const config = getFontConfigForScript(script);
    if (!seen.has(config.path)) {
      seen.add(config.path);
      configs.push(config);
    }
  }
  return configs;
}

// ─── FONT CACHING ──────────────────────────────────────────────────────

const fontByteCache = new Map<string, ArrayBuffer>();

/**
 * Fetch font bytes from the public directory with caching.
 * Uses the browser's fetch API to load from /fonts/.
 */
export async function fetchFontBytes(fontPath: string): Promise<ArrayBuffer> {
  if (fontByteCache.has(fontPath)) {
    return fontByteCache.get(fontPath)!;
  }
  const response = await fetch(fontPath);
  if (!response.ok) {
    throw new Error(`Failed to load font from ${fontPath}: ${response.statusText}`);
  }
  const bytes = await response.arrayBuffer();
  fontByteCache.set(fontPath, bytes);
  return bytes;
}

/**
 * Preload a font into the cache without using it.
 */
export async function preloadFont(fontPath: string): Promise<void> {
  await fetchFontBytes(fontPath);
}

/**
 * Clear the font cache (useful for testing).
 */
export function clearFontCache(): void {
  fontByteCache.clear();
}

// ─── PDF-LIB FONT MANAGEMENT ──────────────────────────────────────────

const pdfLibFontCache = new Map<string, PDFFont>();

/**
 * Get or embed a Unicode font for pdf-lib based on detected scripts.
 * Returns the most appropriate PDFFont for the given text.
 *
 * For mixed-script text, returns the font that covers the primary
 * non-Latin script (which typically also covers Latin characters).
 */
export async function getUnicodeFontForPdfLib(
  text: string,
  pdfDoc: PDFDocument
): Promise<PDFFont> {
  const scripts = detectScripts(text);
  const primaryScript = scripts[0] || 'latin';
  const config = getFontConfigForScript(primaryScript);

  const cacheKey = `${config.path}_${pdfDoc.context.toString().length}`;

  if (pdfLibFontCache.has(cacheKey)) {
    return pdfLibFontCache.get(cacheKey)!;
  }

  const fontBytes = await fetchFontBytes(config.path);
  const font = await pdfDoc.embedFont(fontBytes);
  pdfLibFontCache.set(cacheKey, font);
  return font;
}

/**
 * Get a specific font for a known script (pdf-lib).
 */
export async function getFontForScriptPdfLib(
  script: ScriptType,
  pdfDoc: PDFDocument
): Promise<PDFFont> {
  const config = getFontConfigForScript(script);
  const cacheKey = `script_${config.path}`;

  if (pdfLibFontCache.has(cacheKey)) {
    return pdfLibFontCache.get(cacheKey)!;
  }

  const fontBytes = await fetchFontBytes(config.path);
  const font = await pdfDoc.embedFont(fontBytes);
  pdfLibFontCache.set(cacheKey, font);
  return font;
}

/**
 * Get regular and bold font objects for pdf-lib based on text script.
 * Returns { regular, bold } where bold may be the same as regular
 * if no bold font is configured for the script.
 */
export async function getUnicodeFontPairPdfLib(
  text: string,
  pdfDoc: PDFDocument
): Promise<{ regular: PDFFont; bold: PDFFont }> {
  const scripts = detectScripts(text);
  const primaryScript = scripts[0] || 'latin';
  const config = getFontConfigForScript(primaryScript);

  const regularKey = `${config.path}_reg_${pdfDoc.context.toString().length}`;
  let regular = pdfLibFontCache.get(regularKey) as PDFFont | undefined;
  if (!regular) {
    const regBytes = await fetchFontBytes(config.path);
    regular = await pdfDoc.embedFont(regBytes);
    pdfLibFontCache.set(regularKey, regular);
  }

  const boldPath = config.bold ? `/fonts/${config.bold}.ttf` : config.path;
  const boldKey = `${boldPath}_bold_${pdfDoc.context.toString().length}`;
  let bold = pdfLibFontCache.get(boldKey) as PDFFont | undefined;
  if (!bold) {
    const boldBytes = await fetchFontBytes(boldPath);
    bold = await pdfDoc.embedFont(boldBytes);
    pdfLibFontCache.set(boldKey, bold);
  }

  return { regular, bold };
}

// ─── JSPDF FONT MANAGEMENT ────────────────────────────────────────────

const jspdfRegisteredFonts = new Set<string>();

/**
 * Register a Unicode font with jsPDF.
 * jsPDF requires fonts to be registered via addFont before use.
 * The font is loaded from the public directory.
 *
 * Returns the font family name to use with doc.setFont().
 */
export async function registerUnicodeFontJsPDF(
  doc: jsPDF,
  text: string
): Promise<string> {
  const scripts = detectScripts(text);
  const primaryScript = scripts[0] || 'latin';
  const config = getFontConfigForScript(primaryScript);

  if (primaryScript === 'latin') {
    return 'helvetica';
  }

  const fontName = config.regular;
  const fontId = `${fontName}_regular`;

  if (!jspdfRegisteredFonts.has(fontId)) {
    const fontBytes = await fetchFontBytes(config.path);
    const base64 = arrayBufferToBase64(fontBytes);
    doc.addFileToVFS(fontName + '.ttf', base64);
    doc.addFont(fontName + '.ttf', fontName, 'normal');
    jspdfRegisteredFonts.add(fontId);
  }

  return fontName;
}

/**
 * Register multiple fonts for mixed-script text with jsPDF.
 * Returns a mapping of script -> font name.
 */
export async function registerAllFontsForText(
  doc: jsPDF,
  text: string
): Promise<Map<ScriptType, string>> {
  const scripts = detectScripts(text);
  const result = new Map<ScriptType, string>();

  for (const script of scripts) {
    if (script === 'latin') {
      result.set(script, 'helvetica');
    } else {
      const fontName = await registerUnicodeFontJsPDF(doc, text);
      result.set(script, fontName);
    }
  }

  if (!result.has('latin')) {
    result.set('latin', 'helvetica');
  }

  return result;
}

// ─── TEXT RENDERING HELPERS ────────────────────────────────────────────

/**
 * Split mixed-script text into segments by script.
 * Each segment contains consecutive characters of the same script.
 */
export interface TextSegment {
  text: string;
  script: ScriptType;
}

export function segmentByScript(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let currentScript: ScriptType | null = null;
  let currentText = '';

  for (const char of text) {
    const code = char.codePointAt(0)!;
    let charScript: ScriptType = 'unknown';
    for (const { script, ranges } of SCRIPT_RANGES) {
      if (isInRanges(code, ranges)) {
        charScript = script;
        break;
      }
    }

    if (charScript === 'unknown' || charScript === currentScript) {
      currentText += char;
      if (charScript !== 'unknown') currentScript = charScript;
    } else {
      if (currentText) {
        segments.push({ text: currentText, script: currentScript || 'latin' });
      }
      currentText = char;
      currentScript = charScript;
    }
  }

  if (currentText) {
    segments.push({ text: currentText, script: currentScript || 'latin' });
  }

  return segments;
}

/**
 * Check if text contains any non-Latin (non-Helvetica-compatible) characters.
 */
export function needsUnicodeFont(text: string): boolean {
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code > 0x024F) return true;
  }
  return false;
}

// ─── UTILITIES ─────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Get the width of text at a given font size.
 * For pdf-lib fonts, uses the font's built-in width calculation.
 */
export function getTextWidth(
  text: string,
  fontSize: number,
  font: PDFFont
): number {
  return font.widthOfTextAtSize(text, fontSize);
}

/**
 * Split text into lines that fit within a given width.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: PDFFont
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
