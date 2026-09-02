'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMedplumQuery } from '@aion/medplum-client';
import type { MedplumClient, Patient } from '@aion/vendor-medplum';

export interface PatientRowData {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  email?: string;
  phone?: string;
  city?: string;
  documentId?: string;
  dataCompleteness: 'complete' | 'partial' | 'minimal';
}

export interface PatientFiltersState {
  gender: string;
  completeness: string;
}

function calcCompleteness(p: Patient): 'complete' | 'partial' | 'minimal' {
  const hasBirth = !!p.birthDate;
  const hasGender = !!p.gender;
  const hasEmail = p.telecom?.some((t) => t.system === 'email');
  const hasPhone = p.telecom?.some((t) => t.system === 'phone');
  const hasAddress = !!p.address?.[0]?.city;
  const score = [hasBirth, hasGender, hasEmail, hasPhone, hasAddress].filter(Boolean).length;
  if (score >= 4) return 'complete';
  if (score >= 2) return 'partial';
  return 'minimal';
}

function transformPatient(r: Patient): PatientRowData {
  const n = r.name?.[0];
  return {
    id: r.id!,
    name: n ? `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim() : 'Sin nombre',
    birthDate: r.birthDate ?? '',
    gender: r.gender ?? '',
    email: r.telecom?.find((t) => t.system === 'email')?.value,
    phone: r.telecom?.find((t) => t.system === 'phone')?.value,
    city: r.address?.[0]?.city,
    documentId: r.identifier?.find(
      (i) => i.type?.coding?.[0]?.code === 'DNI' || i.type?.coding?.[0]?.code === 'CC'
    )?.value,
    dataCompleteness: calcCompleteness(r),
  };
}

export function usePatientSearch(client: MedplumClient) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<PatientFiltersState>({ gender: '', completeness: '' });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch.trim()) {
      params.name = debouncedSearch.trim();
    }
    if (filters.gender) {
      params.gender = filters.gender;
    }
    return params;
  }, [debouncedSearch, filters.gender]);

  const queryKey = JSON.stringify(queryParams);

  const { data: rawPatients, isLoading, error } = useMedplumQuery(
    `patients:${queryKey}`,
    useCallback(async () => {
      const result = await client.search('Patient', queryParams);
      return (result.entry ?? []).map((e: any) => transformPatient(e.resource as Patient));
    }, [client, queryParams]),
    { staleTime: 60_000 }
  );

  const patients = useMemo(() => {
    if (!rawPatients) return [];
    if (filters.completeness) {
      return rawPatients.filter((p) => p.dataCompleteness === filters.completeness);
    }
    return rawPatients;
  }, [rawPatients, filters.completeness]);

  const hasActiveFilters = filters.gender !== '' || filters.completeness !== '' || debouncedSearch.trim() !== '';

  const clearFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setFilters({ gender: '', completeness: '' });
  }, []);

  return {
    patients,
    loading: isLoading,
    error,
    search,
    setSearch: (v: string) => setSearch(v),
    filters,
    setFilters,
    hasActiveFilters,
    clearFilters,
    totalCount: patients.length,
  };
}
