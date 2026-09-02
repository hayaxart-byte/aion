'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { PlanSelector } from '@/components/onboarding/PlanSelector';
import { PreviewSidebar } from '@/components/onboarding/PreviewSidebar';
import { Button } from '@aion/ui';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function PlansPage() {
  const router = useRouter();
  const { plan, setPlan } = useOnboardingStore();

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold">Elige tu plan</h1>
            <p className="text-muted-foreground">Selecciona el plan que mejor se adapte a tus necesidades</p>
          </div>

          <PlanSelector
            selected={plan.type}
            interval={plan.interval}
            onSelect={(type) => setPlan({ type })}
            onIntervalChange={(interval) => setPlan({ interval })}
          />

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
            </Button>
            <Button
              disabled={!plan.type}
              onClick={() => router.push('/onboarding/preview')}
            >
              Continuar <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <PreviewSidebar />
    </div>
  );
}
