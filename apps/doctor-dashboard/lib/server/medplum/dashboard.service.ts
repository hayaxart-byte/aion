import { cache } from 'react';
import { createServerClient } from '@aion/medplum-client';
import type { DashboardData, AppointmentWithPatient, SummaryData, RecentPatientInfo, ActivityItem } from '@aion/domain';

function extractName(resource: any): string {
  const n = resource?.name?.[0];
  if (!n) return '—';
  return `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim() || '—';
}

function patientIdFromRef(ref: string): string {
  return ref?.startsWith('Patient/') ? ref.replace('Patient/', '') : '';
}

function entriesOf(entries: any[], type: string): any[] {
  return (entries ?? []).filter((e: any) => e?.resourceType === type);
}

function buildPatientMap(resources: any[]): Map<string, any> {
  const map = new Map<string, any>();
  for (const r of resources ?? []) {
    if (r?.resourceType === 'Patient' && r.id) {
      map.set(r.id, r);
    }
  }
  return map;
}

export const getDashboardData = cache(async (accessToken: string): Promise<DashboardData> => {
  const fhir = createServerClient(accessToken);
  const today = new Date().toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [todayRes, upcomingRes, encRes, apptActRes, patActRes] = await Promise.all([
    fhir.search('Appointment', { 'date:ge': today, 'date:lt': tomorrowStr, _count: '100' }),
    fhir.search('Appointment', {
      'date:ge': today,
      'status:not': 'cancelled',
      _sort: 'date',
      _count: '5',
      _include: 'Appointment:patient',
    }),
    fhir.search('Encounter', {
      _sort: '-_lastUpdated',
      _count: '5',
      _include: 'Encounter:patient',
    }),
    fhir.search('Appointment', { _sort: '-_lastUpdated', _count: '5' }),
    fhir.search('Patient', { _sort: '-_lastUpdated', _count: '5' }),
  ]);

  const allToday = (todayRes.entry ?? []).map((e: any) => e.resource);

  const upResources = (upcomingRes.entry ?? []).map((e: any) => e.resource);
  const upPatMap = buildPatientMap(upResources);
  const upcoming: AppointmentWithPatient[] = entriesOf(upResources, 'Appointment').map((a: any) => {
    const ref = a.participant?.find((p: any) => p?.actor?.reference?.startsWith('Patient/'));
    return {
      id: a.id,
      patientName: extractName(upPatMap.get(patientIdFromRef(ref?.actor?.reference ?? ''))),
      patientId: patientIdFromRef(ref?.actor?.reference ?? ''),
      start: a.start,
      status: a.status,
      description: a.description,
    };
  });

  const next = upcoming[0] ?? null;

  const summary: SummaryData = {
    todayAppointments: allToday.length,
    nextAppointment: next
      ? {
          id: next.id,
          patientName: next.patientName,
          patientId: next.patientId,
          start: next.start,
          status: next.status,
          description: next.description,
        }
      : null,
    pendingCount: allToday.filter((r: any) => r.status === 'pending').length,
    cancelledCount: allToday.filter((r: any) => r.status === 'cancelled').length,
  };

  const encResources = (encRes.entry ?? []).map((e: any) => e.resource);
  const ePatMap = buildPatientMap(encResources);
  const seen = new Set<string>();
  const recentPatients: RecentPatientInfo[] = [];
  for (const enc of entriesOf(encResources, 'Encounter')) {
    const pid = patientIdFromRef(enc.subject?.reference ?? '');
    if (!pid || seen.has(pid)) continue;
    seen.add(pid);
    const pat = ePatMap.get(pid);
    recentPatients.push({
      id: pid,
      name: extractName(pat),
      lastVisit: enc.period?.start ?? enc.meta?.lastUpdated ?? '',
      gender: pat?.gender,
    });
  }

  const activity: ActivityItem[] = [];
  for (const r of entriesOf((apptActRes.entry ?? []).map((e: any) => e.resource), 'Appointment')) {
    activity.push({
      id: `appt-${r.id}`,
      type: r.status === 'cancelled' ? 'appointment_cancelled' : 'appointment_created',
      description:
        r.status === 'cancelled'
          ? `Cita cancelada${r.description ? ': ' + r.description : ''}`
          : `Nueva cita${r.description ? ': ' + r.description : ''}`,
      timestamp: r.meta?.lastUpdated ?? r.created ?? '',
    });
  }
  for (const r of entriesOf((patActRes.entry ?? []).map((e: any) => e.resource), 'Patient')) {
    activity.push({
      id: `pat-${r.id}`,
      type: 'patient_registered',
      description: 'Nuevo paciente registrado',
      timestamp: r.meta?.lastUpdated ?? '',
    });
  }
  activity.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return { summary, upcoming, recentPatients, activity: activity.slice(0, 10) };
});
