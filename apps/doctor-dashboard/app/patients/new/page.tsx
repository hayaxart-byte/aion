'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { invalidate } from '@aion/medplum-client';
import ClinicalPatientForm from '@/components/patient/ClinicalPatientForm';

export default function NewPatientPage() {
  const { client } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSave(patient: any) {
    setError(null);
    const result = await client.createResource(patient);
    invalidate('dashboard');
    router.push(`/patients/${result.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo paciente</h1>
        <p className="text-muted-foreground">Registrar un nuevo paciente en el sistema</p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      <ClinicalPatientForm
        medplum={client}
        onSave={handleSave}
        mode="create"
      />
    </div>
  );
}
