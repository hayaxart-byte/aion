'use client';

import { useRouter } from 'next/navigation';
import { ProfileTypeSelector } from '@/components/onboarding/ProfileTypeSelector';
import { Button } from '@aion/ui';
import { ArrowRight } from 'lucide-react';

export default function OnboardingStep0() {
  const router = useRouter();

  function handleContinue() {
    router.push('/onboarding/medical-center');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">¿Cómo deseas usar la plataforma?</h1>
          <p className="text-muted-foreground">
            Selecciona el perfil que mejor describa tu actividad profesional
          </p>
        </div>

        <ProfileTypeSelector />

        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={handleContinue}>
            Continuar
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
