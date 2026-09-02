'use client';

export default function AppointmentsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Gestión de citas médicas</p>
        </div>
      </div>
      <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">Error al cargar citas</p>
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
