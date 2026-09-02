'use client';

import Link from 'next/link';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@aion/ui';
import { Button } from '@aion/ui';
import type { Patient } from '@aion/vendor-medplum';
import type { AppointmentWithPatient } from '@aion/domain';

interface Props {
  patient: Patient;
  onEdit: () => void;
  onDelete: () => void;
  nextAppointment?: AppointmentWithPatient | null;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function computeAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function genderLabel(g?: string): string {
  switch (g) {
    case 'male': return 'Masculino';
    case 'female': return 'Femenino';
    case 'other': return 'Otro';
    case 'unknown': return 'Desconocido';
    default: return '—';
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hoy';
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return 'Mañana';
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  } catch {
    return '—';
  }
}

export default function PatientDetail({ patient, onEdit, onDelete, nextAppointment }: Props) {
  const name = patient.name?.[0];
  const fullName = [name?.given?.[0], name?.family].filter(Boolean).join(' ') || 'Sin nombre';
  const age = computeAge(patient.birthDate);
  const initials = fullName.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) || '?';
  const mrn = patient.identifier?.find((id: any) => id.type?.coding?.[0]?.code === 'MR')?.value;

  return (
    <div className="max-w-6xl">
      <Link href="/patients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Volver a pacientes
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Card>
            <div className="h-1 rounded-t-2xl bg-gradient-to-r from-primary/20 to-primary/5" />
            <CardContent className="pt-6 pb-5">
              <div className="flex items-start gap-5">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-xl font-bold text-primary shrink-0 shadow-xs">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold">{fullName}</h1>
                    <Badge variant={patient.active !== false ? 'success' : 'neutral'}>
                      {patient.active !== false ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                    {mrn && <span>MRN: <span className="font-medium text-foreground">{mrn}</span></span>}
                    {age !== null && <span>{age} años</span>}
                    <span>{genderLabel(patient.gender)}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="h-9" onClick={onEdit}>
                    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 text-muted-foreground hover:text-destructive" onClick={onDelete}>
                    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg aria-hidden="true" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <CardTitle className="text-sm font-semibold">Información personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm pt-0">
                <div className="flex justify-between py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">Fecha de nacimiento</span>
                  <span className="font-medium text-right">{formatDate(patient.birthDate)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">Edad</span>
                  <span className="font-medium">{age !== null ? `${age} años` : '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">Género</span>
                  <span className="font-medium">{genderLabel(patient.gender)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">MRN</span>
                  <span className="font-medium">{mrn || '—'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <svg aria-hidden="true" className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <CardTitle className="text-sm font-semibold">Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm pt-0">
                <div className="flex justify-between py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">Teléfono</span>
                  <span className="font-medium text-right">{patient.telecom?.find((t) => t.system === 'phone')?.value || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-right">{patient.telecom?.find((t) => t.system === 'email')?.value || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">Dirección</span>
                  <span className="font-medium text-right max-w-[180px] truncate">
                    {[patient.address?.[0]?.line?.[0], patient.address?.[0]?.city].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <aside className="space-y-4">
          {nextAppointment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Próxima cita</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg aria-hidden="true" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {formatDateShort(nextAppointment.start)} · {formatTime(nextAppointment.start)}
                    </p>
                    {nextAppointment.description && (
                      <p className="text-xs text-muted-foreground">{nextAppointment.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/appointments?date=${nextAppointment.start?.split('T')[0] ?? ''}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">Ver en agenda</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
                  <Button variant="default" size="sm" className="w-full justify-start gap-2 h-9 text-xs" asChild>
                <a href={`/appointments/new`}>
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Nueva cita
                </a>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 text-xs" onClick={onEdit}>
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Editar información
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
