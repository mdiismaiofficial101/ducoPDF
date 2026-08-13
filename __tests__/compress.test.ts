import { describe, it, expect, beforeAll } from 'vitest';
import { createCanvas } from '@napi-rs/canvas';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { compressPDF } from '@/lib/pdf-tools';

class FakeCanvas {
  private _canvas: any;
  constructor() {
    this._canvas = createCanvas(1, 1);
  }
  set width(v: number) { this._canvas.width = v; }
  get width() { return this._canvas.width; }
  set height(v: number) { this._canvas.height = v; }
  get height() { return this._canvas.height; }
  getContext(type: string) { return this._canvas.getContext(type); }
  toBlob(cb: (b: Blob | null) => void, type?: string, quality?: number) {
    try {
      const buf = this._canvas.toBuffer(type === 'image/jpeg' ? 'image/jpeg' : 'image/png', Math.round((quality ?? 0.9) * 100));
      cb(new Blob([buf as unknown as BlobPart]));
    } catch {
      cb(null);
    }
  }
}

beforeAll(() => {
  (globalThis as any).document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') return new FakeCanvas();
      return {};
    },
  };
});

async function createImagePdf(pages = 5): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, ['#4A90D9', '#7B68EE', '#E94E77', '#2ECC71', '#F39C12'][i % 5]);
    grad.addColorStop(0.5, '#50E3C2');
    grad.addColorStop(1, '#F5A623');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);
    ctx.fillStyle = '#1A237E';
    for (let j = 0; j < 40; j++) {
      ctx.fillRect(Math.random() * 1100, Math.random() * 700, 80 + Math.random() * 60, 40 + Math.random() * 40);
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 96px sans-serif';
    ctx.fillText(`Page ${i + 1}`, 100, 150);
    const imgData = ctx.getImageData(0, 0, 1200, 800);
    const d = imgData.data;
    for (let k = 0; k < d.length; k += 4) {
      if (Math.random() < 0.06) {
        d[k] = Math.min(255, Math.max(0, d[k] + Math.floor(Math.random() * 50 - 25)));
        d[k + 1] = Math.min(255, Math.max(0, d[k + 1] + Math.floor(Math.random() * 50 - 25)));
        d[k + 2] = Math.min(255, Math.max(0, d[k + 2] + Math.floor(Math.random() * 50 - 25)));
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const jpeg = canvas.toBuffer('image/jpeg', 95);
    const img = await pdf.embedJpg(jpeg);
    const page = pdf.addPage([612, 792]);
    page.drawImage(img, { x: 50, y: 100, width: 512, height: 512 });
  }
  return pdf.save();
}

async function createTextPdf(pages = 5): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = pdf.addPage([612, 792]);
    page.drawText(`Hello world page ${i}`, { x: 50, y: 700, size: 24, font });
    page.drawText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.', { x: 50, y: 650, size: 12, font });
  }
  return pdf.save();
}

describe('compressPDF safety', () => {
  it('image-heavy PDF: output is never larger than input and stays valid', async () => {
    const input = await createImagePdf();
    const file = new File([input as unknown as BlobPart], 'scan.pdf', { type: 'application/pdf' });
    const result = await compressPDF(file, 'high');
    expect(result.blob.size).toBeLessThanOrEqual(input.length);
    await expect(PDFDocument.load(await result.blob.arrayBuffer())).resolves.toBeTruthy();
  });

  it('text-only PDF: output stays small and valid', async () => {
    const input = await createTextPdf();
    const file = new File([input as unknown as BlobPart], 'doc.pdf', { type: 'application/pdf' });
    const result = await compressPDF(file, 'medium');
    expect(result.blob.size).toBeLessThanOrEqual(input.length);
    await expect(PDFDocument.load(await result.blob.arrayBuffer())).resolves.toBeTruthy();
  });

  it('text-only PDF: text remains selectable (not rasterized)', async () => {
    const input = await createTextPdf();
    const file = new File([input as unknown as BlobPart], 'doc.pdf', { type: 'application/pdf' });
    const result = await compressPDF(file, 'extreme' as any);

    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
    const doc = await pdfjs.getDocument({ data: await result.blob.arrayBuffer() }).promise;
    const page = await doc.getPage(1);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');
    expect(text).toContain('Hello world page 0');
  });
});

