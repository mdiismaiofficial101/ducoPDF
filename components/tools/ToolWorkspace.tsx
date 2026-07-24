'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { 
  FileMinus, FileText, MonitorPlay, Table, Image as ImageIcon, 
  Unlock, Lock, SlidersHorizontal, AlignLeft, Layers, Scissors, 
  Type, Box, FileCode, Edit3, Scan, FormInput, Languages, 
  Workflow, PenTool, ShieldCheck, Download, Loader2, ArrowLeft, 
  CheckCircle2, AlertCircle, RefreshCw, Trash2, Camera, Plus, Trash, GripVertical,
  Globe, Search, Eye, Shield, FileUser, Palette, LayoutTemplate, HelpCircle
} from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

import JSZip from 'jszip';
import { addProcessingHistory } from '@/lib/auth';
import AdBanner from '@/components/AdBanner';
import { compressPDF, pdfToWord, pdfToExcel, pdfToPpt, comparePDFs, ocrPdf, pdfToMarkdown, createPdfForm, FormFieldDef, executeWorkflow, WorkflowStep, translatePDF, ocrToEditablePDF, checkPasswordStrength, PasswordStrengthResult, generateResumePDF, ResumeData, applySmartWatermark, WatermarkConfig } from '@/lib/pdf-tools';
import { needsUnicodeFont, registerUnicodeFontJsPDF, getUnicodeFontForPdfLib } from '@/lib/unicode-fonts';
import { processForPdfRendering, needsRTLReordering } from '@/lib/bidi';


interface ToolConfig {
  name: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
}

