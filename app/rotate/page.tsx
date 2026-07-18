'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { RotateCcw, RotateCw, Download, Loader2, ArrowRight, X, RefreshCw, ArrowLeft } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { addProcessingHistory } from '@/lib/auth';
import dynamic from 'next/dynamic';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PdfDocument = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Document })), { ssr: false });
const PdfPage = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Page })), { ssr: false });

export default function RotatePDFPage() {
  const router = useRouter();
  useEffect(() => {
    import('react-pdf').then(pdf => {
      pdf.pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdf.pdfjs.version}/build/pdf.worker.min.mjs`;
    });
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setRotatedPdfUrl(null);
      setPageRotations({});
      
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

  const rotatePageRight = (index: number) => {
    setPageRotations(prev => ({
      ...prev,
      [index]: ((prev[index] || 0) + 90) % 360
    }));
  };

  const rotatePageLeft = (index: number) => {
    setPageRotations(prev => ({
      ...prev,
      [index]: ((prev[index] || 0) + 270) % 360
    }));
  };

  const rotateAllRight = () => {
    const updated: Record<number, number> = {};
    for (let i = 0; i < pageCount; i++) {
      updated[i] = ((pageRotations[i] || 0) + 90) % 360;
    }
    setPageRotations(updated);
  };

  const rotateAllLeft = () => {
    const updated: Record<number, number> = {};
    for (let i = 0; i < pageCount; i++) {
      updated[i] = ((pageRotations[i] || 0) + 270) % 360;
    }
    setPageRotations(updated);
  };

  const resetAllRotations = () => {
    setPageRotations({});
  };

  const handleRotate = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();
      
      pages.forEach((page, index) => {
        const addedRotation = pageRotations[index] || 0;
        if (addedRotation !== 0) {
          const originalRotation = page.getRotation().angle;
          page.setRotation(degrees((originalRotation + addedRotation) % 360));
        }
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      if (rotatedPdfUrl) URL.revokeObjectURL(rotatedPdfUrl);
      const url = URL.createObjectURL(blob);
      setRotatedPdfUrl(url);

      // Log operation to global activity history
      const sizeStr = `${(blob.size / 1024 / 1024).toFixed(2)} MB`;
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      addProcessingHistory('Rotate PDF', `${baseName}_rotated.pdf`, sizeStr);
    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('An error occurred while rotating the PDF.');
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
        <h1 className="text-4xl font-bold text-[#1A237E] mb-4">Rotate PDF Page by Page</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Hover over individual pages to rotate them, or rotate all pages at once. Preview the results live!
        </p>
      </div>

      {!rotatedPdfUrl ? (
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
                  <RotateCw className="w-10 h-10 animate-pulse" />
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
              {/* Loaded File Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#1A237E] p-3 rounded-lg text-white shadow-sm">
                    <RotateCw className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 max-w-xs md:max-w-md truncate">{file.name}</h3>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB &bull; {pageCount} pages
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

              {/* Global Rotation Actions Bar */}
              <div className="flex flex-wrap items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={rotateAllLeft}
                    className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-[#1A237E] shadow-sm transition"
                  >
                    <RotateCcw className="w-4 h-4 text-indigo-600" />
                    <span>Rotate All Left</span>
                  </button>
                  <button 
                    onClick={rotateAllRight}
                    className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-[#1A237E] shadow-sm transition"
                  >
                    <RotateCw className="w-4 h-4 text-indigo-600" />
                    <span>Rotate All Right</span>
                  </button>
                  {Object.keys(pageRotations).length > 0 && (
                    <button 
                      onClick={resetAllRotations}
                      className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                      <span>Reset Rotations</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-500 font-medium bg-indigo-50/50 border border-indigo-100/50 rounded-lg px-3 py-1.5">
                  Customizing {Object.keys(pageRotations).filter(k => pageRotations[Number(k)] !== 0).length} of {pageCount} pages
                </div>
              </div>

              {/* Live PDF Grid Previews */}
              <div className="border border-slate-100 rounded-2xl bg-slate-50/50 p-6 md:p-8 mb-8">
                <PdfDocument 
                  file={file} 
                  loading={
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#1A237E]" />
                      <span className="mt-3 text-sm font-medium text-slate-600">Generating live page previews...</span>
                    </div>
                  }
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                >
                  {Array.from({ length: pageCount }, (_, i) => {
                    const currentRot = pageRotations[i] || 0;
                    return (
                      <div 
                        key={`page_${i + 1}`}
                        className="group relative bg-white flex flex-col items-center p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        {/* Interactive Rotation Overlay */}
                        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <button
                            type="button"
                            onClick={() => rotatePageLeft(i)}
                            className="bg-[#1A237E]/90 hover:bg-[#1A237E] p-1.5 rounded-lg text-white shadow transition-transform hover:scale-110"
                            title="Rotate Left"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => rotatePageRight(i)}
                            className="bg-[#1A237E]/90 hover:bg-[#1A237E] p-1.5 rounded-lg text-white shadow transition-transform hover:scale-110"
                            title="Rotate Right"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Page Thumb preview container */}
                        <div className="w-full aspect-[3/4] flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden relative shadow-inner">
                          <PdfPage 
                            pageNumber={i + 1} 
                            width={130} 
                            rotate={currentRot}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            loading={
                              <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                              </div>
                            }
                          />
                          {currentRot !== 0 && (
                            <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow flex items-center space-x-1">
                              <RotateCw className="w-3 h-3" />
                              <span>{currentRot}°</span>
                            </div>
                          )}
                        </div>

                        {/* Page Label */}
                        <div className="mt-3 flex items-center justify-between w-full px-1">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Page {i + 1}</span>
                          {currentRot !== 0 && (
                            <button 
                              onClick={() => setPageRotations(p => ({ ...p, [i]: 0 }))}
                              className="text-[10px] text-indigo-600 hover:text-red-500 font-semibold"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </PdfDocument>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleRotate}
                  disabled={isProcessing}
                  className="bg-[#1A237E] hover:bg-indigo-800 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-indigo-900/10 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Saving modified pages...
                    </>
                  ) : (
                    <>
                      Save and Rotate PDF
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm animate-bounce">
            <Download className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">PDF Rotated Successfully!</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your custom-rotated pages have been compiled. Download your output file below.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href={rotatedPdfUrl}
              download={`${file?.name.substring(0, file.name.lastIndexOf('.')) || 'document'}_rotated.pdf`}
              className="w-full sm:w-auto bg-[#FF6F00] hover:bg-amber-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
            >
              <Download className="w-6 h-6 mr-3" />
              Download rotated PDF
            </a>
            <button
              onClick={() => {
                setRotatedPdfUrl(null);
                setFile(null);
                setPageRotations({});
              }}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              Rotate another PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
