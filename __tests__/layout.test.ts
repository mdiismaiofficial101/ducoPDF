import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { pdfToWord, pdfToExcel, ocrPdf, ocrToEditablePDF } from '@/lib/pdf-tools';
import { readFile } from 'node:fs/promises';

async function createWordFixture(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fontkit = (await import('@pdf-lib/fontkit')).default;
  pdf.registerFontkit(fontkit);
  const fontBytes = await readFile('public/fonts/NotoSans-Regular.ttf');
  const font = await pdf.embedFont(fontBytes);

  const page = pdf.addPage([612, 792]);
  page.drawText('Q3 Financial Report', { x: 72, y: 750, size: 28, font });
  page.drawText('Revenue Summary', { x: 72, y: 680, size: 18, font });
  page.drawText('The company reported strong growth during the quarter.', { x: 72, y: 640, size: 12, font });
  page.drawText('Revenue grew by 12% compared to the previous period.', { x: 72, y: 620, size: 12, font });
  page.drawText('Operating costs remained stable across all divisions.', { x: 72, y: 600, size: 12, font });
  return pdf.save();
}

async function createTableFixture(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fontkit = (await import('@pdf-lib/fontkit')).default;
  pdf.registerFontkit(fontkit);
  const fontBytes = await readFile('public/fonts/NotoSans-Regular.ttf');
  const font = await pdf.embedFont(fontBytes);

  const page = pdf.addPage([612, 792]);
  const cells: Array<[string, number, number]> = [
    ['Name', 72, 720], ['Amount', 288, 720], ['Status', 450, 720],
    ['Alice', 72, 680], ['100', 288, 680], ['Paid', 450, 680],
    ['Bob', 72, 640], ['250', 288, 640], ['Pending', 450, 640],
    ['Carol', 72, 600], ['75', 288, 600], ['Refunded', 450, 600],
  ];
  for (const [text, x, y] of cells) {
    page.drawText(text, { x, y, size: 12, font });
  }
  return pdf.save();
}

describe('pdfToWord (layout-aware)', () => {
  it('produces a valid docx containing all text', async () => {
    const input = await createWordFixture();
    const file = new File([input as unknown as BlobPart], 'report.pdf', { type: 'application/pdf' });
    const result = await pdfToWord(file);
    expect(result.name).toBe('report.docx');

    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const xml = await zip.file('word/document.xml')!.async('string');
    expect(xml).toContain('Q3 Financial Report');
    expect(xml).toContain('Revenue Summary');
    expect(xml).toContain('grew by 12%');
  });

  it('marks the title and heading with heading styles', async () => {
    const input = await createWordFixture();
    const file = new File([input as unknown as BlobPart], 'report.pdf', { type: 'application/pdf' });
    const result = await pdfToWord(file);
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const xml = await zip.file('word/document.xml')!.async('string');
    expect(xml).toContain('Title');
    expect(xml).toContain('Heading1');
    expect(xml).toContain('Heading2');
  });
});

describe('pdfToExcel (table detection)', () => {
  it('detects column boundaries and builds a grid', async () => {
    const input = await createTableFixture();
    const file = new File([input as unknown as BlobPart], 'table.pdf', { type: 'application/pdf' });
    const result = await pdfToExcel(file);
    expect(result.name).toBe('table.xlsx');

    const wb = XLSX.read(new Uint8Array(await result.blob.arrayBuffer()), { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    expect(XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })).toEqual([
      ['Name', 'Amount', 'Status'],
      ['Alice', '100', 'Paid'],
      ['Bob', '250', 'Pending'],
      ['Carol', '75', 'Refunded'],
    ]);
  });

  it('keeps rows aligned even when a column is empty on some rows', async () => {
    const pdf = await PDFDocument.create();
    const fontkit = (await import('@pdf-lib/fontkit')).default;
    pdf.registerFontkit(fontkit);
    const fontBytes = await readFile('public/fonts/NotoSans-Regular.ttf');
    const font = await pdf.embedFont(fontBytes);
    const page = pdf.addPage([612, 792]);
    const cells: Array<[string, number, number]> = [
      ['Product', 72, 720], ['Qty', 288, 720],
      ['Widget', 72, 680], ['5', 288, 680],
      ['Gadget', 72, 640],
    ];
    for (const [text, x, y] of cells) {
      page.drawText(text, { x, y, size: 12, font });
    }
    const file = new File([await pdf.save() as unknown as BlobPart], 'sparse.pdf', { type: 'application/pdf' });
    const result = await pdfToExcel(file);
    const wb = XLSX.read(new Uint8Array(await result.blob.arrayBuffer()), { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    expect(XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })).toEqual([
      ['Product', 'Qty'],
      ['Widget', '5'],
      ['Gadget', ''],
    ]);
  });
});

describe('OCR (selectable-text fast path)', () => {
  async function createTextOnlyFixture(): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const fontkit = (await import('@pdf-lib/fontkit')).default;
    pdf.registerFontkit(fontkit);
    const fontBytes = await readFile('public/fonts/NotoSans-Regular.ttf');
    const font = await pdf.embedFont(fontBytes);
    const page = pdf.addPage([612, 792]);
    page.drawText('This is a born-digital document.', { x: 72, y: 720, size: 14, font });
    page.drawText('It already has selectable text.', { x: 72, y: 700, size: 14, font });
    return pdf.save();
  }

  it('ocrPdf returns existing text without loading tesseract', async () => {
    const input = await createTextOnlyFixture();
    const file = new File([input as unknown as BlobPart], 'digital.pdf', { type: 'application/pdf' });
    let progressCalled = false;
    const text = await ocrPdf(file, () => { progressCalled = true; });
    expect(text).toContain('born-digital document');
    expect(text).toContain('selectable text');
    expect(progressCalled).toBe(false);
  });

  it('ocrToEditablePDF keeps vector pages for text-only PDFs', async () => {
    const input = await createTextOnlyFixture();
    const file = new File([input as unknown as BlobPart], 'digital.pdf', { type: 'application/pdf' });
    const result = await ocrToEditablePDF(file);
    expect(result.name).toBe('searchable_digital.pdf');
    const wb = await PDFDocument.load(await result.blob.arrayBuffer());
    expect(wb.getPageCount()).toBe(1);
  });
});