export function ToolSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-6 w-32 bg-slate-200 rounded-full" />
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-200 w-16 h-16" />
          <div>
            <div className="h-8 w-64 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-48 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-20 bg-slate-200 rounded-2xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 h-80" />
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 h-64" />
        </div>
      </div>
    </div>
  );
}

export function BlogSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-8 w-64 bg-slate-200 rounded mb-4" />
        <div className="h-4 w-96 bg-slate-200 rounded mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="h-6 w-48 bg-slate-200 rounded mb-3" />
              <div className="h-4 w-full bg-slate-200 rounded mb-2" />
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="relative h-[50vh] bg-slate-100" />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center gap-3 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 bg-slate-200 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 h-40" />
          ))}
        </div>
      </div>
    </div>
  );
}
