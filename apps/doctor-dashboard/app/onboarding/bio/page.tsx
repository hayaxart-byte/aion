'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { BioUploader } from '@/components/onboarding/BioUploader';
import { Button } from '@aion/ui';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';

export default function BioPage() {
  const router = useRouter();
  const { bio, setBio } = useOnboardingStore();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Tu perfil</h1>
            <p className="text-sm text-muted-foreground">Foto y descripción profesional</p>
          </div>
        </div>

        <BioUploader
          avatarUrl={bio.avatarUrl}
          description={bio.description}
          onAvatarChange={(avatarUrl) => setBio({ avatarUrl })}
          onDescriptionChange={(description) => setBio({ description })}
        />

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
          </Button>
          <Button onClick={() => router.push('/onboarding/verify')}>
            Continuar <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
