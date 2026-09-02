'use client';

import { Card } from '@aion/ui';
import { Calendar, Users } from 'lucide-react';
import { useOnboardingStore } from '@/lib/onboarding/store';

export function ProfileTypeSelector() {
  const { profileType, setProfileType } = useOnboardingStore();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card
        className={`p-8 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
          profileType === 'with_agenda'
            ? 'ring-2 ring-primary shadow-lg bg-primary/5'
            : 'hover:border-primary/30'
        }`}
        onClick={() => setProfileType('with_agenda')}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Calendar className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Con agenda médica</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Soy médico, psicólogo u otro profesional con consultorio propio.
            </p>
          </div>
        </div>
      </Card>

      <Card
        className={`p-8 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
          profileType === 'without_agenda'
            ? 'ring-2 ring-primary shadow-lg bg-primary/5'
            : 'hover:border-primary/30'
        }`}
        onClick={() => setProfileType('without_agenda')}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Sin agenda médica</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Soy recepcionista, administrador o colaborador de un centro médico.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
