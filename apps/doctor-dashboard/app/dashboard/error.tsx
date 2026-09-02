'use client';

import { Button } from '@aion/ui';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Dashboard clínico</h1>
        <p className="text-sm text-muted-foreground">Resumen operativo del día</p>
      </div>
      <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-xl flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">Error al cargar el dashboard</p>
          <p className="text-xs mt-1 opacity-80">{error.message}</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
