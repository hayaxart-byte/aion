'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@aion/ui';

export default function LoginError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="bg-destructive/15 text-destructive text-sm p-6 rounded-2xl max-w-md text-center space-y-4">
        <p className="font-medium">Error al cargar la página de inicio</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
            Reintentar
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            Resetear
          </Button>
        </div>
      </div>
    </div>
  );
}
