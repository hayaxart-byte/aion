'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { PreviewSidebar } from '@/components/onboarding/PreviewSidebar';
import { Button, Card } from '@aion/ui';
import { ArrowLeft, Check, Eye } from 'lucide-react';

export default function PreviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { medicalCenter, bio, profileType, complete, saveToBackend } = useOnboardingStore();

  async function handleComplete() {
    try {
      await saveToBackend();
      complete();
      router.push('/dashboard');
    } catch {
      // Mostrar error toast si falla
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Vista previa</h1>
              <p className="text-sm text-muted-foreground">Revisa tu perfil antes de publicar</p>
            </div>
          </div>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold">{user?.name || 'Nombre'}</p>
                <p className="text-sm text-muted-foreground">
                  {profileType === 'with_agenda' ? 'Médico con agenda' : 'Colaborador'}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Centro</span>
                <span className="font-medium">{medicalCenter.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dirección</span>
                <span className="font-medium text-right max-w-[200px] truncate">
                  {[medicalCenter.address, medicalCenter.city].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono</span>
                <span className="font-medium">{medicalCenter.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium capitalize">{'Básico'}</span>
              </div>
            </div>

            {bio.description && (
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-1">Descripción</p>
                <p className="text-sm line-clamp-3">{bio.description}</p>
              </div>
            )}
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Omitir
              </Button>
              <Button onClick={handleComplete}>
                <Check className="h-4 w-4 mr-1" /> Completar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PreviewSidebar />
    </div>
  );
}
