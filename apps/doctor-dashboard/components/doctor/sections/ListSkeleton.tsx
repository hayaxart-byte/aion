export default function ListSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="h-4 w-28 bg-slate-100 rounded animate-pulse mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, j) => (
          <div key={j} className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
