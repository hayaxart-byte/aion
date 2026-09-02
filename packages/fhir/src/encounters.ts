import type { MedplumClient } from '@aion/vendor-medplum';

export interface EncounterSummary {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: string;
  status: string;
}

export async function getEncounters(
  medplum: MedplumClient,
  patientId?: string,
): Promise<EncounterSummary[]> {
  const params: Record<string, string> = {
    _count: '50',
    _sort: '-date',
    _include: 'Encounter:patient',
  };
  if (patientId) {
    params.subject = `Patient/${patientId}`;
  }
  const result = await medplum.search('Encounter', params);
  const entries = (result.entry ?? []) as any[];
  const patients = new Map<string, any>();
  const list: EncounterSummary[] = [];

  for (const entry of entries) {
    const r = entry.resource;
    if (r?.resourceType === 'Patient') {
      patients.set(r.id, r);
    } else if (r?.resourceType === 'Encounter') {
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
        date: r.period?.start ?? r.meta?.lastUpdated ?? '',
        type: r.type?.[0]?.coding?.[0]?.display ?? 'Consulta',
        status: r.status,
      });
    }
  }

  return list;
}

export async function getRecentEncounters(
  medplum: MedplumClient,
  count = 10,
): Promise<EncounterSummary[]> {
  const params: Record<string, string> = {
    _count: String(count),
    _sort: '-date',
    _include: 'Encounter:patient',
  };
  const result = await medplum.search('Encounter', params);
  const entries = (result.entry ?? []) as any[];
  const patients = new Map<string, any>();
  const list: EncounterSummary[] = [];

  for (const entry of entries) {
    const r = entry.resource;
    if (r?.resourceType === 'Patient') {
      patients.set(r.id, r);
    } else if (r?.resourceType === 'Encounter') {
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
        date: r.period?.start ?? r.meta?.lastUpdated ?? '',
        type: r.type?.[0]?.coding?.[0]?.display ?? 'Consulta',
        status: r.status,
      });
    }
  }

  return list;
}