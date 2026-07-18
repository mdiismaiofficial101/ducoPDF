'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Trash2, Download, Loader2, ArrowRight, X, EyeOff, ArrowLeft } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { addProcessingHistory } from '@/lib/auth';
import dynamic from 'next/dynamic';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PdfDocument = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Document })), { ssr: false });
const PdfPage = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Page })), { ssr: false });

export default function DeletePagesPage() {
  const router = useRouter();
  useEffect(() => {
    import('react-pdf').then(pdf => {
      pdf.pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdf.pdfjs.version}/build/pdf.worker.min.mjs`;
    });
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [discardedPages, setDiscardedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setOutputPdfUrl(null);
      setDiscardedPages(new Set());
      
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

  const toggleDiscardPage = (index: number) => {
    setDiscardedPages(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        // Prevent deleting all pages
        if (next.size >= pageCount - 1) {
          alert("You cannot delete all pages. At least one page must remain.");
          return prev;
        }
        next.add(index);
      }
      return next;
    });
  };

  const clearDiscards = () => {
    setDiscardedPages(new Set());
  };

  const handleDeletePages = async () => {
    if (!file || discardedPages.size === 0) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Sort in descending order to avoid shift index mismatches
      const sortedIndicesToRemove = Array.from(discardedPages).sort((a, b) => b - a);
      sortedIndicesToRemove.forEach(index => {
        pdf.removePage(index);
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);

      // Log action to workspace history
      const sizeStr = `${(blob.size / 1024 / 1024).toFixed(2)} MB`;
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      addProcessingHistory('Delete Pages', `${baseName}_modified.pdf`, sizeStr);
    } catch (error) {
      console.error('Error deleting PDF pages:', error);
      alert('An error occurred while deleting the pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => router.push('/')} className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition cursor-pointer mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#1A237E] mb-4">Delete PDF Pages</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Click on pages to select them for removal, then download a new PDF with those pages discarded.
        </p>
      </div>

      {!outputPdfUrl ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {!file ? (
            <div 
              {...getRootProps()} 
              className={`border-4 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-[#FF6F00] bg-amber-50' : 'border-gray-300 hover:border-[#1A237E] hover:bg-indigo-50'}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-[#1A237E] p-4 rounded-full text-white shadow-md">
                  <Trash2 className="w-10 h-10 animate-pulse" />
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
            <div>
              {/* Loaded File Indicators */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#1A237E] p-3 rounded-lg text-white shadow-sm">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 max-w-xs md:max-w-md truncate">{file.name}</h3>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB &bull; {pageCount} pages loaded
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-2 transition-colors self-end sm:self-auto"
                  title="Remove file"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Status Actions Header */}
              <div className="flex flex-wrap items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 gap-4">
                <div className="text-sm text-slate-700 font-medium">
                  {discardedPages.size === 0 ? (
                    <span className="text-slate-500">Click on pages below to mark them for deletion.</span>
                  ) : (
                    <span className="text-red-600 font-semibold flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4" />
                      <span>{discardedPages.size} page{discardedPages.size > 1 ? 's' : ''} scheduled for deletion</span>
                    </span>
                  )}
                </div>

                {discardedPages.size > 0 && (
                  <button 
                    onClick={clearDiscards}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {/* Live PDF page grid */}
              <div className="border border-slate-100 rounded-2xl bg-slate-50/50 p-6 md:p-8 mb-8">
                <PdfDocument 
                  file={file} 
                  loading={
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#1A237E]" />
                      <span className="mt-3 text-sm font-medium text-slate-600">Generating page previews...</span>
                    </div>
                  }
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                >
                  {Array.from({ length: pageCount }, (_, i) => {
                    const isDiscarded = discardedPages.has(i);
                    return (
                      <div 
                        key={`page_${i + 1}`}
                        onClick={() => toggleDiscardPage(i)}
                        className={`group relative bg-white flex flex-col items-center p-3 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden select-none
                          ${isDiscarded 
                            ? 'border-red-500 bg-red-50/30 ring-2 ring-red-500/20' 
                            : 'border-slate-200 hover:border-indigo-500'}`}
                      >
                        {/* Page Thumb container */}
                        <div className="w-full aspect-[3/4] flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden relative shadow-inner">
                          <PdfPage 
                            pageNumber={i + 1} 
                            width={130} 
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            loading={
                              <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                              </div>
                            }
                          />

                          {/* Discard Overlay state */}
                          {isDiscarded && (
                            <div className="absolute inset-0 bg-red-600/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-2">
                              <div className="bg-red-600 p-2 rounded-full shadow-lg transition-transform scale-110">
                                <EyeOff className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider mt-2 px-1.5 py-0.5 bg-red-700/80 rounded">Discard</span>
                            </div>
                          )}

                          {/* Hover Overlay */}
                          {!isDiscarded && (
                            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Page</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Page label footer */}
                        <div className="mt-3 flex items-center justify-between w-full px-1">
                          <span className={`text-xs font-semibold uppercase tracking-wider ${isDiscarded ? 'text-red-500 line-through' : 'text-slate-500'}`}>
                            Page {i + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </PdfDocument>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleDeletePages}
                  disabled={isProcessing || discardedPages.size === 0}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-red-900/10 transition-transform hover:scale-105 flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Discarding pages...
                    </>
                  ) : (
                    <>
                      Delete Selected Pages
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Download screen */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm animate-bounce">
            <Trash2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pages Deleted Successfully!</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            A new PDF has been compiled with your specified pages discarded. Download it below.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href={outputPdfUrl}
              download={`${file?.name.substring(0, file.name.lastIndexOf('.')) || 'document'}_modified.pdf`}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
            >
              <Download className="w-6 h-6 mr-3" />
              Download PDF
            </a>
            <button
              onClick={() => {
                setOutputPdfUrl(null);
                setFile(null);
                setDiscardedPages(new Set());
              }}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
