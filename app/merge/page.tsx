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
import { FilePlus, X, Settings2, Download, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { addProcessingHistory } from '@/lib/auth';
import dynamic from 'next/dynamic';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PdfDocument = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Document })), { ssr: false });
const PdfPage = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Page })), { ssr: false });

export default function MergePDFPage() {
  const router = useRouter();
  useEffect(() => {
    import('react-pdf').then(pdf => {
      pdf.pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdf.pdfjs.version}/build/pdf.worker.min.mjs`;
    });
  }, []);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setMergedPdfUrl(null); // Reset when new files are added
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setMergedPdfUrl(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    if (direction === 'up' && index > 0) {
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    } else if (direction === 'down' && index < newFiles.length - 1) {
      [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
    }
    setFiles(newFiles);
    setMergedPdfUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
      
      // Log operation to global activity history
      const sizeStr = `${(blob.size / 1024 / 1024).toFixed(2)} MB`;
      addProcessingHistory('Merge PDFs', `${files.length} files merged.pdf`, sizeStr);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('An error occurred while merging the PDFs.');
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
        <h1 className="text-4xl font-bold text-[#1A237E] mb-4">Merge PDF files</h1>
        <p className="text-xl text-gray-600">
          Combine PDFs in the order you want with the easiest PDF merger available.
        </p>
      </div>

      {!mergedPdfUrl ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div 
            {...getRootProps()} 
            className={`border-4 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-[#FF6F00] bg-amber-50' : 'border-gray-300 hover:border-[#1A237E] hover:bg-indigo-50'}
              ${files.length > 0 ? 'mb-8 py-8' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-[#1A237E] p-4 rounded-full text-white">
                <FilePlus className="w-10 h-10" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-700">
                  {isDragActive ? "Drop your PDFs here" : "Select PDF files"}
                </p>
                <p className="text-gray-500 mt-2">or drop PDFs here</p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Settings2 className="w-5 h-5 mr-2 text-[#1A237E]" />
                Organize your files ({files.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-8">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative bg-white border border-gray-200 rounded-xl p-3 group shadow-sm hover:shadow-md transition-shadow">
                    
                    <button 
                      onClick={() => removeFile(index)}
                      className="absolute -top-3 -right-3 bg-white text-gray-400 border border-gray-200 hover:text-red-500 hover:border-red-200 z-10 transition-colors p-1.5 rounded-full shadow-sm"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-3 h-48 relative pointer-events-none">
                      <div className="scale-90 transform-origin-top">
                        <PdfDocument 
                          file={file}
                          loading={
                            <div className="flex flex-col items-center justify-center text-gray-400 mt-16">
                              <Loader2 className="w-6 h-6 animate-spin mb-2" />
                              <span className="text-xs">Loading...</span>
                            </div>
                          }
                        >
                          <PdfPage 
                            pageNumber={1} 
                            height={160}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-sm border border-gray-200 bg-white"
                          />
                        </PdfDocument>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium text-gray-700 text-sm truncate" title={file.name}>{file.name}</span>
                        <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="flex flex-col space-y-1 ml-2 shrink-0">
                        <button 
                          onClick={() => moveFile(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-[#1A237E] hover:bg-indigo-50 disabled:opacity-30 bg-gray-50 p-1 rounded transition-colors"
                        >
                          ▲
                        </button>
                        <button 
                          onClick={() => moveFile(index, 'down')}
                          disabled={index === files.length - 1}
                          className="text-gray-400 hover:text-[#1A237E] hover:bg-indigo-50 disabled:opacity-30 bg-gray-50 p-1 rounded transition-colors"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isProcessing}
                  className="bg-[#1A237E] hover:bg-indigo-800 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Merging PDFs...
                    </>
                  ) : (
                    <>
                      Merge PDF
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">PDFs merged successfully!</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your files have been combined into a single PDF document. Click below to download it.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href={mergedPdfUrl}
              download="merged-document.pdf"
              className="bg-[#1A237E] hover:bg-indigo-800 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center"
            >
              <Download className="w-6 h-6 mr-3" />
              Download merged PDF
            </a>
            <button
              onClick={() => {
                setMergedPdfUrl(null);
                setFiles([]);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              Merge more PDFs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
