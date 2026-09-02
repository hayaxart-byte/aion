export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse mt-1.5" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/60 p-5 space-y-3">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
