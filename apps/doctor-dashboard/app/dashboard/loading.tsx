export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      <div>
        <div className="h-7 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse mt-1.5" />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/60 overflow-hidden">
            <div className="h-1 bg-muted" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/60 p-5 space-y-3">
            <div className="h-4 w-36 bg-muted rounded animate-pulse" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
