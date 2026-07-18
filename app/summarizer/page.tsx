'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Sparkles, FileText, Download, Loader2, ArrowRight, X, Copy, Check, CheckCircle2, ArrowLeft } from 'lucide-react';
import { addProcessingHistory } from '@/lib/auth';

// React-Markdown is great for rendering Markdown from Gemini!
// Let's create a dynamic simple markdown viewer or use standard Tailwind styling
export default function AISummarizerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [summaryType, setSummaryType] = useState<'summary' | 'bullets' | 'qa'>('summary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [stepMessage, setStepMessage] = useState('');

  // When a file is dropped, convert to base64
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setSummaryResult('');
      setPdfBase64('');
      setIsExtracting(true);
      setStepMessage('Reading PDF layout...');

      try {
        const reader = new FileReader();
        reader.readAsDataURL(selected);
        reader.onload = () => {
          const base64Data = (reader.result as string).split(',')[1];
          setPdfBase64(base64Data);
          setIsExtracting(false);
        };
        reader.onerror = (err) => {
          console.error("FileReader error:", err);
          alert("Failed to read PDF file.");
          setFile(null);
          setIsExtracting(false);
        };
      } catch (err: any) {
        console.error("Failed to read PDF file:", err);
        alert(err.message || "Could not read PDF file.");
        setFile(null);
        setIsExtracting(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  const handleSummarize = async () => {
    if (!pdfBase64) return;
    setIsProcessing(true);
    setStepMessage('Gemini is analyzing document themes...');

    const messages = [
      'Gemini is analyzing document themes...',
      'Synthesizing key insights...',
      'Structuring sections and findings...',
      'Formatting markdown response...'
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setStepMessage(messages[msgIndex]);
    }, 2500);

    try {
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64, type: summaryType }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary.');
      }

      setSummaryResult(data.result);

      // Log successful AI summarization in workspace history
      const sizeStr = `${((file?.size || 0) / 1024 / 1024).toFixed(2)} MB`;
      const baseName = file?.name.substring(0, file?.name.lastIndexOf('.')) || 'document';
      addProcessingHistory('AI Summary', `${baseName}_summary.md`, sizeStr);
    } catch (error: any) {
      console.error('Error during AI summarization:', error);
      alert(error.message || 'An error occurred during AI summarization.');
    } finally {
      clearInterval(interval);
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => router.push('/')} className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition cursor-pointer mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-[#FF6F00] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 shadow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Server-Side Gemini 3.5 AI</span>
        </div>
        <h1 className="text-4xl font-bold text-[#1A237E] mb-4">AI PDF Summarizer</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload any document to summarize main ideas, extract bulleted lists, or generate practice study questions instantly.
        </p>
      </div>

      {!summaryResult ? (
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
                <div className="bg-gradient-to-r from-amber-500 to-[#FF6F00] p-4 rounded-full text-white shadow-md">
                  <Sparkles className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-700">
                    {isDragActive ? "Drop your PDF here" : "Select PDF file to Summarize"}
                  </p>
                  <p className="text-gray-500 mt-2">supports document extraction up to 30 pages</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Loaded File Indicator */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#1A237E] p-3 rounded-lg text-white shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 max-w-xs md:max-w-md truncate">{file.name}</h3>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB &bull; Text extraction ready
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setFile(null);
                    setPdfBase64('');
                  }}
                  disabled={isExtracting || isProcessing}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-2 transition-colors disabled:opacity-50"
                  title="Remove file"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {isExtracting ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-[#1A237E] mb-4" />
                  <p className="font-semibold text-gray-700">{stepMessage}</p>
                  <p className="text-xs text-gray-500 mt-2">Parsing metadata and text layers inside the browser...</p>
                </div>
              ) : (
                <div className="max-w-xl mx-auto">
                  {/* Selector for summary format */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
                    <h3 className="text-base font-semibold text-slate-800 mb-4 text-center">
                      Choose Summary Format
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setSummaryType('summary')}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          summaryType === 'summary' 
                            ? 'border-[#FF6F00] bg-amber-50/50 text-[#FF6F00] font-semibold shadow-sm' 
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-sm">Comprehensive</span>
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">High-level sections</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSummaryType('bullets')}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          summaryType === 'bullets' 
                            ? 'border-[#FF6F00] bg-amber-50/50 text-[#FF6F00] font-semibold shadow-sm' 
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-sm">Key Takeaways</span>
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Actionable bullets</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSummaryType('qa')}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          summaryType === 'qa' 
                            ? 'border-[#FF6F00] bg-amber-50/50 text-[#FF6F00] font-semibold shadow-sm' 
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-sm">Study Q&A</span>
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Q&As for study</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleSummarize}
                      disabled={isProcessing}
                      className="w-full bg-[#1A237E] hover:bg-indigo-800 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-indigo-900/10 transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          <span>{stepMessage}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          <span>Summarize PDF with Gemini</span>
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Result layout */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header toolbar */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-slate-800 text-sm md:text-base">Gemini Intelligence Synthesis</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy text</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setSummaryResult('');
                  setFile(null);
                  setPdfBase64('');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
              >
                New Document
              </button>
            </div>
          </div>

          {/* Render text with clean standard display styling */}
          <div className="p-6 md:p-10 text-slate-800 leading-relaxed max-w-none text-base md:text-lg">
            <div className="space-y-4 whitespace-pre-wrap select-text font-sans">
              {summaryResult}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
