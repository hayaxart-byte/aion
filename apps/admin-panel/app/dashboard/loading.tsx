export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-48 bg-muted rounded animate-pulse" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 p-5 space-y-3">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
