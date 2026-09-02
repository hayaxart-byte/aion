'use client';

import { useAuth } from '@/lib/auth';
import { useMedplumQuery, invalidate } from '@aion/medplum-client';
import type { Appointment } from '@aion/vendor-medplum';

export interface CalendarAppointment {
  id: string;
  patientName: string;
  patientId: string;
  start: Date;
  end: Date;
  status: string;
  description?: string;
  type: 'new' | 'followup' | 'telemedicine' | 'checkup' | 'emergency' | 'other';
  channel: 'in_person' | 'video' | 'phone';
  resource: Appointment;
}

function extractAppointmentType(r: Appointment): CalendarAppointment['type'] {
  const code = r.appointmentType?.coding?.[0]?.code ?? '';
  if (code === 'NEW') return 'new';
  if (code === 'FOLLOWUP' || code === 'FUP') return 'followup';
  if (code === 'TELEMED' || code === 'TV') return 'telemedicine';
  if (code === 'CHECKUP' || code === 'CHK') return 'checkup';
  if (code === 'EMER' || code === 'EM') return 'emergency';
  const text = r.appointmentType?.text ?? r.serviceType?.[0]?.coding?.[0]?.display ?? '';
  if (/nuev|primera/i.test(text)) return 'new';
  if (/seguim|subsec|reconsulta/i.test(text)) return 'followup';
  if (/telemed|virtual|video/i.test(text)) return 'telemedicine';
  return 'other';
}

function extractChannel(r: Appointment): CalendarAppointment['channel'] {
  const cat = r.serviceCategory?.[0]?.coding?.[0]?.code ?? '';
  if (cat === 'video' || cat === 'tv') return 'video';
  if (cat === 'phone') return 'phone';
  const text = r.serviceCategory?.[0]?.text ?? '';
  if (/video|virtual/i.test(text)) return 'video';
  if (/telefono|phone/i.test(text)) return 'phone';
  return 'in_person';
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function extractPatientName(pat: any): string {
  const n = pat?.name?.[0];
  if (!n) return '—';
  return `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim() || '—';
}

export function useWeekAppointments(weekStart: Date) {
  const { client } = useAuth();
  const monday = getMonday(weekStart);
  const mondayStr = dateStr(monday);
  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);
  const nextMondayStr = dateStr(nextMonday);

  const key = `calendar:${mondayStr}`;

  const { data, isLoading, error } = useMedplumQuery(
    key,
    async () => {
      const result = await client.search('Appointment', {
        'date:ge': mondayStr,
        'date:lt': nextMondayStr,
        _include: 'Appointment:patient',
        _sort: 'date',
      });

      const entries = (result.entry ?? []) as any[];
      const patients = new Map<string, any>();
      const appointments: CalendarAppointment[] = [];

      for (const entry of entries) {
        const r = entry.resource;
        if (r?.resourceType === 'Patient') {
          patients.set(r.id, r);
        }
      }

      for (const entry of entries) {
        const r = entry.resource;
        if (r?.resourceType === 'Appointment') {
          const ref = r.participant?.find((p: any) =>
            p?.actor?.reference?.startsWith('Patient/')
          );
          const pid = ref?.actor?.reference?.replace('Patient/', '') ?? '';
          const pat = patients.get(pid);
          appointments.push({
            id: r.id,
            patientName: pat ? extractPatientName(pat) : '—',
            patientId: pid,
            start: new Date(r.start),
            end: new Date(r.end),
            status: r.status,
            description: r.description,
            type: extractAppointmentType(r),
            channel: extractChannel(r),
            resource: r,
          });
        }
      }

      return appointments;
    },
    { staleTime: 30_000 }
  );

  return {
    appointments: data ?? [],
    isLoading,
    error,
    refresh: () => invalidate(key),
  };
}
