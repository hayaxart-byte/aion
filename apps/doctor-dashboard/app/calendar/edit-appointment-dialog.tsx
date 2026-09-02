'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
} from '@aion/ui';
import { useAuth } from '@/lib/auth';
import ClinicalAppointmentForm from '@/components/appointment/ClinicalAppointmentForm';
import type { CalendarAppointment } from './use-week-appointments';

interface Props {
  open: boolean;
  appointment: CalendarAppointment | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditAppointmentDialog({
  open, appointment, onClose, onSaved,
}: Props) {
  const { client } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSave(updated: any) {
    setError(null);
    try {
      await client.updateResource(updated);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la cita');
    }
  }

  async function handleCancel() {
    if (!appointment) return;
    setError(null);
    try {
      await client.updateResource({
        ...appointment.resource,
        status: 'cancelled',
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar la cita');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar cita</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mx-6">{error}</div>
        )}
        {appointment && (
          <>
            <ClinicalAppointmentForm
              medplum={client}
              mode="edit"
              defaultValue={appointment.resource}
              onSave={handleSave}
            />
            <div className="px-6 pb-6">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleCancel}
              >
                Cancelar cita
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
