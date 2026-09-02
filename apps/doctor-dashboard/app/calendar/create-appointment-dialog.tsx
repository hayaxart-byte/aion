'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@aion/ui';
import { useAuth } from '@/lib/auth';
import ClinicalAppointmentForm from '@/components/appointment/ClinicalAppointmentForm';

interface Props {
  open: boolean;
  onClose: () => void;
  prefillDate: Date;
  prefillHour: number;
  prefillMinute: number;
  onSaved: () => void;
}

export default function CreateAppointmentDialog({
  open, onClose, prefillDate, prefillHour, prefillMinute, onSaved,
}: Props) {
  const { client } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const start = new Date(prefillDate);
  start.setHours(prefillHour, prefillMinute, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  async function handleSave(appointment: any) {
    setError(null);
    try {
      await client.createResource(appointment);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cita');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
          <DialogDescription>
            {start.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' — '}
            {start.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mx-6">{error}</div>
        )}
        <ClinicalAppointmentForm
          medplum={client}
          mode="create"
          defaultValue={{
            resourceType: 'Appointment',
            status: 'booked',
            start: start.toISOString(),
            end: end.toISOString(),
            participant: [],
          }}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
}
