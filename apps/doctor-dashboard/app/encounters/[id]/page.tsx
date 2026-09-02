'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, User, Stethoscope } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, Badge, Spinner, Button } from '@aion/ui';

interface PractitionerInfo {
  id: string;
  name: string;
}

interface EncounterDetail {
  id: string;
  status: string;
  date: string;
  type: string;
  reason: string;
  patientId: string;
  patientName: string;
  practitioners: PractitionerInfo[];
}

const STATUS_MAP: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' | 'destructive' }> = {
  planned: { label: 'Planificado', variant: 'info' },
  arrived: { label: 'Llegó', variant: 'warning' },
  triaged: { label: 'Triaje', variant: 'info' },
  'in-progress': { label: 'En curso', variant: 'warning' },
  onleave: { label: 'En pausa', variant: 'warning' },
  finished: { label: 'Finalizado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function extractName(r: any): string {
  const n = r?.name?.[0];
  if (!n) return '—';
  return `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim() || '—';
}

export default function EncounterDetailPage() {
  const params = useParams();
  const { client } = useAuth();
  const id = params.id as string;
  const [encounter, setEncounter] = useState<EncounterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const enc = await client.readResource('Encounter', id);

      let patientName = '—';
      let patientId = '';
      const subjectRef = enc.subject?.reference ?? '';
      if (subjectRef.startsWith('Patient/')) {
        patientId = subjectRef.replace('Patient/', '');
        try {
          const pat = await client.readResource('Patient', patientId);
          patientName = extractName(pat);
        } catch {
          patientName = '—';
        }
      }

      const practitioners: PractitionerInfo[] = [];
      const participants = (enc.participant ?? []) as any[];
      for (const p of participants) {
        const ref = p.individual?.reference ?? '';
        if (ref.startsWith('Practitioner/')) {
          const pid = ref.replace('Practitioner/', '');
          try {
            const prac = await client.readResource('Practitioner', pid);
            practitioners.push({ id: pid, name: extractName(prac) });
          } catch {
            practitioners.push({ id: pid, name: '—' });
          }
        }
      }

      setEncounter({
        id: enc.id,
        status: enc.status,
        date: enc.period?.start ?? enc.meta?.lastUpdated ?? '',
        type: enc.type?.[0]?.coding?.[0]?.display ?? 'Consulta',
        reason: enc.reasonCode?.[0]?.text ?? '',
        patientId,
        patientName,
        practitioners,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar encuentro');
    } finally {
      setLoading(false);
    }
  }, [client, id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error && !encounter) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md">{error}</div>
        <button className="text-sm text-primary underline mt-3" onClick={load}>Reintentar</button>
      </div>
    );
  }

  if (!encounter) return null;

  const status = STATUS_MAP[encounter.status] ?? { label: encounter.status, variant: 'neutral' as const };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/encounters">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Encuentro Clínico</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(encounter.date)}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="py-5 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Detalles
          </h2>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground min-w-[100px]">Fecha</span>
              <span>{formatDate(encounter.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground min-w-[100px]">Tipo</span>
              <span>{encounter.type}</span>
            </div>
            {encounter.reason && (
              <div className="flex items-start gap-3 text-sm">
                <div className="h-4 w-4 shrink-0" />
                <span className="text-muted-foreground min-w-[100px]">Motivo</span>
                <span>{encounter.reason}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-5 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Paciente
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{encounter.patientName}</p>
            </div>
            {encounter.patientId && (
              <Link href={`/patients/${encounter.patientId}`}>
                <Button variant="outline" size="sm">Ver paciente</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {encounter.practitioners.length > 0 && (
        <Card>
          <CardContent className="py-5 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Profesionales
            </h2>
            <div className="space-y-3">
              {encounter.practitioners.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <p className="font-medium">{p.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
