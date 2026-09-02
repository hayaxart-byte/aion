export default function AppointmentsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-28 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse mt-1" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border/60 p-4 space-y-2">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
          <div className="h-3 w-64 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
