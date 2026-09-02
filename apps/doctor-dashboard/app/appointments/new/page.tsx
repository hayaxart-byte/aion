'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { invalidate } from '@aion/medplum-client';
import ClinicalAppointmentForm from '@/components/appointment/ClinicalAppointmentForm';

export default function NewAppointmentPage() {
  const { client } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSave(appointment: any) {
    setError(null);
    const result = await client.createResource(appointment);
    invalidate('dashboard');
    router.push(`/appointments`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva cita</h1>
        <p className="text-muted-foreground">Agendar una nueva cita médica</p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      <ClinicalAppointmentForm
        medplum={client}
        onSave={handleSave}
        mode="create"
      />
    </div>
  );
}
