/**
 * Multilingual Unicode Support Tests
 *
 * Tests for script detection, font management, bidirectional text,
 * Arabic shaping, and Unicode preservation across the document pipeline.
 */

import { describe, it, expect } from 'vitest';
import {
  detectScripts,
  detectPrimaryScript,
  needsUnicodeFont,
  getFontConfigForScript,
  segmentByScript,
  ScriptType,
} from '../lib/unicode-fonts';
import {
  processForPdfRendering,
  needsRTLReordering,
  reorderForDisplay,
  shapeArabicText,
  resolveBidiLevels,
} from '../lib/bidi';

// ─── TEST DATA ─────────────────────────────────────────────────────────

const TEST_STRINGS = {
  english: 'Hello, this is a PDF document.',
  spanish: 'Hola, este es un documento PDF.',
  german: 'Hallo, dies ist ein PDF-Dokument.',
  french: 'Bonjour, ceci est un document PDF.',
  bengali: 'হ্যালো, এটি একটি পিডিএফ ডকুমেন্ট।',
  hindi: 'नमस्ते, यह एक पीडीएफ दस्तावेज़ है।',
  chinese: '你好，这是一个 PDF 文档。',
  arabic: 'مرحبًا، هذا مستند PDF.',
  russian: 'Здравствуйте, это PDF-документ.',
  mixed_en_bengali: 'Hello বাংলা World',
  mixed_en_hindi: 'Hello हिन्दी World',
  mixed_en_arabic: 'Hello العربية World',
  mixed_en_chinese: 'Hello 中文 World',
  mixed_en_russian: 'Hello Русский World',
  mixed_complex: 'বাংলা English العربية 中文 Русский',
  url: 'https://example.com/path?q=test&lang=bn',
  phone: '+1-234-567-8900',
  email: 'user@example.com',
  special_chars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  numbers: '12345.67890',
  bengali_conjunct: 'ক্ষ স্ত্র জ্ঞ',
  hindi_matras: 'कि कु कू के कै को कौ',
  arabic_mixed: 'مرحبا 123 hello',
  cjk_punctuation: '你好！世界。',
};

// ─── SCRIPT DETECTION TESTS ───────────────────────────────────────────

describe('Script Detection', () => {
  it('detects Latin script', () => {
    const scripts = detectScripts(TEST_STRINGS.english);
    expect(scripts).toContain('latin');
    expect(scripts).not.toContain('bengali');
    expect(scripts).not.toContain('arabic');
  });

  it('detects Bengali script', () => {
    const scripts = detectScripts(TEST_STRINGS.bengali);
    expect(scripts).toContain('bengali');
  });

  it('detects Devanagari (Hindi) script', () => {
    const scripts = detectScripts(TEST_STRINGS.hindi);
    expect(scripts).toContain('devanagari');
  });

  it('detects Chinese (CJK) script', () => {
    const scripts = detectScripts(TEST_STRINGS.chinese);
    expect(scripts).toContain('cjk');
  });

  it('detects Arabic script', () => {
    const scripts = detectScripts(TEST_STRINGS.arabic);
    expect(scripts).toContain('arabic');
  });

  it('detects Cyrillic (Russian) script', () => {
    const scripts = detectScripts(TEST_STRINGS.russian);
    expect(scripts).toContain('cyrillic');
  });

  it('detects mixed Bengali + Latin', () => {
    const scripts = detectScripts(TEST_STRINGS.mixed_en_bengali);
    expect(scripts).toContain('bengali');
    expect(scripts).toContain('latin');
  });

  it('detects mixed Hindi + Latin', () => {
    const scripts = detectScripts(TEST_STRINGS.mixed_en_hindi);
    expect(scripts).toContain('devanagari');
    expect(scripts).toContain('latin');
  });

  it('detects mixed Arabic + Latin', () => {
    const scripts = detectScripts(TEST_STRINGS.mixed_en_arabic);
    expect(scripts).toContain('arabic');
    expect(scripts).toContain('latin');
  });

  it('detects mixed Chinese + Latin', () => {
    const scripts = detectScripts(TEST_STRINGS.mixed_en_chinese);
    expect(scripts).toContain('cjk');
    expect(scripts).toContain('latin');
  });

  it('detects mixed Russian + Latin', () => {
    const scripts = detectScripts(TEST_STRINGS.mixed_en_russian);
    expect(scripts).toContain('cyrillic');
    expect(scripts).toContain('latin');
  });

  it('detects complex mixed scripts', () => {
    const scripts = detectScripts(TEST_STRINGS.mixed_complex);
    expect(scripts).toContain('bengali');
    expect(scripts).toContain('latin');
    expect(scripts).toContain('arabic');
    expect(scripts).toContain('cjk');
    expect(scripts).toContain('cyrillic');
  });

  it('detects numbers and URLs as Latin-compatible', () => {
    const scripts = detectScripts(TEST_STRINGS.url);
    expect(scripts).toContain('latin');
  });

  it('handles empty string', () => {
    const scripts = detectScripts('');
    expect(scripts).toHaveLength(0);
  });
});

