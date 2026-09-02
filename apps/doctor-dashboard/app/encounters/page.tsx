'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, Badge, Spinner } from '@aion/ui';

interface EncounterItem {
  id: string;
  patientId: string;
  patientName: string;
  status: string;
  date: string;
  type: string;
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
    });
  } catch {
    return '—';
  }
}

export default function EncountersPage() {
  const { client } = useAuth();
  const [encounters, setEncounters] = useState<EncounterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.search('Encounter', {
        _count: '50',
        _sort: '-date',
        _include: 'Encounter:patient',
      });
      const entries = (result.entry ?? []) as any[];
      const patients = new Map<string, any>();
      const list: EncounterItem[] = [];

      for (const entry of entries) {
        const r = entry.resource;
        if (r?.resourceType === 'Patient') {
          patients.set(r.id, r);
        }
      }

      for (const entry of entries) {
        const r = entry.resource;
        if (r?.resourceType === 'Encounter') {
          const subjectRef = r.subject?.reference ?? '';
          const pid = subjectRef.replace('Patient/', '');
          const pat = patients.get(pid);
          const n = pat?.name?.[0];
          const name = n
            ? `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim()
            : '—';
          list.push({
            id: r.id,
            patientId: pid,
            patientName: name,
            status: r.status,
            date: r.period?.start ?? r.meta?.lastUpdated ?? '',
            type: r.type?.[0]?.coding?.[0]?.display ?? 'Consulta',
          });
        }
      }

      setEncounters(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar encuentros');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { load(); }, [load]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Encuentros Clínicos</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro de encuentros clínicos</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-xl border border-destructive/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : encounters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            No hay encuentros clínicos registrados.
          </CardContent>
        </Card>
      ) : (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {encounters.length} encuentro{encounters.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="space-y-2">
            {encounters.map((enc) => {
              const status = STATUS_MAP[enc.status] ?? { label: enc.status, variant: 'neutral' as const };
              return (
                <Link
                  key={enc.id}
                  href={`/encounters/${enc.id}`}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md hover:border-slate-200 transition-all duration-200 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-700 truncate">
                        {enc.patientName}
                      </p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(enc.date)} &middot; {enc.type}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0 ml-3" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
