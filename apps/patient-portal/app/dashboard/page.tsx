'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import type { Appointment, DiagnosticReport, MedicationRequest } from '@aion/vendor-medplum';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@aion/ui';
import { CalendarDays, FlaskConical, Pill } from 'lucide-react';

interface DashboardData {
  nextAppointment: Appointment | null;
  recentReports: DiagnosticReport[];
  activeMedications: MedicationRequest[];
}

function getPatientId(client: any): string | null {
  const profile = client.getProfile();
  if (profile?.resourceType === 'Patient') return profile.id;
  return null;
}

export default function DashboardPage() {
  const { user, client } = useAuth();
  const [data, setData] = useState<DashboardData>({
    nextAppointment: null,
    recentReports: [],
    activeMedications: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const patientId = getPatientId(client);
        if (!patientId) {
          setLoading(false);
          return;
        }

        const [apptResult, reportsResult, medsResult] = await Promise.allSettled([
          client.search('Appointment', {
            'patient': `Patient/${patientId}`,
            'status:not': 'cancelled',
            _sort: 'date',
            _count: 1,
          }),
          client.search('DiagnosticReport', {
            'patient': `Patient/${patientId}`,
            _sort: '-date',
            _count: 5,
          }),
          client.search('MedicationRequest', {
            'patient': `Patient/${patientId}`,
            'status': 'active',
            _count: 10,
          }),
        ]);

        const nextAppointment =
          apptResult.status === 'fulfilled' && apptResult.value.entry?.length
            ? (apptResult.value.entry[0].resource as unknown as Appointment)
            : null;

        const recentReports =
          reportsResult.status === 'fulfilled' && reportsResult.value.entry
            ? reportsResult.value.entry.map((e: any) => e.resource as unknown as DiagnosticReport)
            : [];

        const activeMedications =
          medsResult.status === 'fulfilled' && medsResult.value.entry
            ? medsResult.value.entry.map((e: any) => e.resource as unknown as MedicationRequest)
            : [];

        setData({ nextAppointment, recentReports, activeMedications });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [client]);

  const appt = data.nextAppointment;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bienvenido, {user?.name}</h1>
        <p className="text-muted-foreground">Resumen de tu salud</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Próxima cita</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            ) : appt ? (
              <div>
                <p className="text-sm font-medium">
                  {new Date(appt.start ?? '').toLocaleDateString('es', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(appt.start ?? '').toLocaleTimeString('es', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay citas próximas</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <FlaskConical className="h-4 w-4 text-green-600" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            ) : data.recentReports.length > 0 ? (
              <div className="space-y-1">
                {data.recentReports.slice(0, 3).map((r) => (
                  <p key={r.id} className="text-sm truncate">{r.code?.text ?? 'Estudio'}</p>
                ))}
                {data.recentReports.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{data.recentReports.length - 3} más</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay resultados recientes</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Pill className="h-4 w-4 text-purple-600" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Medicación</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            ) : data.activeMedications.length > 0 ? (
              <div className="space-y-1">
                {data.activeMedications.slice(0, 3).map((m) => (
                  <p key={m.id} className="text-sm truncate">
                    {m.medicationCodeableConcept?.text ?? m.medicationReference?.display ?? 'Medicamento'}
                  </p>
                ))}
                {data.activeMedications.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{data.activeMedications.length - 3} más</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin medicación activa</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
