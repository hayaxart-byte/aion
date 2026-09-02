import type { MedplumClient } from '@aion/vendor-medplum';
import type { Patient } from '@aion/vendor-medplum';
import { extractName } from '@aion/domain';

export interface PatientSummary {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
}

export async function getPatients(
  medplum: MedplumClient,
  search?: string,
): Promise<PatientSummary[]> {
  const params: Record<string, string> = {};
  if (search?.trim()) {
    params.name = search.trim();
  }
  const result = await medplum.search('Patient', params);
  return (result.entry ?? []).map((e: any) => {
    const r = e.resource;
    return {
      id: r.id,
      name: extractName(r),
      birthDate: r.birthDate ?? '',
      gender: r.gender ?? '',
    };
  });
}

export async function getPatient(medplum: MedplumClient, id: string): Promise<Patient> {
  return medplum.readResource('Patient', id) as Promise<Patient>;
}

export async function createPatient(medplum: MedplumClient, patient: any): Promise<Patient> {
  return medplum.createResource(patient) as Promise<Patient>;
}

export async function updatePatient(medplum: MedplumClient, patient: any): Promise<Patient> {
  return medplum.updateResource(patient) as Promise<Patient>;
}

export async function deletePatient(medplum: MedplumClient, id: string): Promise<void> {
  await medplum.deleteResource('Patient', id);
}