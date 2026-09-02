export default function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 animate-pulse shrink-0 ml-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
