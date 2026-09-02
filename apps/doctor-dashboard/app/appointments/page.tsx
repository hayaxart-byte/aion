'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, Button, Badge, Spinner, Input } from '@aion/ui';

interface AppointmentItem {
  id: string;
  patientName: string;
  patientId: string;
  status: string;
  start: string;
  description?: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' | 'destructive' }> = {
  booked: { label: 'Confirmada', variant: 'info' },
  pending: { label: 'Pendiente', variant: 'warning' },
  arrived: { label: 'Llegó', variant: 'success' },
  fulfilled: { label: 'Completada', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
  noshow: { label: 'No asistió', variant: 'neutral' },
};

export default function AppointmentsPage() {
  const { client } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextDay = new Date(dateFilter);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      const result = await client.search('Appointment', {
        'date:ge': dateFilter,
        'date:lt': nextDayStr,
        _include: 'Appointment:patient',
      });
      const entries = (result.entry ?? []) as any[];
      const patients = new Map<string, any>();
      const appts: AppointmentItem[] = [];

      for (const entry of entries) {
        const r = entry.resource;
        if (r?.resourceType === 'Patient') {
          patients.set(r.id, r);
        }
      }

      for (const entry of entries) {
        const r = entry.resource;
        if (r?.resourceType === 'Appointment') {
          const ref = r.participant?.find((p: any) => p?.actor?.reference?.startsWith('Patient/'));
          const pid = ref?.actor?.reference?.replace('Patient/', '') ?? '';
          const pat = patients.get(pid);
          const name = pat ? extractName(pat) : '—';
          appts.push({
            id: r.id,
            patientName: name,
            patientId: pid,
            status: r.status,
            start: r.start ?? '',
            description: r.description,
          });
        }
      }

      appts.sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
      setAppointments(appts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, [client, dateFilter]);

  useEffect(() => { load(); }, [load]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Gestión de citas médicas</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            className="w-auto"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <Link href="/appointments/new">
            <Button>Nueva cita</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay citas para esta fecha.{' '}
            <Link href="/appointments/new" className="text-primary underline">
              Agendar una cita
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const status = STATUS_MAP[a.status] ?? { label: a.status, variant: 'neutral' as const };
            return (
              <Card key={a.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{a.patientName}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(a.start)}
                      {a.description && <span> &middot; {a.description}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    {a.patientId && (
                      <Link href={`/patients/${a.patientId}`}>
                        <Button variant="outline" size="sm">Paciente</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function extractName(pat: any): string {
  const n = pat.name?.[0];
  if (!n) return '—';
  return `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim() || '—';
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}
