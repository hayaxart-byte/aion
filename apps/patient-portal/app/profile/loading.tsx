export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 bg-muted rounded animate-pulse" />
      <div className="rounded-lg border border-border/60 p-5 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
