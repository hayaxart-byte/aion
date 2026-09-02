'use client';

import { useEffect, useState } from 'react';
import type { MedplumClient } from '@aion/vendor-medplum';
import type { Appointment, Patient } from '@aion/vendor-medplum';
import { Card, CardContent, CardHeader, CardTitle } from '@aion/ui';
import { Button } from '@aion/ui';
import { Input } from '@aion/ui';
import { Select } from '@aion/ui';
import { Textarea } from '@aion/ui';

const APPOINTMENT_STATUSES = [
  { value: 'booked', label: 'Confirmada' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'arrived', label: 'Llegó el paciente' },
  { value: 'fulfilled', label: 'Completada' },
] as const;

interface Props {
  medplum: MedplumClient;
  defaultValue?: Appointment;
  onSave: (appointment: Appointment) => Promise<void>;
  mode: 'create' | 'edit';
}

export default function ClinicalAppointmentForm({ medplum, defaultValue, onSave, mode }: Props) {
  const [appointment, setAppointment] = useState<Appointment>(
    defaultValue ?? {
      resourceType: 'Appointment',
      status: 'booked',
      start: '',
      end: '',
      participant: [],
    }
  );
  const [patientQuery, setPatientQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    const ref = defaultValue?.participant?.[0]?.actor?.reference ?? '';
    if (ref.startsWith('Patient/')) {
      return { resourceType: 'Patient', id: ref.replace('Patient/', '') } as Patient;
    }
    return null;
  });
  const [duration, setDuration] = useState(30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPatientName = selectedPatient
    ? extractPatientName(selectedPatient)
    : null;

  useEffect(() => {
    if (!patientQuery.trim()) {
      setPatients([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await medplum.search('Patient', {
          name: patientQuery,
          _count: '10',
        });
        if (!cancelled) {
          setPatients((result.entry ?? []).map((e) => e.resource as Patient));
        }
      } catch {
        if (!cancelled) setPatients([]);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [medplum, patientQuery]);

  function handleStartChange(iso: string) {
    const start = iso;
    const end = computeEnd(start, duration);
    setAppointment((prev) => ({ ...prev, start, end }));
  }

  function handleDurationChange(min: number) {
    setDuration(min);
    setAppointment((prev) => ({ ...prev, end: computeEnd(prev.start ?? '', min) }));
  }

  function selectPatient(pat: Patient) {
    setSelectedPatient(pat);
    setShowPatientPicker(false);
    setPatientQuery('');
    setAppointment((prev) => ({
      ...prev,
      participant: [
        {
          actor: { reference: `Patient/${pat.id}`, display: extractPatientName(pat) },
          status: 'accepted',
        },
      ],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appointment.start) {
      setError('La fecha y hora de la cita son obligatorias');
      return;
    }
    if (!selectedPatient) {
      setError('Debe seleccionar un paciente');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(appointment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la cita');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de la cita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Paciente <span className="text-destructive">*</span>
            </label>
            {currentPatientName ? (
              <div className="flex items-center justify-between px-3 py-2 border border-input rounded-md bg-background text-sm">
                <span>{currentPatientName}</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline"
                  onClick={() => {
                    setSelectedPatient(null);
                    setAppointment((prev) => ({ ...prev, participant: [] }));
                  }}
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Buscar paciente por nombre..."
                  value={patientQuery}
                  onChange={(e) => {
                    setPatientQuery(e.target.value);
                    setShowPatientPicker(true);
                  }}
                  onFocus={() => setShowPatientPicker(true)}
                />
                {showPatientPicker && patientQuery.trim() && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-background border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {patients.length === 0 ? (
                      <p className="text-sm text-muted-foreground px-3 py-2">
                        {patientQuery.length < 2 ? 'Escriba al menos 2 caracteres' : 'Sin resultados'}
                      </p>
                    ) : (
                      patients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                          onClick={() => selectPatient(p)}
                        >
                          {extractPatientName(p)}
                          {p.birthDate && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({p.birthDate})
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Fecha y hora <span className="text-destructive">*</span>
            </label>
            <Input
              type="datetime-local"
              value={appointment.start ? appointment.start.slice(0, 16) : ''}
              onChange={(e) => handleStartChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Duración</label>
            <Select
              value={duration}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Estado</label>
            <Select
              value={appointment.status}
              onChange={(e) =>
                setAppointment((prev) => ({ ...prev, status: e.target.value as Appointment['status'] }))
              }
            >
              {APPOINTMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Motivo de la consulta</label>
            <Textarea
              rows={2}
              value={appointment.description ?? ''}
              onChange={(e) =>
                setAppointment((prev) => ({ ...prev, description: e.target.value || undefined }))
              }
              placeholder="Describa el motivo de la cita"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : mode === 'create' ? 'Crear cita' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}

function extractPatientName(pat: Patient): string {
  const n = pat.name?.[0];
  if (!n) return '—';
  return `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim() || '—';
}

function computeEnd(start: string, durationMinutes: number): string {
  if (!start) return '';
  try {
    const d = new Date(start);
    d.setMinutes(d.getMinutes() + durationMinutes);
    return d.toISOString();
  } catch {
    return '';
  }
}
