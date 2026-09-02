'use client';

import { AlertTriangle, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { Badge, cn } from '@aion/ui';
import type { Patient } from '@aion/vendor-medplum';
import type { AppointmentWithPatient } from '@aion/domain';

interface PatientProfileHeaderProps {
  patient: Patient;
  allergiesCount?: number;
  nextAppointment?: AppointmentWithPatient | null;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
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

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export function PatientProfileHeader({
  patient,
  allergiesCount = 0,
  nextAppointment,
}: PatientProfileHeaderProps) {
  const n = patient.name?.[0];
  const fullName = [n?.given?.[0], n?.family].filter(Boolean).join(' ') || 'Sin nombre';
  const email = patient.telecom?.find((t) => t.system === 'email')?.value;
  const phone = patient.telecom?.find((t) => t.system === 'phone')?.value;
  const genderClass =
    patient.gender === 'female'
      ? 'bg-rose-50 text-rose-600'
      : patient.gender === 'male'
        ? 'bg-blue-50 text-blue-600'
        : 'bg-slate-100 text-slate-600';

  return (
    <div className="bg-white border-b border-border/50 px-6 py-5">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
        <div
          className={cn(
            'h-16 w-16 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 shadow-sm',
            genderClass
          )}
        >
          {initials(fullName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>

            {allergiesCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1.5 text-xs">
                <AlertTriangle className="h-3 w-3" />
                {allergiesCount} Alergia{allergiesCount > 1 ? 's' : ''}
              </Badge>
            )}

            <Badge
              variant={patient.active !== false ? 'success' : 'neutral'}
              className="text-xs"
            >
              {patient.active !== false ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
            {phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {phone}
              </span>
            )}
            {email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                  {email}
                </a>
              </span>
            )}
            {nextAppointment && (
              <span className="flex items-center gap-1.5 text-blue-600">
                <Calendar className="h-3.5 w-3.5" />
                Próxima cita: {formatDateShort(nextAppointment.start)} ·{' '}
                {formatTime(nextAppointment.start)}
              </span>
            )}
            <span className="text-xs text-gray-400">
              #{patient.id?.substring(0, 12)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
