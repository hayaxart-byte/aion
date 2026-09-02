'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { getFinanceSummary } from '@aion/medplum-client';
import type { FinanceTransaction, FinanceFiltersState, FinanceTab } from '@/lib/finance/types';

export function useFinanceData(tab: FinanceTab, filters: FinanceFiltersState) {
  const { client } = useAuth();
  const [data, setData] = useState<FinanceTransaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const summary = await getFinanceSummary(client);

        if (!mountedRef.current) return;

        let result = summary.transactions;

        if (filters.dateRange.start && filters.dateRange.end) {
          result = result.filter((t) => {
            const d = new Date(t.date);
            return d >= filters.dateRange.start! && d <= filters.dateRange.end!;
          });
        }
        if (filters.patient) {
          result = result.filter((t) => t.patient.toLowerCase().includes(filters.patient.toLowerCase()));
        }
        if (filters.doctor) {
          result = result.filter((t) => t.doctor.toLowerCase().includes(filters.doctor.toLowerCase()));
        }
        if (filters.cashier) {
          result = result.filter((t) => t.cashier.toLowerCase().includes(filters.cashier.toLowerCase()));
        }

        setData(result);
        setError(null);
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setData([]);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchData();
  }, [tab, filters.dateRange.start?.getTime(), filters.dateRange.end?.getTime(), filters.patient, filters.doctor, filters.cashier, filters.code, filters.service, filters.hideRelated, client]);

  return { data, loading, error };
}