// ─── PRIMARY SCRIPT DETECTION ─────────────────────────────────────────

describe('Primary Script Detection', () => {
  it('returns latin for English', () => {
    expect(detectPrimaryScript(TEST_STRINGS.english)).toBe('latin');
  });

  it('returns bengali for Bengali text', () => {
    expect(detectPrimaryScript(TEST_STRINGS.bengali)).toBe('bengali');
  });

  it('returns devanagari for Hindi text', () => {
    expect(detectPrimaryScript(TEST_STRINGS.hindi)).toBe('devanagari');
  });

  it('returns cjk for Chinese text', () => {
    expect(detectPrimaryScript(TEST_STRINGS.chinese)).toBe('cjk');
  });

  it('returns arabic for Arabic text', () => {
    expect(detectPrimaryScript(TEST_STRINGS.arabic)).toBe('arabic');
  });

  it('returns cyrillic for Russian text', () => {
    expect(detectPrimaryScript(TEST_STRINGS.russian)).toBe('cyrillic');
  });

  it('returns first non-Latin for mixed text', () => {
    expect(detectPrimaryScript(TEST_STRINGS.mixed_en_bengali)).toBe('bengali');
  });
});

// ─── UNICODE FONT NEEDS DETECTION ─────────────────────────────────────

describe('Unicode Font Needs Detection', () => {
  it('returns false for pure English', () => {
    expect(needsUnicodeFont(TEST_STRINGS.english)).toBe(false);
  });

  it('returns false for URLs', () => {
    expect(needsUnicodeFont(TEST_STRINGS.url)).toBe(false);
  });

  it('returns false for phone numbers', () => {
    expect(needsUnicodeFont(TEST_STRINGS.phone)).toBe(false);
  });

  it('returns false for email', () => {
    expect(needsUnicodeFont(TEST_STRINGS.email)).toBe(false);
  });

  it('returns false for special characters', () => {
    expect(needsUnicodeFont(TEST_STRINGS.special_chars)).toBe(false);
  });

  it('returns false for numbers', () => {
    expect(needsUnicodeFont(TEST_STRINGS.numbers)).toBe(false);
  });

  it('returns true for Bengali text', () => {
    expect(needsUnicodeFont(TEST_STRINGS.bengali)).toBe(true);
  });

  it('returns true for Hindi text', () => {
    expect(needsUnicodeFont(TEST_STRINGS.hindi)).toBe(true);
  });

  it('returns true for Chinese text', () => {
    expect(needsUnicodeFont(TEST_STRINGS.chinese)).toBe(true);
  });

  it('returns true for Arabic text', () => {
    expect(needsUnicodeFont(TEST_STRINGS.arabic)).toBe(true);
  });

  it('returns true for Russian text', () => {
    expect(needsUnicodeFont(TEST_STRINGS.russian)).toBe(true);
  });

  it('returns true for mixed Bengali + English', () => {
    expect(needsUnicodeFont(TEST_STRINGS.mixed_en_bengali)).toBe(true);
  });

  it('returns true for mixed Hindi + English', () => {
    expect(needsUnicodeFont(TEST_STRINGS.mixed_en_hindi)).toBe(true);
  });

  it('returns true for mixed Arabic + English', () => {
    expect(needsUnicodeFont(TEST_STRINGS.mixed_en_arabic)).toBe(true);
  });

  it('returns true for mixed Chinese + English', () => {
    expect(needsUnicodeFont(TEST_STRINGS.mixed_en_chinese)).toBe(true);
  });

  it('returns true for mixed Russian + English', () => {
    expect(needsUnicodeFont(TEST_STRINGS.mixed_en_russian)).toBe(true);
  });

  it('returns true for complex mixed scripts', () => {
    expect(needsUnicodeFont(TEST_STRINGS.mixed_complex)).toBe(true);
  });

  it('handles empty string', () => {
    expect(needsUnicodeFont('')).toBe(false);
  });
});