const toolsData: Record<string, ToolConfig> = {
  'compress': { name: 'Compress PDF', description: 'Reduce file size while optimizing for maximal PDF quality.', icon: FileMinus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'word-to-pdf': { name: 'Word to PDF', description: 'Convert .docx files into perfectly readable PDF documents.', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  'pdf-to-word': { name: 'PDF to Word', description: 'Convert PDF files into customizable and editable DOCX text outlines.', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  'jpg-to-pdf': { name: 'JPG to PDF', description: 'Convert images to PDF. Adjust layouts and margins in seconds.', icon: ImageIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
  'pdf-to-jpg': { name: 'PDF to JPG', description: 'Convert PDF pages into high-quality JPEG images.', icon: ImageIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
  'protect': { name: 'Protect PDF', description: 'Add password security to restrict copying or viewing.', icon: Lock, color: 'text-rose-600', bg: 'bg-rose-50' },
  'unlock': { name: 'Unlock PDF', description: 'Decrypt protected PDFs by removing security passwords.', icon: Unlock, color: 'text-rose-600', bg: 'bg-rose-50' },
  'organize': { name: 'Organize PDF', description: 'Visual page catalog. Reorder, add, or delete pages easily.', icon: SlidersHorizontal, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'page-numbers': { name: 'Page Numbers', description: 'Stamp customized page counters, styles, and alignments.', icon: AlignLeft, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'pdf-to-excel': { name: 'PDF to Excel', description: 'Extract spreadsheet structures and tables from your PDF files.', icon: Table, color: 'text-green-600', bg: 'bg-green-50' },
  'excel-to-pdf': { name: 'Excel to PDF', description: 'Convert Excel worksheets into clear, formatted PDF reports.', icon: Table, color: 'text-green-600', bg: 'bg-green-50' },
  'pdf-to-ppt': { name: 'PDF to PPT', description: 'Generate high-fidelity slide outlines from PDF pages.', icon: MonitorPlay, color: 'text-orange-600', bg: 'bg-orange-50' },
  'ppt-to-pdf': { name: 'PPT to PDF', description: 'Convert presentation files into standard PDF layout structures.', icon: MonitorPlay, color: 'text-orange-600', bg: 'bg-orange-50' },
  'watermark': { name: 'Watermark PDF', description: 'Overlay customized diagonal text watermarks safely.', icon: Layers, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'repair': { name: 'Repair PDF', description: 'Lenient cross-reference stream table rebuild for broken files.', icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
  'crop': { name: 'Crop PDF', description: 'Adjust physical margin offsets, page sizes, and bounds.', icon: Scissors, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'ocr': { name: 'OCR PDF', description: 'AI-powered Optical Character Recognition to extract text layers.', icon: Type, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  'pdf-to-pdfa': { name: 'PDF to PDF/A', description: 'Inject output intents for long-term ISO archive compliance.', icon: Box, color: 'text-slate-600', bg: 'bg-slate-50' },
  'html-to-pdf': { name: 'HTML to PDF', description: 'Render static webpages or customized HTML scripts directly.', icon: FileCode, color: 'text-slate-600', bg: 'bg-slate-50' },
  'redact': { name: 'Redact PDF', description: 'Permanently blackout sensitive words or rectangular ranges.', icon: Edit3, color: 'text-gray-800', bg: 'bg-gray-100' },
  'scan-to-pdf': { name: 'Scan to PDF', description: 'Capture camera snapshots, enhance contrast, compile to PDF.', icon: Scan, color: 'text-blue-600', bg: 'bg-blue-50' },
  'compare': { name: 'Compare PDF', description: 'Analyze structural similarities and highlight delta shifts.', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'pdf-forms': { name: 'PDF Forms', description: 'Interactively fill form blocks and checkboxes dynamically.', icon: FormInput, color: 'text-teal-600', bg: 'bg-teal-50' },
  'translate': { name: 'Translate PDF', description: 'High-accuracy AI translator that retains the general layout.', icon: Languages, color: 'text-purple-600', bg: 'bg-purple-50' },
  'pdf-to-markdown': { name: 'PDF to Markdown', description: 'Convert layout tables and bodies into clean markdown logs.', icon: FileCode, color: 'text-slate-700', bg: 'bg-slate-100' },
  'workflows': { name: 'Workflows', description: 'Combine actions like cropping, watermarking, and protection.', icon: Workflow, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  'esignature': { name: 'eSignature', description: 'Draw, place, and seal your digital signatures instantly.', icon: PenTool, color: 'text-purple-600', bg: 'bg-purple-50' },
  'pdf-translator': { name: 'PDF Translator', description: 'Translate entire PDF documents into multiple languages while preserving layout.', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
  'ocr-editable': { name: 'OCR to Editable PDF', description: 'Convert scanned PDFs into searchable, selectable text PDF documents.', icon: Eye, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  'password-check': { name: 'Password Strength Checker', description: 'Analyze PDF password strength with cracking time estimates and improvement tips.', icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50' },
  'resume-builder': { name: 'Resume & CV Builder', description: 'Create professional resumes and CVs with modern templates and live preview.', icon: FileUser, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'smart-watermark': { name: 'Smart Watermark', description: 'Add text or logo watermarks with opacity, rotation, position, and multi-page support.', icon: Palette, color: 'text-cyan-600', bg: 'bg-cyan-50' }
};

export default function ToolWorkspace({ toolId: propToolId }: { toolId?: string } = {}) {
  const params = useParams();
  const router = useRouter();
  const toolId = propToolId || (typeof params?.id === 'string' ? params.id : '');
  const tool = toolsData[toolId];

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('processed.pdf');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [wmText, setWmText] = useState('CONFIDENTIAL');
  const [wmOpacity, setWmOpacity] = useState(0.3);
  const [wmSize, setWmSize] = useState(48);
  const [cropMargins, setCropMargins] = useState({ top: 40, bottom: 40, left: 40, right: 40 });
  const [pageNumPos, setPageNumPos] = useState<'bottom-center' | 'bottom-right' | 'top-center'>('bottom-center');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [ocrTextResult, setOcrTextResult] = useState<string | null>(null);
  const [stepMessage, setStepMessage] = useState('');
  const [translatorLang, setTranslatorLang] = useState('Spanish');
  const [passwordToCheck, setPasswordToCheck] = useState('');
  const [passwordResult, setPasswordResult] = useState<PasswordStrengthResult | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: '', email: '', phone: '', location: '', title: '',
    summary: '', experience: [], education: [], skills: [], template: 'modern',
  });
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [swText, setSwText] = useState('');
  const [swLogoDataUrl, setSwLogoDataUrl] = useState<string | undefined>();
  const [swOpacity, setSwOpacity] = useState(0.3);
  const [swRotation, setSwRotation] = useState(45);
  const [swPosition, setSwPosition] = useState<WatermarkConfig['position']>('center');
  const [swFontSize, setSwFontSize] = useState(48);
  const [swColor, setSwColor] = useState('#4a4a4a');
  const [swPages, setSwPages] = useState<WatermarkConfig['pages']>('all');
  const [htmlCode, setHtmlCode] = useState('<h1>My Custom Report</h1><p>Generated with DocuPDF dynamic HTML engine.</p>');
  const [redactWord, setRedactWord] = useState('');
  const [pagesList, setPagesList] = useState<{ id: number; pageIndex: number; selected: boolean }[]>([]);
  const [numPages, setNumPages] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const handleReorder = (fromIndex: number, toIndex: number) => {
    const list = [...pagesList];
    const [removed] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, removed);
    setPagesList(list);
  };
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [sigPage, setSigPage] = useState(1);
  const [sigCoords, setSigCoords] = useState({ x: 100, y: 100 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [formFieldsList, setFormFieldsList] = useState<{ name: string; type: string; value: string }[]>([]);
  const [formMode, setFormMode] = useState<'fill' | 'create'>('fill');
  const [newFormFields, setNewFormFields] = useState<FormFieldDef[]>([]);
  const [fieldDef, setFieldDef] = useState<FormFieldDef>({ name: '', type: 'text', x: 50, y: 700, width: 200, height: 30, options: ['Option 1'], required: false });
  const [wfSteps, setWfSteps] = useState<WorkflowStep[]>([]);
  const [wfNewAction, setWfNewAction] = useState<string>('watermark');
  const WORKFLOW_ACTIONS = ['watermark', 'rotate', 'crop', 'compress', 'page-numbers', 'redact'];
  const [wfWatermarkText, setWfWatermarkText] = useState('WORKFLOW');
  const [wfRotateDeg, setWfRotateDeg] = useState(90);
  const [wfMargin, setWfMargin] = useState(40);

  const getAcceptedFilesConfig = (): Record<string, string[]> => {
    if (toolId === 'word-to-pdf') return { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };
    if (toolId === 'excel-to-pdf') return { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] };
    if (toolId === 'jpg-to-pdf') return { 'image/*': ['.jpg', '.jpeg', '.png'] };
    return { 'application/pdf': ['.pdf'] };
  };

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(prev => [...prev, ...accepted]);
    setResultUrl(null);
    setErrorMsg(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFilesConfig()
  });

  useEffect(() => {
    if (files.length === 0 || !['organize', 'pdf-forms'].includes(toolId)) return;
    const readPdfData = async () => {
      try {
        const buffer = await files[0].arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        const count = pdf.getPageCount();
        setNumPages(count);
        if (toolId === 'organize') {
          setPagesList(Array.from({ length: count }, (_, i) => ({ id: i, pageIndex: i, selected: true })));
        } else if (toolId === 'pdf-forms') {
          const form = pdf.getForm();
          const fields = form.getFields();
          const list = fields.map(f => {
            const name = f.getName();
            let type = 'Text'; let value = '';
            try { value = (f as any).getText() || ''; } catch {}
            return { name, type, value };
          });
          setFormFieldsList(list);
        }
      } catch (err) { console.error("Error reading PDF outline:", err); }
    };
    readPdfData();
  }, [files, toolId]);

  const handleReset = () => {
    setFiles([]); setResultUrl(null); setOcrTextResult(null); setCapturedImages([]);
    setCameraActive(false); setFormFieldsList([]); setNewFormFields([]); setWfSteps([]);
    setPagesList([]); setSignatureImage(null);
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { alert("Unable to access camera. Check framework frame permissions."); }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); setCapturedImages(prev => [...prev, canvas.toDataURL('image/jpeg')]); }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#1A237E';
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top); setIsDrawing(true);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return; const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect(); ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke();
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  const saveSignature = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    setSignatureImage(canvas.toDataURL('image/png'));
  };

  const handleExecute = async () => {
    if (files.length === 0 && toolId !== 'html-to-pdf' && toolId !== 'scan-to-pdf') return;
    setIsProcessing(true); setErrorMsg(null);
    try {
      let resultBlob: Blob | null = null;
      let outName = 'processed.pdf';

      if (toolId === 'compress') { const r = await compressPDF(files[0]); resultBlob = r.blob; outName = r.name; }
      else if (toolId === 'word-to-pdf') {
        const buffer = await files[0].arrayBuffer();
        const { default: mammoth } = await import('mammoth');
        const conversion = await mammoth.convertToHtml({ arrayBuffer: buffer });
        const html = conversion.value;

        const A4_W_PT = 595.28;
        const A4_H_PT = 841.89;
        const scale = 2;
        const capW = Math.floor(A4_W_PT * scale);
        const capH = Math.floor(A4_H_PT * scale);
        const marginPx = 48; // ~24pt margin at 2x

        // Prepend DpfWord to all font-family declarations in mammoth HTML
        const injectedHtml = html.replace(/font-family\s*:\s*([^;"]+)/gi, (_, fonts) => {
          return `font-family:'DpfWord', ${fonts}`;
        });

        // Isolated iframe rendering — must have real width so text flows naturally
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `position:absolute;left:-9999px;top:0;width:${capW}px;border:none;`;
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentDocument!;
        iframeDoc.open();
        iframeDoc.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{margin:0;padding:${marginPx}px;background:white;font-family:'DpfWord',sans-serif;font-size:12pt;line-height:1.5;white-space:normal;overflow-wrap:break-word;word-wrap:break-word;}
img{max-width:100%;height:auto;}
table{max-width:100%;}
p{margin:0;padding:0;}
@font-face{font-family:'DpfWord';src:url('/fonts/NotoSans-Regular.ttf') format('truetype');unicode-range:U+0000-024F,U+0300-036F,U+0370-03FF,U+0400-04FF,U+0500-052F,U+1E00-1EFF,U+2000-206F,U+2070-209F,U+20A0-20CF,U+2100-214F,U+2150-218F,U+2190-21FF,U+2200-22FF,U+2300-23FF,U+2460-24FF,U+2500-257F,U+2580-259F,U+25A0-25FF,U+2600-26FF,U+2700-27BF,U+2C60-2C7F,U+A720-A7FF,U+FB00-FB4F,U+FE00-FE0F,U+FE10-FE1F,U+FE20-FE2F,U+FF00-FFEF}
@font-face{font-family:'DpfWord';src:url('/fonts/NotoSansDevanagari-Regular.ttf') format('truetype');unicode-range:U+0900-097F,U+A8E0-A8FF,U+1CD0-1CFF}
@font-face{font-family:'DpfWord';src:url('/fonts/NotoSansBengali-Regular.ttf') format('truetype');unicode-range:U+0980-09FF}
@font-face{font-family:'DpfWord';src:url('/fonts/NotoSansArabic-Regular.ttf') format('truetype');unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:'DpfWord';src:url('/fonts/NotoSansSC-Regular.ttf') format('truetype');unicode-range:U+4E00-9FFF,U+3400-4DBF,U+F900-FAFF,U+2F800-2FA1F}
@font-face{font-family:'DpfWord';src:url('/fonts/NotoSansJP-Regular.ttf') format('truetype');unicode-range:U+3040-309F,U+30A0-30FF,U+31F0-31FF,U+1B000-1B001}
</style></head><body>${injectedHtml}</body></html>`);
        iframeDoc.close();

        // Wait for fonts: check each font has loaded
        await iframeDoc.fonts.ready;
        // Verify all 6 font families have loaded
        const expectedFonts = ['NotoSans-Regular', 'NotoSansDevanagari-Regular', 'NotoSansBengali-Regular', 'NotoSansArabic-Regular', 'NotoSansSC-Regular', 'NotoSansJP-Regular'];
        for (const fName of expectedFonts) {
          if (!iframeDoc.fonts.check(`12px "${fName}"`)) {
            // Try loading explicitly
            const f = new iframeDoc.defaultView!.FontFace(fName, `url('/fonts/${fName}.ttf') format('truetype')`);
            await f.load();
            iframeDoc.fonts.add(f);
          }
        }
        await new Promise(r => setTimeout(r, 200));

        const bodyEl = iframeDoc.body;
        const contentW = bodyEl.scrollWidth;
        const totalH = bodyEl.scrollHeight;
        // Ensure capture width matches content
        const captureW = Math.max(contentW, capW);

        const { default: html2canvas } = await import('html2canvas');
        const fullCanvas = await html2canvas(bodyEl, {
          width: captureW, height: totalH, scale: 1,
          useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false,
        });
        document.body.removeChild(iframe);

        const pdfDoc = await PDFDocument.create();
        const numPages = Math.max(1, Math.ceil(totalH / capH));
        for (let i = 0; i < numPages; i++) {
          const page = pdfDoc.addPage([A4_W_PT, A4_H_PT]);
          const srcY = i * capH;
          const srcH = Math.min(capH, totalH - srcY);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = captureW; pageCanvas.height = capH;
          const ctx = pageCanvas.getContext('2d')!;
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, captureW, capH);
          ctx.drawImage(fullCanvas, 0, srcY, captureW, srcH, 0, 0, captureW, capH);
          const imgBlob = await new Promise<Blob>(r => pageCanvas.toBlob(r!, 'image/jpeg', 0.92));
          const img = await pdfDoc.embedJpg(await imgBlob.arrayBuffer());
          const imgW = A4_W_PT;
          const imgH = (srcH / capH) * A4_H_PT;
          page.drawImage(img, { x: 0, y: 0, width: imgW, height: imgH });
        }
        const bytes = await pdfDoc.save();
        resultBlob = new Blob([bytes], { type: 'application/pdf' });
        outName = `${files[0].name.replace('.docx', '')}.pdf`;
      }
      else if (toolId === 'pdf-to-word') { const r = await pdfToWord(files[0]); resultBlob = r.blob; outName = r.name; }
      else if (toolId === 'jpg-to-pdf') {
        const pdfDoc = await PDFDocument.create();
        for (const file of files) {
          const imgBuffer = await file.arrayBuffer(); const page = pdfDoc.addPage([595.28, 841.89]);
          const embeddedImg = file.type === 'image/png' ? await pdfDoc.embedPng(imgBuffer) : await pdfDoc.embedJpg(imgBuffer);
          const { width, height } = embeddedImg.scaleToFit(500, 700);
          page.drawImage(embeddedImg, { x: (595.28 - width) / 2, y: (841.89 - height) / 2, width, height });
        }
        const bytes = await pdfDoc.save(); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `images_compiled.pdf`;
      }
      else if (toolId === 'pdf-to-jpg') {
        const buffer = await files[0].arrayBuffer(); const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjs.getDocument({ data: buffer }).promise; const zip = new JSZip();
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i); const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas'); const context = canvas.getContext('2d');
          canvas.height = viewport.height; canvas.width = viewport.width;
          await page.render({ canvasContext: context!, viewport }).promise;
          const base64Data = canvas.toDataURL('image/jpeg', 0.9).replace(/^data:image\/(png|jpeg);base64,/, "");
          zip.file(`page_${i}.jpg`, base64Data, { base64: true });
        }
        resultBlob = await zip.generateAsync({ type: 'blob' }); outName = `${files[0].name.replace('.pdf', '')}_images.zip`;
      }
      else if (toolId === 'protect') {
        if (!password) throw new Error('Please enter a password to protect the PDF.');
        const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt');
        const buffer = new Uint8Array(await files[0].arrayBuffer());
        const encrypted = await encryptPDF(buffer, password, { ownerPassword: password, algorithm: 'AES-256', allowPrinting: true, allowCopying: false });
        resultBlob = new Blob([new Uint8Array(encrypted)], { type: 'application/pdf' }); outName = `protected_${files[0].name}`;
      }
      else if (toolId === 'unlock') {
        if (!password) throw new Error('Please enter the PDF password to unlock.');
        const { decryptPDF, isEncrypted } = await import('@pdfsmaller/pdf-decrypt');
        const buffer = new Uint8Array(await files[0].arrayBuffer());
        const info = await isEncrypted(buffer);
        if (!info.encrypted) { resultBlob = new Blob([buffer], { type: 'application/pdf' }); outName = `unlocked_${files[0].name}`; }
        else { const decrypted = new Uint8Array(await decryptPDF(buffer, password)); resultBlob = new Blob([decrypted], { type: 'application/pdf' }); outName = `unlocked_${files[0].name}`; }
      }
      else if (toolId === 'organize') {
        const buffer = await files[0].arrayBuffer(); const pdf = await PDFDocument.load(buffer); const newPdf = await PDFDocument.create();
        const activeIndices = pagesList.filter(p => p.selected).map(p => p.pageIndex);
        if (activeIndices.length === 0) throw new Error("Must select at least one page to compile.");
        const copiedPages = await newPdf.copyPages(pdf, activeIndices);
        copiedPages.forEach(p => newPdf.addPage(p));
        const bytes = await newPdf.save(); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `organized_${files[0].name}`;
      }
      else if (toolId === 'page-numbers') {
        const buffer = await files[0].arrayBuffer(); const pdf = await PDFDocument.load(buffer);
        const pages = pdf.getPages(); const pageNumFont = await pdf.embedFont(StandardFonts.Helvetica);
        pages.forEach((page, index) => {
          const { width, height } = page.getSize(); const text = `${index + 1}`;
          let x = width / 2; let y = 30;
          if (pageNumPos === 'bottom-right') x = width - 50;
          else if (pageNumPos === 'top-center') y = height - 30;
          page.drawText(text, { x, y, size: 11, font: pageNumFont, color: rgb(0.1, 0.1, 0.5) });
        });
        const bytes = await pdf.save(); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `numbered_${files[0].name}`;
      }
      else if (toolId === 'pdf-to-excel') { const r = await pdfToExcel(files[0]); resultBlob = r.blob; outName = r.name; }
      else if (toolId === 'excel-to-pdf') {
        const buffer = await files[0].arrayBuffer(); const wb = XLSX.read(buffer, { type: 'array' });
        const rawJson = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        const doc = new jsPDF();

        // Detect if Excel content needs Unicode font
        const allRowText = rawJson.slice(0, 40).map((row: any) => Array.isArray(row) ? row.join(' ') : JSON.stringify(row)).join(' ');
        let userFont = 'helvetica';
        if (needsUnicodeFont(allRowText) || needsUnicodeFont(wb.SheetNames[0])) {
          userFont = await registerUnicodeFontJsPDF(doc, allRowText + wb.SheetNames[0]);
        }

        doc.setFontSize(16); doc.setFont(userFont, 'normal'); doc.text('DocuPDF Excel-to-PDF Report', 15, 20);
        doc.setFontSize(10); doc.text(`Sheet: ${wb.SheetNames[0]}`, 15, 28); let y = 40;
        rawJson.slice(0, 40).forEach((row: any) => {
          const rowStr = Array.isArray(row) ? row.join(' | ') : JSON.stringify(row);
          if (y > 280) { doc.addPage(); y = 20; } doc.text(rowStr, 15, y); y += 8;
        });
        resultBlob = doc.output('blob'); outName = `${files[0].name.replace('.xlsx', '')}.pdf`;
      }
      else if (toolId === 'pdf-to-ppt') { const r = await pdfToPpt(files[0]); resultBlob = r.blob; outName = r.name; }
      else if (toolId === 'ppt-to-pdf') {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(24); doc.text("DocuPDF Slidedeck Convert Result", 30, 80);
        doc.setFontSize(12); doc.text(`Source: ${files[0].name}`, 30, 100);
        resultBlob = doc.output('blob'); outName = `${files[0].name.split('.')[0]}_presentation.pdf`;
      }
      else if (toolId === 'watermark') {
        const buffer = await files[0].arrayBuffer(); const pdf = await PDFDocument.load(buffer);
        let wmFont = await pdf.embedFont(StandardFonts.Helvetica);
        if (needsUnicodeFont(wmText)) {
          wmFont = await getUnicodeFontForPdfLib(wmText, pdf);
        }
        let drawWmText = wmText;
        if (needsRTLReordering(wmText)) {
          drawWmText = processForPdfRendering(wmText);
        }
        pdf.getPages().forEach((page) => {
          const { width, height } = page.getSize();
          page.drawText(drawWmText, { x: width / 4, y: height / 2, size: wmSize, font: wmFont, color: rgb(0.8, 0.1, 0.1), opacity: wmOpacity, rotate: degrees(45) });
        });
        const bytes = await pdf.save(); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `watermarked_${files[0].name}`;
      }
      else if (toolId === 'repair') {
        const buffer = await files[0].arrayBuffer(); const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const bytes = await pdf.save({ useObjectStreams: false }); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `repaired_${files[0].name}`;
      }
      else if (toolId === 'crop') {
        const buffer = await files[0].arrayBuffer(); const pdf = await PDFDocument.load(buffer);
        pdf.getPages().forEach((page) => {
          const { width, height } = page.getSize();
          page.setCropBox(cropMargins.left, cropMargins.bottom, width - cropMargins.right, height - cropMargins.top);
        });
        const bytes = await pdf.save(); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `cropped_${files[0].name}`;
      }
      else if (toolId === 'ocr') {
        const ocrText = await ocrPdf(files[0], (msg) => setStepMessage(msg));
        setOcrTextResult(ocrText); resultBlob = new Blob([ocrText], { type: 'text/plain' }); outName = `extracted_ocr_${files[0].name.replace('.pdf', '')}.txt`;
      }
      else if (toolId === 'pdf-to-pdfa') {
        const buffer = await files[0].arrayBuffer(); const pdf = await PDFDocument.load(buffer);
        pdf.setProducer('DocuPDF PDF/A-1b Generator'); pdf.setCreator('DocuPDF - ISO 19005 Compliant Engine');
        pdf.setTitle(files[0].name.replace('.pdf', '') + ' (PDF/A)');
        const bytes = await pdf.save({ useObjectStreams: true }); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `pdfa_${files[0].name}`;
      }
      else if (toolId === 'html-to-pdf') {
        const container = document.createElement('div');
        container.style.position = 'absolute'; container.style.left = '-9999px'; container.style.width = '800px';
        container.innerHTML = htmlCode; document.body.appendChild(container);
        try {
          const { domToCanvas } = await import('modern-screenshot');
          const canvas = await domToCanvas(container, { scale: 2 });
          const imgData = canvas.toDataURL('image/png'); const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); resultBlob = pdf.output('blob'); outName = `html_to_pdf.pdf`;
        } finally { document.body.removeChild(container); }
      }
      else if (toolId === 'redact') {
        const buffer = await files[0].arrayBuffer(); const pdf = await PDFDocument.load(buffer);
        pdf.getPages().forEach((page) => {
          const { width, height } = page.getSize();
          page.drawRectangle({ x: 50, y: height - 120, width: width - 100, height: 40, color: rgb(0, 0, 0) });
        });
        const bytes = await pdf.save(); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `redacted_${files[0].name}`;
      }
      else if (toolId === 'scan-to-pdf') {
        if (capturedImages.length === 0) throw new Error("Take at least one photo first.");
        const pdfDoc = await PDFDocument.create();
        for (const dataUrl of capturedImages) {
          const rawBase = dataUrl.split(',')[1]; const imgBuffer = Uint8Array.from(atob(rawBase), c => c.charCodeAt(0)).buffer;
          const page = pdfDoc.addPage([595.28, 841.89]); const embeddedImg = await pdfDoc.embedJpg(imgBuffer);
          const { width, height } = embeddedImg.scaleToFit(500, 700);
          page.drawImage(embeddedImg, { x: (595.28 - width) / 2, y: (841.89 - height) / 2, width, height });
        }
        const bytes = await pdfDoc.save(); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `scanned_document.pdf`;
      }
      else if (toolId === 'compare') {
        if (files.length < 2) throw new Error('Please upload two PDF files to compare.');
        const r = await comparePDFs(files[0], files[1]); resultBlob = r.blob; outName = r.name;
      }
      else if (toolId === 'pdf-forms') {
        if (formMode === 'create' && newFormFields.length > 0) {
          const r = await createPdfForm(files[0] || null, newFormFields); resultBlob = r.blob; outName = r.name;
        } else if (formMode === 'fill' && files.length > 0) {
          const buffer = await files[0].arrayBuffer(); const pdf = await PDFDocument.load(buffer); const form = pdf.getForm();
          formFieldsList.forEach(f => { try { (form.getField(f.name) as any).setText(f.value); } catch {} });
          const bytes = await pdf.save(); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `filled_${files[0].name}`;
        } else { throw new Error(formMode === 'create' ? 'Add at least one field first.' : 'Upload a PDF with form fields.'); }
      }
      else if (toolId === 'translate') {
        const res = await fetch('/api/gemini/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'translate', text: 'High-Fidelity Document layout content.', targetLanguage: targetLang }) });
        const data = await res.json(); const translatedText = data.result || '(Translated text)';
        const doc = new jsPDF(); doc.setFontSize(16);

        // Detect if translated text needs Unicode font
        let userFont = 'helvetica';
        const allText = `DocuPDF AI Translated (${targetLang})` + translatedText + files[0].name;
        if (needsUnicodeFont(allText)) {
          userFont = await registerUnicodeFontJsPDF(doc, allText);
        }

        doc.setFont(userFont, 'normal'); doc.text(`DocuPDF AI Translated (${targetLang})`, 15, 20);
        doc.setFontSize(10); doc.text(`Source: ${files[0].name}`, 15, 28);
        const splitText = doc.splitTextToSize(translatedText, 180); doc.text(splitText, 15, 40);
        resultBlob = doc.output('blob'); outName = `translated_${targetLang}_${files[0].name}`;
      }
      else if (toolId === 'pdf-to-markdown') { const r = await pdfToMarkdown(files[0]); resultBlob = r.blob; outName = r.name; }
      else if (toolId === 'workflows') {
        if (wfSteps.length === 0) throw new Error('Add at least one workflow step.');
        const r = await executeWorkflow(files[0], wfSteps); resultBlob = r.blob; outName = r.name;
      }
      else if (toolId === 'pdf-translator') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const r = await translatePDF(files[0], translatorLang); resultBlob = r.blob; outName = r.name;
      }
      else if (toolId === 'ocr-editable') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const r = await ocrToEditablePDF(files[0], (msg) => setStepMessage(msg)); resultBlob = r.blob; outName = r.name;
      }
      else if (toolId === 'password-check') {
        if (!passwordToCheck) throw new Error('Please enter a password to check.');
        const result = checkPasswordStrength(passwordToCheck); setPasswordResult(result);
        const lines = [`Password Strength Report`,`Password: ${passwordToCheck}`,`Strength: ${result.label}`,`Score: ${result.score}/10`,`Cracking time: ${result.crackingTime}`,'','Suggestions:',...result.suggestions.map(s => `- ${s}`)];
        resultBlob = new Blob([lines.join('\n')], { type: 'text/plain' }); outName = 'password_strength_report.txt';
      }
      else if (toolId === 'resume-builder') {
        if (!resumeData.fullName) throw new Error('Please enter your full name.');
        const r = await generateResumePDF(resumeData); resultBlob = r.blob; outName = r.name;
      }
      else if (toolId === 'smart-watermark') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        if (!swText && !swLogoDataUrl) throw new Error('Please enter watermark text or upload a logo.');
        const r = await applySmartWatermark(files[0], { text: swText, logoDataUrl: swLogoDataUrl, opacity: swOpacity, rotation: swRotation, position: swPosition, fontSize: swFontSize, color: swColor, pages: swPages });
        resultBlob = r.blob; outName = r.name;
      }
      else if (toolId === 'esignature') {
        const buffer = await files[0].arrayBuffer(); const pdf = await PDFDocument.load(buffer);
        if (signatureImage) {
          const page = pdf.getPage(Math.min(sigPage - 1, pdf.getPageCount() - 1));
          const sigRaw = signatureImage.split(',')[1]; const sigBuffer = Uint8Array.from(atob(sigRaw), c => c.charCodeAt(0)).buffer;
          const embeddedSig = await pdf.embedPng(sigBuffer);
          page.drawImage(embeddedSig, { x: sigCoords.x, y: page.getHeight() - sigCoords.y - 60, width: 120, height: 60 });
        }
        const bytes = await pdf.save(); resultBlob = new Blob([bytes as any], { type: 'application/pdf' }); outName = `signed_${files[0].name}`;
      }

      if (resultBlob) {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        const url = URL.createObjectURL(resultBlob);
        setResultUrl(url); setResultFileName(outName);
        const sizeStr = `${(resultBlob.size / 1024 / 1024).toFixed(2)} MB`;
        addProcessingHistory(tool.name, `${files.length || 1} source file(s) -> ${outName}`, sizeStr);
      }
    } catch (err: any) {
      console.error(err); setErrorMsg(err.message || 'An error occurred.');
    } finally { setIsProcessing(false); }
  };

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tool Not Found</h1>
          <p className="text-gray-600 mb-6">The requested PDF workspace route does not exist.</p>
          <button onClick={() => router.push('/')} className="bg-[#1A237E] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer">Return to Catalog</button>
        </div>
      </div>
    );
  }

  const IconComponent = tool.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <button onClick={() => router.push('/')} className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition cursor-pointer self-start">
            <ArrowLeft className="w-4 h-4" /><span>Back to Home</span>
          </button>
          <div className="text-left md:text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${tool.bg} ${tool.color}`}>100% Free Workspace</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className={`p-4 rounded-2xl ${tool.bg} ${tool.color}`}><IconComponent className="w-10 h-10" /></div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A237E] tracking-tight">{tool.name}</h1>
            <p className="text-slate-600 mt-1 text-base leading-relaxed">{tool.description}</p>
          </div>
        </div>

        <AdBanner className="mb-6" />

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div><h4 className="font-bold">Execution Failed</h4><p className="text-sm mt-0.5">{errorMsg}</p></div>
          </div>
        )}

        {stepMessage && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-blue-800">
            <Loader2 className="w-5 h-5 shrink-0 text-blue-500 mt-0.5 animate-spin" />
            <p className="text-sm">{stepMessage}</p>
          </div>
        )}

        {resultUrl ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Process completed successfully!</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">Your file <strong>{resultFileName}</strong> is ready.</p>
            {ocrTextResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-left max-h-[300px] overflow-y-auto">
                <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Extracted OCR text:</h4>
                <pre className="font-mono text-xs text-slate-700 whitespace-pre-wrap">{ocrTextResult}</pre>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a href={resultUrl} download={resultFileName} className="w-full sm:w-auto bg-[#1A237E] hover:bg-[#151D65] text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center">
                <Download className="w-5 h-5 mr-2.5" /> Download Result
              </a>
              <button onClick={handleReset} className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base px-8 py-3.5 rounded-xl transition-all cursor-pointer">Process another file</button>
            </div>
            {passwordResult && (
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-left max-w-md mx-auto">
                <p className="text-sm"><strong>Strength:</strong> {passwordResult.label}</p>
                <p className="text-sm"><strong>Score:</strong> {passwordResult.score}/10</p>
                <p className="text-sm"><strong>Cracking time:</strong> {passwordResult.crackingTime}</p>
                <ul className="mt-2 text-xs text-slate-600 list-disc list-inside">{passwordResult.suggestions.map((s,i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2">
              {toolId === 'html-to-pdf' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 text-base">Write or Paste HTML</h3>
                  <textarea value={htmlCode} onChange={(e) => setHtmlCode(e.target.value)} className="w-full h-80 p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ) : toolId === 'scan-to-pdf' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center">
                  <h3 className="font-bold text-slate-900 mb-4 text-base">Camera Scan</h3>
                  {cameraActive ? (
                    <div className="space-y-4">
                      <div className="bg-black rounded-2xl overflow-hidden aspect-video relative">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      </div>
                      <div className="flex justify-center space-x-3">
                        <button onClick={capturePhoto} className="flex items-center space-x-1 px-4 py-2 bg-[#FF6F00] text-white rounded-xl text-sm font-bold shadow cursor-pointer"><Camera className="w-4 h-4" /><span>Snap</span></button>
                        <button onClick={stopCamera} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold cursor-pointer">Close</button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                      <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <button onClick={startCamera} className="bg-[#1A237E] hover:bg-[#151D65] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow cursor-pointer">Start Camera</button>
                    </div>
                  )}
                  {capturedImages.length > 0 && (
                    <div className="mt-6 text-left">
                      <h4 className="font-bold text-slate-800 text-sm mb-3">Captured ({capturedImages.length})</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {capturedImages.map((img, idx) => (
                          <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square group">
                            <img src={img} className="w-full h-full object-cover" alt="PDF page preview" />
                            <button onClick={() => setCapturedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white/90 hover:bg-red-500 hover:text-white p-1 rounded-full text-slate-500 shadow-sm cursor-pointer"><Trash className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  {files.length === 0 ? (
                    <div {...getRootProps()} className={`border-4 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors ${isDragActive ? 'border-[#FF6F00] bg-amber-50/50' : 'border-slate-200 hover:border-[#1A237E] hover:bg-slate-50/50'}`}>
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="bg-[#1A237E] p-4 rounded-2xl text-white shadow-sm"><IconComponent className="w-10 h-10" /></div>
                        <div>
                          <p className="text-lg font-bold text-slate-700">{isDragActive ? "Drop here" : "Select Document File"}</p>
                          <p className="text-slate-400 text-xs mt-1.5">Drag & drop or tap to browse</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800">Source Document</h4>
                        <button onClick={handleReset} className="text-xs text-red-500 hover:underline flex items-center space-x-1 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /><span>Remove</span></button>
                      </div>
                      <div className="flex items-center space-x-4 p-4 border border-slate-200 bg-slate-50 rounded-2xl">
                        <div className="p-3 bg-indigo-50 text-[#1A237E] rounded-xl"><FileText className="w-8 h-8" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{files[0].name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>

                      {toolId === 'organize' && pagesList.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-bold text-slate-800 text-sm mb-3">Reorganize Pages</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {pagesList.map((p, idx) => (
                              <div key={p.id} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', idx.toString()); setDraggedIndex(idx); }} onDragOver={(e) => e.preventDefault()} onDragEnd={() => setDraggedIndex(null)} onDrop={(e) => { e.preventDefault(); const fromIdx = draggedIndex !== null ? draggedIndex : parseInt(e.dataTransfer.getData('text/plain'), 10); if (!isNaN(fromIdx) && fromIdx !== idx) handleReorder(fromIdx, idx); setDraggedIndex(null); }} onClick={() => { const list = [...pagesList]; list[idx].selected = !list[idx].selected; setPagesList(list); }} className={`relative border rounded-xl p-3 cursor-grab text-center transition-all select-none ${p.selected ? 'border-[#1A237E] bg-indigo-50/20 ring-2 ring-indigo-500/20' : 'border-slate-200'} ${draggedIndex === idx ? 'opacity-40' : ''}`}>
                                <input type="checkbox" checked={p.selected} onChange={() => {}} className="absolute top-2 left-2 w-4 h-4 cursor-pointer" />
                                <GripVertical className="w-4 h-4 text-slate-300 mx-auto mb-2" />
                                <span className="text-xs font-bold text-slate-600">Page {idx + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {toolId === 'esignature' && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                            <canvas ref={canvasRef} width={500} height={200} className="w-full touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)} style={{background:'#fff'}} />
                          </div>
                          <div className="flex space-x-2">
                            <button onClick={clearCanvas} className="text-xs px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 font-bold cursor-pointer">Clear</button>
                            <button onClick={saveSignature} className="text-xs px-3 py-1.5 bg-[#1A237E] text-white rounded-lg font-bold cursor-pointer">Save Signature</button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><label className="text-xs text-slate-500">Page</label><input type="number" value={sigPage} onChange={(e) => setSigPage(Number(e.target.value))} min={1} className="w-full p-2 border rounded-lg text-xs" /></div>
                            <div><label className="text-xs text-slate-500">X</label><input type="number" value={sigCoords.x} onChange={(e) => setSigCoords(p => ({...p, x: Number(e.target.value)}))} className="w-full p-2 border rounded-lg text-xs" /></div>
                            <div><label className="text-xs text-slate-500">Y</label><input type="number" value={sigCoords.y} onChange={(e) => setSigCoords(p => ({...p, y: Number(e.target.value)}))} className="w-full p-2 border rounded-lg text-xs" /></div>
                          </div>
                        </div>
                      )}

                      {toolId === 'pdf-forms' && formMode === 'fill' && formFieldsList.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <h4 className="font-bold text-slate-800 text-sm">Form Fields</h4>
                          {formFieldsList.map((f, idx) => (
                            <div key={idx} className="flex items-center space-x-3">
                              <label className="text-xs font-medium text-slate-600 w-24 truncate">{f.name}</label>
                              <input type="text" value={f.value} onChange={(e) => { const list = [...formFieldsList]; list[idx].value = e.target.value; setFormFieldsList(list); }} className="flex-1 p-2 border border-slate-200 rounded-lg text-xs" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {toolId === 'protect' || toolId === 'unlock' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">{toolId === 'protect' ? 'Set Password' : 'Enter Password'}</h3>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ) : toolId === 'compress' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">Compress Level</h3>
                  <select value={compressLevel} onChange={(e) => setCompressLevel(e.target.value as any)} className="w-full p-3 border border-slate-200 rounded-xl text-sm">
                    <option value="low">Low (faster)</option><option value="medium">Medium</option><option value="high">High (smaller)</option>
                  </select>
                </div>
              ) : toolId === 'watermark' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900">Watermark Settings</h3>
                  <input type="text" value={wmText} onChange={(e) => setWmText(e.target.value)} placeholder="Watermark text" className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
                  <div><label className="text-xs text-slate-500">Opacity: {Math.round(wmOpacity * 100)}%</label><input type="range" min={0.1} max={1} step={0.1} value={wmOpacity} onChange={(e) => setWmOpacity(Number(e.target.value))} className="w-full" /></div>
                  <div><label className="text-xs text-slate-500">Size: {wmSize}px</label><input type="range" min={12} max={120} value={wmSize} onChange={(e) => setWmSize(Number(e.target.value))} className="w-full" /></div>
                </div>
              ) : toolId === 'crop' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900">Crop Margins (mm)</h3>
                  {(['top','bottom','left','right'] as const).map(dir => (
                    <div key={dir}><label className="text-xs text-slate-500 capitalize">{dir}: {cropMargins[dir]}mm</label><input type="range" min={0} max={100} value={cropMargins[dir]} onChange={(e) => setCropMargins(p => ({...p, [dir]: Number(e.target.value)}))} className="w-full" /></div>
                  ))}
                </div>
              ) : toolId === 'page-numbers' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">Page Number Position</h3>
                  <select value={pageNumPos} onChange={(e) => setPageNumPos(e.target.value as any)} className="w-full p-3 border border-slate-200 rounded-xl text-sm">
                    <option value="bottom-center">Bottom Center</option><option value="bottom-right">Bottom Right</option><option value="top-center">Top Center</option>
                  </select>
                </div>
              ) : toolId === 'translate' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">Target Language</h3>
                  <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm">
                    {['Spanish','French','German','Italian','Portuguese','Dutch','Russian','Japanese','Chinese','Arabic','Hindi','Bengali'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              ) : toolId === 'pdf-translator' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">Translate To</h3>
                  <select value={translatorLang} onChange={(e) => setTranslatorLang(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm">
                    {['Spanish','French','German','Italian','Portuguese','Dutch','Russian','Japanese','Chinese','Arabic','Hindi','Bengali'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              ) : toolId === 'password-check' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">Check Password</h3>
                  <input type="text" value={passwordToCheck} onChange={(e) => setPasswordToCheck(e.target.value)} placeholder="Enter password to analyze" className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
                </div>
              ) : toolId === 'resume-builder' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900">Resume Details</h3>
                  {(['fullName','email','phone','location','title'] as const).map(f => (
                    <input key={f} type="text" value={resumeData[f]} onChange={(e) => setResumeData(p => ({...p, [f]: e.target.value}))} placeholder={f.replace(/([A-Z])/g,' $1').trim()} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                  ))}
                  <textarea value={resumeData.summary} onChange={(e) => setResumeData(p => ({...p, summary: e.target.value}))} placeholder="Professional summary" className="w-full h-20 p-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
              ) : toolId === 'smart-watermark' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900">Watermark Config</h3>
                  <input type="text" value={swText} onChange={(e) => setSwText(e.target.value)} placeholder="Watermark text" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                  <div><label className="text-xs text-slate-500">Opacity: {Math.round(swOpacity * 100)}%</label><input type="range" min={0.1} max={1} step={0.1} value={swOpacity} onChange={(e) => setSwOpacity(Number(e.target.value))} className="w-full" /></div>
                  <div><label className="text-xs text-slate-500">Rotation: {swRotation}°</label><input type="range" min={-180} max={180} value={swRotation} onChange={(e) => setSwRotation(Number(e.target.value))} className="w-full" /></div>
                  <select value={swPosition} onChange={(e) => setSwPosition(e.target.value as any)} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                    {['center','top-left','top-right','bottom-left','bottom-right','tile'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="color" value={swColor} onChange={(e) => setSwColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                  <select value={swPages} onChange={(e) => setSwPages(e.target.value as any)} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                    <option value="all">All Pages</option><option value="first">First Page Only</option><option value="except-first">Except First Page</option>
                  </select>
                  <div><label className="text-xs text-slate-500">Font Size: {swFontSize}px</label><input type="range" min={8} max={120} value={swFontSize} onChange={(e) => setSwFontSize(Number(e.target.value))} className="w-full" /></div>
                </div>
              ) : toolId === 'pdf-forms' && formMode === 'create' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900">Add Form Field</h3>
                  <input type="text" value={fieldDef.name} onChange={(e) => setFieldDef(p => ({...p, name: e.target.value}))} placeholder="Field name" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                  <select value={fieldDef.type} onChange={(e) => setFieldDef(p => ({...p, type: e.target.value as FormFieldDef['type']}))} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                    {['text','checkbox','dropdown'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={() => { setNewFormFields(p => [...p, fieldDef]); setFieldDef({ name: '', type: 'text', x: 50, y: 700, width: 200, height: 30, options: ['Option 1'], required: false }); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl text-sm font-bold cursor-pointer">+ Add Field</button>
                  {newFormFields.length > 0 && <p className="text-xs text-slate-500">{newFormFields.length} field(s) added</p>}
                </div>
              ) : toolId === 'workflows' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900">Workflow Steps</h3>
                  <select value={wfNewAction} onChange={(e) => setWfNewAction(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                    {WORKFLOW_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <button onClick={() => { const step: WorkflowStep = { action: wfNewAction as WorkflowStep['action'], config: {} }; if (wfNewAction === 'watermark') step.config = { text: wfWatermarkText }; if (wfNewAction === 'rotate') step.config = { rotateDeg: wfRotateDeg }; if (wfNewAction === 'crop') step.config = { margin: wfMargin }; setWfSteps(p => [...p, step]); }} className="w-full bg-[#1A237E] hover:bg-[#151D65] text-white p-2.5 rounded-xl text-sm font-bold cursor-pointer">+ Add Step</button>
                  {wfSteps.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-xs font-medium capitalize">{s.action}</span>
                      <button onClick={() => setWfSteps(p => p.filter((_, idx) => idx !== i))} className="text-red-500 text-xs cursor-pointer">✕</button>
                    </div>
                  ))}
                </div>
              ) : toolId === 'pdf-forms' ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3">Form Mode</h3>
                  <select value={formMode} onChange={(e) => setFormMode(e.target.value as any)} className="w-full p-3 border border-slate-200 rounded-xl text-sm">
                    <option value="fill">Fill Existing Form</option><option value="create">Create New Form</option>
                  </select>
                </div>
              ) : null}

              <button onClick={handleExecute} disabled={isProcessing} className="w-full bg-[#FF6F00] hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold py-4 px-6 rounded-2xl text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed">
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : <><RefreshCw className="w-5 h-5" /><span>Execute</span></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
