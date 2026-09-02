export default function PatientsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-36 bg-muted rounded animate-pulse" />
          <div className="h-4 w-52 bg-muted rounded animate-pulse mt-1.5" />
        </div>
        <div className="h-10 w-40 bg-muted rounded-xl animate-pulse" />
      </div>

      {/* Search skeleton */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <div className="h-10 max-w-md bg-muted rounded-xl animate-pulse" />
      </div>

      {/* List skeleton */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl"
          >
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-muted rounded-md animate-pulse" />
                <div className="h-5 w-28 bg-muted rounded-md animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
