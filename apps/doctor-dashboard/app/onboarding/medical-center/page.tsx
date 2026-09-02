'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { Button, Card, Input, Label } from '@aion/ui';
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';

export default function MedicalCenterPage() {
  const router = useRouter();
  const { medicalCenter, setMedicalCenter } = useOnboardingStore();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push('/onboarding/map');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Centro médico</h1>
            <p className="text-sm text-muted-foreground">Datos del consultorio o clínica</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Nombre del centro</Label>
            <Input
              value={medicalCenter.name}
              onChange={(e) => setMedicalCenter({ name: e.target.value })}
              placeholder="Ej: Consultorio Dr. García"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Input
                value={medicalCenter.country}
                onChange={(e) => setMedicalCenter({ country: e.target.value })}
                placeholder="México"
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                value={medicalCenter.state}
                onChange={(e) => setMedicalCenter({ state: e.target.value })}
                placeholder="CDMX"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Input
                value={medicalCenter.city}
                onChange={(e) => setMedicalCenter({ city: e.target.value })}
                placeholder="Ciudad de México"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={medicalCenter.phone}
                onChange={(e) => setMedicalCenter({ phone: e.target.value })}
                placeholder="+52 55 1234 5678"
                type="tel"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input
              value={medicalCenter.address}
              onChange={(e) => setMedicalCenter({ address: e.target.value })}
              placeholder="Calle, número, colonia"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
            </Button>
            <Button type="submit">
              Continuar <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
