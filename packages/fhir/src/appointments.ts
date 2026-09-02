import type { MedplumClient } from '@aion/vendor-medplum';
import type { Appointment } from '@aion/vendor-medplum';
import { extractName } from '@aion/domain';

export interface AppointmentSummary {
  id: string;
  patientName: string;
  patientId: string;
  status: string;
  start: string;
  description?: string;
}

export async function getAppointments(
  medplum: MedplumClient,
  dateFilter?: string,
): Promise<AppointmentSummary[]> {
  const params: Record<string, string> = {};
  if (dateFilter) {
    params.date = dateFilter;
  }
  params._include = 'Appointment:patient';
  const result = await medplum.search('Appointment', params);
  const entries = (result.entry ?? []) as any[];
  const patients = new Map<string, any>();
  const appts: AppointmentSummary[] = [];

  for (const entry of entries) {
    const r = entry.resource;
    if (r?.resourceType === 'Patient') {
      patients.set(r.id, r);
    } else if (r?.resourceType === 'Appointment') {
      const ref = r.participant?.find(
        (p: any) => p?.actor?.reference?.startsWith('Patient/'),
      );
      const pid = ref?.actor?.reference?.replace('Patient/', '') ?? '';
      const pat = patients.get(pid);
      appts.push({
        id: r.id,
        patientName: pat ? extractName(pat) : '—',
        patientId: pid,
        status: r.status,
        start: r.start ?? '',
        description: r.description,
      });
    }
  }

  appts.sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
  return appts;
}

export async function getAppointment(
  medplum: MedplumClient,
  id: string,
): Promise<Appointment> {
  return medplum.readResource('Appointment', id) as Promise<Appointment>;
}

export async function createAppointment(
  medplum: MedplumClient,
  appointment: any,
): Promise<Appointment> {
  return medplum.createResource(appointment) as Promise<Appointment>;
}

export async function getTodaysAppointments(
  medplum: MedplumClient,
): Promise<AppointmentSummary[]> {
  const today = new Date().toISOString().split('T')[0];
  return getAppointments(medplum, today);
}

export async function getUpcomingAppointments(
  medplum: MedplumClient,
  days = 7,
): Promise<AppointmentSummary[]> {
  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + days);
  const params: Record<string, string> = {
    'date:ge': today.toISOString().split('T')[0],
    'date:le': future.toISOString().split('T')[0],
    _sort: 'date',
    _count: '20',
    _include: 'Appointment:patient',
  };
  const result = await medplum.search('Appointment', params);
  const entries = (result.entry ?? []) as any[];
  const patients = new Map<string, any>();
  const appts: AppointmentSummary[] = [];

  for (const entry of entries) {
    const r = entry.resource;
    if (r?.resourceType === 'Patient') {
      patients.set(r.id, r);
    } else if (r?.resourceType === 'Appointment') {
      const ref = r.participant?.find(
        (p: any) => p?.actor?.reference?.startsWith('Patient/'),
      );
      const pid = ref?.actor?.reference?.replace('Patient/', '') ?? '';
      const pat = patients.get(pid);
      appts.push({
        id: r.id,
        patientName: pat ? extractName(pat) : '—',
        patientId: pid,
        status: r.status,
        start: r.start ?? '',
        description: r.description,
      });
    }
  }

  return appts;
}