'use client';

import { Button } from '@aion/ui';

export default function PatientsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">Lista de pacientes registrados</p>
        </div>
      </div>
      <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-xl flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">Error al cargar pacientes</p>
          <p className="text-xs mt-1 opacity-80">{error.message}</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
