import { describe, it, expect, beforeAll } from 'vitest';
import { createCanvas, Path2D as CanvasPath2D } from '@napi-rs/canvas';
import { PDFDocument } from 'pdf-lib';
import { redactPDF } from '@/lib/pdf-tools';
import { readFile } from 'node:fs/promises';

class FakeCanvas {
  private _canvas: any;
  constructor() { this._canvas = createCanvas(1, 1); }
  set width(v: number) { this._canvas.width = v; }
  get width() { return this._canvas.width; }
  set height(v: number) { this._canvas.height = v; }
  get height() { return this._canvas.height; }
  getContext(type: string) { return this._canvas.getContext(type); }
  toBlob(cb: (b: Blob | null) => void, type?: string, quality?: number) {
    try {
      const buf = this._canvas.toBuffer(type === 'image/jpeg' ? 'image/jpeg' : 'image/png', Math.round((quality ?? 0.9) * 100));
      cb(new Blob([buf as unknown as BlobPart]));
    } catch { cb(null); }
  }
}

beforeAll(() => {
  (globalThis as any).Path2D = CanvasPath2D;
  (globalThis as any).document = { createElement: (t: string) => (t === 'canvas' ? new FakeCanvas() : {}) };
  const origFetch = (globalThis as any).fetch;
  (globalThis as any).fetch = (input: any, init?: any) => {
    if (typeof input === 'string' && input.startsWith('file://')) {
      const { readFile } = require('node:fs/promises');
      const { fileURLToPath } = require('node:url');
      return readFile(fileURLToPath(input)).then(buf => new Response(buf));
    }
    return origFetch(input, init);
  };
});

async function createRedactFixture(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fontkit = (await import('@pdf-lib/fontkit')).default;
  pdf.registerFontkit(fontkit);
  const fontBytes = await readFile('public/fonts/NotoSans-Regular.ttf');
  const font = await pdf.embedFont(fontBytes);
  const page1 = pdf.addPage([612, 792]);
  page1.drawText('TOP SECRET DATA 2026', { x: 100, y: 700, size: 24, font });
  page1.drawText('Payment: $50,000 transferred to account 123456789', { x: 100, y: 650, size: 14, font });
  const page2 = pdf.addPage([612, 792]);
  page2.drawText('PUBLIC INFO - all good here', { x: 100, y: 700, size: 24, font });
  return pdf.save();
}

async function extractText(bytes: Uint8Array): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    parts.push(tc.items.map((it: any) => it.str).join(' '));
  }
  return parts.join(' | ');
}

describe('redactPDF (byte-level)', () => {
  it('redacted word is no longer extractable from the output', async () => {
    const input = await createRedactFixture();
    const file = new File([input as unknown as BlobPart], 'secret.pdf', { type: 'application/pdf' });
    const result = await redactPDF(file, ['SECRET']);
    const text = await extractText(new Uint8Array(await result.blob.arrayBuffer()));
    expect(text.toLowerCase()).not.toContain('secret');
    await expect(PDFDocument.load(await result.blob.arrayBuffer())).resolves.toBeTruthy();
  });

  it('pages without matches keep their selectable text', async () => {
    const input = await createRedactFixture();
    const file = new File([input as unknown as BlobPart], 'secret.pdf', { type: 'application/pdf' });
    const result = await redactPDF(file, ['SECRET']);
    const text = await extractText(new Uint8Array(await result.blob.arrayBuffer()));
    expect(text).toContain('PUBLIC INFO');
    expect(text.toLowerCase()).not.toContain('secret');
  });

  it('rejects empty word lists', async () => {
    const input = await createRedactFixture();
    const file = new File([input as unknown as BlobPart], 'secret.pdf', { type: 'application/pdf' });
    await expect(redactPDF(file, ['   '])).rejects.toThrow();
  });

  it('case-insensitive match across multiple words', async () => {
    const input = await createRedactFixture();
    const file = new File([input as unknown as BlobPart], 'secret.pdf', { type: 'application/pdf' });
    const result = await redactPDF(file, ['payment', 'account']);
    const text = await extractText(new Uint8Array(await result.blob.arrayBuffer()));
    expect(text.toLowerCase()).not.toContain('payment');
    expect(text.toLowerCase()).not.toContain('account');
    expect(text.toLowerCase()).not.toContain('secret');
  });
});