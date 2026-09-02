export default function AppointmentsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 bg-muted rounded animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/60 p-4 space-y-2">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