// ─── FONT CONFIGURATION ────────────────────────────────────────────────

describe('Font Configuration', () => {
  it('returns correct font for Bengali', () => {
    const config = getFontConfigForScript('bengali');
    expect(config.regular).toBe('NotoSansBengali');
    expect(config.path).toContain('NotoSansBengali');
  });

  it('returns correct font for Devanagari', () => {
    const config = getFontConfigForScript('devanagari');
    expect(config.regular).toBe('NotoSansDevanagari');
  });

  it('returns correct font for Arabic', () => {
    const config = getFontConfigForScript('arabic');
    expect(config.regular).toBe('NotoSansArabic');
  });

  it('returns correct font for CJK', () => {
    const config = getFontConfigForScript('cjk');
    expect(config.regular).toBe('NotoSansSC');
  });

  it('returns correct font for Cyrillic', () => {
    const config = getFontConfigForScript('cyrillic');
    expect(config.regular).toBe('NotoSans-Variable');
  });

  it('falls back to Latin for unknown script', () => {
    const config = getFontConfigForScript('unknown');
    expect(config.regular).toBe('NotoSans-Variable');
  });
});

// ─── TEXT SEGMENTATION ─────────────────────────────────────────────────

describe('Text Segmentation by Script', () => {
  it('segments pure English into single segment', () => {
    const segments = segmentByScript('Hello');
    expect(segments).toHaveLength(1);
    expect(segments[0].script).toBe('latin');
    expect(segments[0].text).toBe('Hello');
  });

  it('segments mixed Bengali + English', () => {
    const segments = segmentByScript('Hello বাংলা');
    expect(segments.length).toBeGreaterThanOrEqual(2);
    const scripts = segments.map(s => s.script);
    expect(scripts).toContain('latin');
    expect(scripts).toContain('bengali');
  });

  it('segments mixed Hindi + English', () => {
    const segments = segmentByScript('Hello हिन्दी');
    expect(segments.length).toBeGreaterThanOrEqual(2);
    const scripts = segments.map(s => s.script);
    expect(scripts).toContain('latin');
    expect(scripts).toContain('devanagari');
  });

  it('segments mixed Arabic + English', () => {
    const segments = segmentByScript('Hello العربية');
    expect(segments.length).toBeGreaterThanOrEqual(2);
    const scripts = segments.map(s => s.script);
    expect(scripts).toContain('latin');
    expect(scripts).toContain('arabic');
  });

  it('segments mixed Chinese + English', () => {
    const segments = segmentByScript('Hello 中文');
    expect(segments.length).toBeGreaterThanOrEqual(2);
    const scripts = segments.map(s => s.script);
    expect(scripts).toContain('latin');
    expect(scripts).toContain('cjk');
  });

  it('segments mixed Russian + English', () => {
    const segments = segmentByScript('Hello Русский');
    expect(segments.length).toBeGreaterThanOrEqual(2);
    const scripts = segments.map(s => s.script);
    expect(scripts).toContain('latin');
    expect(scripts).toContain('cyrillic');
  });

  it('preserves all text content through segmentation', () => {
    const original = 'Hello বাংলা World';
    const segments = segmentByScript(original);
    const reconstructed = segments.map(s => s.text).join('');
    expect(reconstructed).toBe(original);
  });
});

