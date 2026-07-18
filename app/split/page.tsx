'use client';

// Polyfill Promise.withResolvers for environments/browsers that do not support it natively (e.g. pdfjs-dist requirements)
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Scissors, Download, Loader2, ArrowRight, Settings2, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { addProcessingHistory } from '@/lib/auth';
import dynamic from 'next/dynamic';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PdfDocument = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Document })), { ssr: false });
const PdfPage = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Page })), { ssr: false });

export default function SplitPDFPage() {
  const router = useRouter();
  useEffect(() => {
    import('react-pdf').then(pdf => {
      pdf.pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdf.pdfjs.version}/build/pdf.worker.min.mjs`;
    });
  }, []);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setSplitPdfUrl(null);
      setSelectedPages(new Set()); // Reset selection
      
      try {
        const arrayBuffer = await selected.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const count = pdf.getPageCount();
        setPageCount(count);
      } catch (err) {
        console.error("Failed to read PDF:", err);
        alert("Could not read this PDF file. It might be encrypted or corrupted.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPageCount(numPages);
  };

  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageIndex)) {
        newSet.delete(pageIndex);
      } else {
        newSet.add(pageIndex);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const all = new Set<number>();
    for (let i = 0; i < pageCount; i++) {
      all.add(i);
    }
    setSelectedPages(all);
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
  };

  const handleSplit = async () => {
    if (!file || selectedPages.size === 0) {
      alert("Please select at least one page to extract.");
      return;
    }
    
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const sortedIndices = Array.from(selectedPages).sort((a, b) => a - b);
      const copiedPages = await newPdf.copyPages(originalPdf, sortedIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
      const url = URL.createObjectURL(blob);
      setSplitPdfUrl(url);

      // Log operation to global activity history
      const sizeStr = `${(blob.size / 1024 / 1024).toFixed(2)} MB`;
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      addProcessingHistory('Split PDF', `${baseName}_extracted.pdf`, sizeStr);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('An error occurred while splitting the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => router.push('/')} className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition cursor-pointer mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#1A237E] mb-4">Split PDF file</h1>
        <p className="text-xl text-gray-600">
          Extract a specific page range from your PDF file easily.
        </p>
      </div>

      {!splitPdfUrl ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {!file ? (
            <div 
              {...getRootProps()} 
              className={`border-4 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-[#FF6F00] bg-amber-50' : 'border-gray-300 hover:border-[#1A237E] hover:bg-indigo-50'}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-[#1A237E] p-4 rounded-full text-white">
                  <Scissors className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-700">
                    {isDragActive ? "Drop your PDF here" : "Select PDF file"}
                  </p>
                  <p className="text-gray-500 mt-2">or drop a PDF here</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg p-6 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-3 rounded-lg text-[#1A237E] shadow-sm">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{file.name}</h3>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {pageCount} pages</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-red-500 p-2"
                  title="Remove file"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 w-full max-w-4xl mx-auto overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Settings2 className="w-5 h-5 mr-2 text-[#1A237E]" />
                    Select pages to extract ({selectedPages.size} selected)
                  </h3>
                  <div className="flex space-x-3">
                    <button onClick={selectAll} className="text-sm font-medium text-[#1A237E] hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">Select All</button>
                    <button onClick={deselectAll} className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">Deselect All</button>
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-[60vh] p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                  <PdfDocument 
                    file={file} 
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="col-span-full flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#1A237E]" />
                        <span className="ml-3 text-gray-600">Loading document...</span>
                      </div>
                    }
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                  >
                    {Array.from({ length: pageCount }, (_, i) => (
                      <div 
                        key={`page_${i + 1}`}
                        onClick={() => togglePageSelection(i)}
                        className={`relative cursor-pointer flex flex-col items-center p-2 rounded-xl border-2 transition-all duration-200
                          ${selectedPages.has(i) ? 'border-[#FF6F00] bg-amber-50 shadow-md' : 'border-transparent hover:bg-gray-100 hover:border-gray-200'}`}
                      >
                        <div className="relative bg-white shadow-sm border border-gray-200 pointer-events-none overflow-hidden rounded">
                          <PdfPage 
                            pageNumber={i + 1} 
                            width={120} 
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </div>
                        <span className={`mt-2 text-sm font-medium ${selectedPages.has(i) ? 'text-[#FF6F00]' : 'text-gray-500'}`}>
                          Page {i + 1}
                        </span>
                        {selectedPages.has(i) && (
                          <div className="absolute top-1 right-1 bg-[#FF6F00] text-white rounded-full p-0.5 shadow-sm">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </PdfDocument>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="bg-[#1A237E] hover:bg-indigo-800 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Splitting...
                    </>
                  ) : (
                    <>
                      Split PDF
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Download className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">PDF split successfully!</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your selected pages have been extracted into a new PDF document.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a
              href={splitPdfUrl}
              download="split-document.pdf"
              className="bg-[#1A237E] hover:bg-indigo-800 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center"
            >
              <Download className="w-6 h-6 mr-3" />
              Download split PDF
            </a>
            <button
              onClick={() => {
                setSplitPdfUrl(null);
                setFile(null);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              Split another PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
