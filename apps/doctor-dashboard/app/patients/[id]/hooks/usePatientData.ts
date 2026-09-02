'use client';

import { useMemo } from 'react';
import { useMedplumQuery } from '@aion/medplum-client';
import type { MedplumClient, AllergyIntolerance, Coverage } from '@aion/vendor-medplum';

export function usePatientExtraData(id: string, client: MedplumClient) {
  const allergiesQuery = useMedplumQuery(
    `patient-allergies:${id}`,
    async () => {
      const result = await client.search('AllergyIntolerance', {
        patient: `Patient/${id}`,
      });
      return (result.entry ?? []).map(
        (e: any) => e.resource as AllergyIntolerance
      );
    },
    { staleTime: 60_000 }
  );

  const coverageQuery = useMedplumQuery(
    `patient-coverage:${id}`,
    async () => {
      const result = await client.search('Coverage', {
        beneficiary: `Patient/${id}`,
      });
      return (result.entry ?? []).map(
        (e: any) => e.resource as Coverage
      );
    },
    { staleTime: 60_000 }
  );

  const allergies = useMemo(
    () => allergiesQuery.data ?? [],
    [allergiesQuery.data]
  );

  const insurance = useMemo(
    () => (coverageQuery.data?.[0] ?? null) as Coverage | null,
    [coverageQuery.data]
  );

  return {
    allergies,
    insurance,
    loadingAllergies: allergiesQuery.isLoading,
    loadingInsurance: coverageQuery.isLoading,
  };
}
