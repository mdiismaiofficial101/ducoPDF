'use client';
import dynamic from 'next/dynamic';

const ToolWorkspace = dynamic(() => import('@/components/tools/ToolWorkspace'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#1A237E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Loading workspace...</p>
      </div>
    </div>
  ),
});
export default function PdfToPdfaPage() {
  return <ToolWorkspace toolId="pdf-to-pdfa" />;
}