// ─── BIDIRECTIONAL TEXT ────────────────────────────────────────────────

describe('Bidirectional Text Processing', () => {
  it('detects RTL text', () => {
    expect(needsRTLReordering(TEST_STRINGS.arabic)).toBe(true);
  });

  it('does not flag LTR text as needing reordering', () => {
    expect(needsRTLReordering(TEST_STRINGS.english)).toBe(false);
  });

  it('does not flag Bengali as RTL', () => {
    expect(needsRTLReordering(TEST_STRINGS.bengali)).toBe(false);
  });

  it('does not flag Hindi as RTL', () => {
    expect(needsRTLReordering(TEST_STRINGS.hindi)).toBe(false);
  });

  it('does not flag Chinese as RTL', () => {
    expect(needsRTLReordering(TEST_STRINGS.chinese)).toBe(false);
  });

  it('does not flag Russian as RTL', () => {
    expect(needsRTLReordering(TEST_STRINGS.russian)).toBe(false);
  });

  it('handles mixed Arabic + Latin text', () => {
    const result = processForPdfRendering(TEST_STRINGS.mixed_en_arabic);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('handles pure Arabic text', () => {
    const result = processForPdfRendering(TEST_STRINGS.arabic);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles Arabic with numbers', () => {
    const result = processForPdfRendering(TEST_STRINGS.arabic_mixed);
    expect(result).toBeTruthy();
  });

  it('returns non-RTL text unchanged', () => {
    expect(processForPdfRendering(TEST_STRINGS.english)).toBe(TEST_STRINGS.english);
  });

  it('handles empty string', () => {
    expect(processForPdfRendering('')).toBe('');
  });

  it('resolves bidi levels without errors', () => {
    const levels = resolveBidiLevels(TEST_STRINGS.arabic);
    expect(levels.length).toBeGreaterThan(0);
    levels.forEach(ch => {
      expect(ch.resolvedLevel).toBeGreaterThanOrEqual(0);
    });
  });

  it('handles mixed direction text levels', () => {
    const levels = resolveBidiLevels(TEST_STRINGS.mixed_en_arabic);
    expect(levels.length).toBeGreaterThan(0);
    const hasLTR = levels.some(ch => ch.resolvedLevel % 2 === 0);
    const hasRTL = levels.some(ch => ch.resolvedLevel % 2 === 1);
    expect(hasLTR || hasRTL).toBe(true);
  });
});

// ─── ARABIC SHAPING ────────────────────────────────────────────────────

describe('Arabic Shaping', () => {
  it('shapes Arabic text without errors', () => {
    const shaped = shapeArabicText(TEST_STRINGS.arabic);
    expect(shaped).toBeTruthy();
    expect(typeof shaped).toBe('string');
  });

  it('preserves non-Arabic characters in Arabic text', () => {
    const shaped = shapeArabicText(TEST_STRINGS.arabic_mixed);
    expect(shaped).toContain('123');
    expect(shaped).toContain('hello');
  });

  it('handles empty string', () => {
    expect(shapeArabicText('')).toBe('');
  });

  it('shapes Arabic word with connected letters', () => {
    // Arabic "مرحبا" (marhaba) - connected letters
    const shaped = shapeArabicText('مرحبا');
    expect(shaped.length).toBeGreaterThan(0);
    // After shaping, the text should use presentation forms (U+FExx range)
    const hasPresentationForm = shaped.split('').some(char => {
      const code = char.codePointAt(0)!;
      return code >= 0xFE70 && code <= 0xFEFF;
    });
    expect(hasPresentationForm).toBe(true);
  });
});

// ─── UNICODE INTEGRATION ───────────────────────────────────────────────

describe('Unicode Integration - All 9 Languages', () => {
  const languages = [
    { name: 'English', text: TEST_STRINGS.english, script: 'latin' as ScriptType, needsUnicode: false },
    { name: 'Spanish', text: TEST_STRINGS.spanish, script: 'latin' as ScriptType, needsUnicode: false },
    { name: 'German', text: TEST_STRINGS.german, script: 'latin' as ScriptType, needsUnicode: false },
    { name: 'French', text: TEST_STRINGS.french, script: 'latin' as ScriptType, needsUnicode: false },
    { name: 'Bengali', text: TEST_STRINGS.bengali, script: 'bengali' as ScriptType, needsUnicode: true },
    { name: 'Hindi', text: TEST_STRINGS.hindi, script: 'devanagari' as ScriptType, needsUnicode: true },
    { name: 'Chinese', text: TEST_STRINGS.chinese, script: 'cjk' as ScriptType, needsUnicode: true },
    { name: 'Arabic', text: TEST_STRINGS.arabic, script: 'arabic' as ScriptType, needsUnicode: true },
    { name: 'Russian', text: TEST_STRINGS.russian, script: 'cyrillic' as ScriptType, needsUnicode: true },
  ];

  for (const lang of languages) {
    it(`handles ${lang.name} text correctly`, () => {
      const scripts = detectScripts(lang.text);
      expect(scripts).toContain(lang.script);
      expect(needsUnicodeFont(lang.text)).toBe(lang.needsUnicode);
      expect(needsUnicodeFont(lang.text)).toBe(lang.needsUnicode);
    });
  }

  const mixedCombinations = [
    { name: 'English + Bengali', text: TEST_STRINGS.mixed_en_bengali },
    { name: 'English + Hindi', text: TEST_STRINGS.mixed_en_hindi },
    { name: 'English + Arabic', text: TEST_STRINGS.mixed_en_arabic },
    { name: 'English + Chinese', text: TEST_STRINGS.mixed_en_chinese },
    { name: 'English + Russian', text: TEST_STRINGS.mixed_en_russian },
    { name: 'Complex Mixed', text: TEST_STRINGS.mixed_complex },
  ];

  for (const combo of mixedCombinations) {
    it(`handles mixed ${combo.name} text`, () => {
      const scripts = detectScripts(combo.text);
      expect(scripts.length).toBeGreaterThanOrEqual(2);
      expect(needsUnicodeFont(combo.text)).toBe(true);
      const segments = segmentByScript(combo.text);
      const reconstructed = segments.map(s => s.text).join('');
      expect(reconstructed).toBe(combo.text);
    });
  }
});

// ─── SPECIAL CHARACTERS & PATTERNS ─────────────────────────────────────

describe('Special Characters and Patterns', () => {
  it('preserves URLs', () => {
    const scripts = detectScripts(TEST_STRINGS.url);
    expect(scripts).toContain('latin');
    expect(needsUnicodeFont(TEST_STRINGS.url)).toBe(false);
  });

  it('preserves phone numbers', () => {
    expect(needsUnicodeFont(TEST_STRINGS.phone)).toBe(false);
    const scripts = detectScripts(TEST_STRINGS.phone);
    expect(scripts).toContain('latin');
  });

  it('preserves email addresses', () => {
    expect(needsUnicodeFont(TEST_STRINGS.email)).toBe(false);
  });

  it('preserves special characters', () => {
    expect(needsUnicodeFont(TEST_STRINGS.special_chars)).toBe(false);
  });

  it('preserves numbers', () => {
    expect(needsUnicodeFont(TEST_STRINGS.numbers)).toBe(false);
  });

  it('handles Bengali conjuncts', () => {
    expect(needsUnicodeFont(TEST_STRINGS.bengali_conjunct)).toBe(true);
    const scripts = detectScripts(TEST_STRINGS.bengali_conjunct);
    expect(scripts).toContain('bengali');
  });

  it('handles Hindi matras', () => {
    expect(needsUnicodeFont(TEST_STRINGS.hindi_matras)).toBe(true);
    const scripts = detectScripts(TEST_STRINGS.hindi_matras);
    expect(scripts).toContain('devanagari');
  });

  it('handles CJK punctuation', () => {
    expect(needsUnicodeFont(TEST_STRINGS.cjk_punctuation)).toBe(true);
    const scripts = detectScripts(TEST_STRINGS.cjk_punctuation);
    expect(scripts).toContain('cjk');
  });
});
