'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { MapSelector } from '@/components/onboarding/MapSelector';
import { geocodeAddress } from '@/lib/onboarding/api';
import { Button, Card, Input } from '@aion/ui';
import { ArrowLeft, ArrowRight, MapPin, Search } from 'lucide-react';
import { useState } from 'react';

export default function MapPage() {
  const router = useRouter();
  const { medicalCenter, setMedicalCenter } = useOnboardingStore();
  const [searchQuery, setSearchQuery] = useState('');

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    const result = await geocodeAddress(searchQuery);
    if (result) {
      setMedicalCenter({ latitude: result.lat, longitude: result.lng });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Ubicación</h1>
            <p className="text-sm text-muted-foreground">Selecciona la ubicación en el mapa</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar dirección..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <MapSelector
          onLocationSelect={(lat, lng) => setMedicalCenter({ latitude: lat, longitude: lng })}
          defaultPosition={
            medicalCenter.latitude && medicalCenter.longitude
              ? [medicalCenter.latitude, medicalCenter.longitude]
              : undefined
          }
        />

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
          </Button>
          <Button onClick={() => router.push('/onboarding/bio')}>
            Continuar <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