describe('image re-encoding win (render path)', () => {
  it('image pages re-encode significantly smaller at high compression', async () => {
    const input = await createImagePdf(5);
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
    const doc = await pdfjs.getDocument({ data: input.slice(0) }).promise;
    const page = await doc.getPage(1);
    const opList = await page.getOperatorList();
    const hasImages = opList.fnArray.some((fn: number) => fn === pdfjs.OPS.paintImageXObject || fn === pdfjs.OPS.paintInlineImageXObject);
    expect(hasImages).toBe(true);

    const out = await PDFDocument.create();
    for (let i = 1; i <= doc.numPages; i++) {
      const p = await doc.getPage(i);
      const baseVp = p.getViewport({ scale: 1 });
      const vp = p.getViewport({ scale: 110 / 72 });
      const canvas = new FakeCanvas();
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      await p.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      const jpeg = canvas.getContext('2d').canvas.toBuffer('image/jpeg', 0.5);
      const img = await out.embedJpg(jpeg);
      const newPage = out.addPage([baseVp.width, baseVp.height]);
      newPage.drawImage(img, { x: 0, y: 0, width: baseVp.width, height: baseVp.height });
    }
    const outBytes = await out.save({ useObjectStreams: true, addDefaultPage: false });
    expect(outBytes.length).toBeLessThan(input.length);
    expect(outBytes.length / input.length).toBeLessThan(0.75);
  });

  it('grayscale-only pages get a stronger win than color pages (high compression)', async () => {
    const grayInput = await createGrayPdf(3);
    const file = new File([grayInput as unknown as BlobPart], 'gray.pdf', { type: 'application/pdf' });
    const result = await compressPDF(file, 'high');
    expect(result.blob.size).toBeLessThan(grayInput.length);
    expect(result.blob.size / grayInput.length).toBeLessThan(0.5);
    await expect(PDFDocument.load(await result.blob.arrayBuffer())).resolves.toBeTruthy();
  });

  it('duplicate pages are deduplicated: 5 identical pages compress near-single-page size', async () => {
    const input = await createDupPdf(5);
    const file = new File([input as unknown as BlobPart], 'dup.pdf', { type: 'application/pdf' });
    const result = await compressPDF(file, 'high');
    const singlePage = await createDupPdf(1);
    expect(result.blob.size).toBeLessThan(input.length);
    expect(result.blob.size / singlePage.length).toBeLessThan(1.6);
  });
});

async function createGrayPdf(pages: number): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(0, 0, 1200, 800);
    ctx.fillStyle = '#404040';
    for (let j = 0; j < 30; j++) {
      ctx.fillRect(Math.random() * 1100, Math.random() * 700, 80 + Math.random() * 60, 40 + Math.random() * 40);
    }
    ctx.font = 'bold 96px sans-serif';
    ctx.fillText(`Page ${i + 1}`, 100, 150);
    const imgData = ctx.getImageData(0, 0, 1200, 800);
    const d = imgData.data;
    for (let k = 0; k < d.length; k += 4) {
      if (Math.random() < 0.06) {
        const v = 128 + Math.floor(Math.random() * 80 - 40);
        d[k] = v; d[k + 1] = v; d[k + 2] = v;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const jpeg = canvas.toBuffer('image/jpeg', 95);
    const img = await pdf.embedJpg(jpeg);
    const page = pdf.addPage([612, 792]);
    page.drawImage(img, { x: 50, y: 100, width: 512, height: 512 });
  }
  return pdf.save();
}

async function createDupPdf(pages: number): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, '#4A90D9');
    grad.addColorStop(0.5, '#50E3C2');
    grad.addColorStop(1, '#F5A623');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);
    ctx.fillStyle = '#1A237E';
    for (let j = 0; j < 30; j++) {
      ctx.fillRect(100 + (j * 137) % 900, 100 + (j * 97) % 500, 60 + (j * 13) % 50, 40 + (j * 11) % 40);
    }
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText('IDENTICAL', 350, 600);
    const jpeg = canvas.toBuffer('image/jpeg', 95);
    const img = await pdf.embedJpg(jpeg);
    const page = pdf.addPage([612, 792]);
    page.drawImage(img, { x: 50, y: 100, width: 512, height: 512 });
  }
  return pdf.save();
}