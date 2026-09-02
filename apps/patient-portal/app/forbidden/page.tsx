'use client';

import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@aion/ui';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl shadow-black/[0.04] text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Acceso Denegado</CardTitle>
          <CardDescription>
            No tienes los permisos necesarios para acceder a esta sección.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/login">Volver al inicio</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Ir al Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
