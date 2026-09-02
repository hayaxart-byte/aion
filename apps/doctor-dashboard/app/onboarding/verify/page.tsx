'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { Button, Input } from '@aion/ui';

export default function VerifyPage() {
  const router = useRouter();
  const { verification, setVerification } = useOnboardingStore();
  const [email, setEmail] = useState(verification.email || '');

  function handleContinue() {
    setVerification({ email: email.trim(), verified: true });
    router.push('/onboarding/preview');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Verifica tu correo</h1>
          <p className="text-sm text-muted-foreground">Confirma tu correo electrónico para continuar</p>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="verify-email" className="text-sm font-medium text-foreground">Correo electrónico</label>
            <Input
              id="verify-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => router.push('/onboarding/bio')} className="flex-1">
              Atrás
            </Button>
            <Button onClick={handleContinue} className="flex-1" disabled={!email.trim()}>
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
