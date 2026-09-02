'use client';

export default function AdminDashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>
      <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-xl flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">Error al cargar el panel</p>
          <p className="text-xs mt-1 opacity-80">{error.message}</p>
        </div>
        <button
          onClick={reset}
          className="text-xs font-medium underline whitespace-nowrap hover:opacity-80"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
