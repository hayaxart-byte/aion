export default function ActivitySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-6" />
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, j) => (
          <div key={j} className="flex items-start gap-3">
            <div className="h-[22px] w-[22px] rounded-full bg-slate-100 animate-pulse shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
