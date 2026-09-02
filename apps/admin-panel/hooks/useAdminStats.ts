'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import type { AdminDashboardData, AdminActivityItem } from '@/lib/admin/types';

export function useAdminStats() {
  const { client } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [practitioners, patients, orgs, appts] = await Promise.all([
        client.search('Practitioner', { _count: '100' }),
        client.search('Patient', { _count: '100' }),
        client.search('Organization', { _count: '100' }),
        client.search('Appointment', { _count: '100' }),
      ]);

      const allPractitioners = (practitioners.entry ?? []).map((e: any) => e.resource);
      const allPatients = (patients.entry ?? []).map((e: any) => e.resource);
      const allOrgs = (orgs.entry ?? []).map((e: any) => e.resource);
      const allAppts = (appts.entry ?? []).map((e: any) => e.resource);

      const today = new Date().toISOString().split('T')[0];
      const todayAppts = allAppts.filter((a: any) => a.start?.startsWith(today));
      const upcomingAppts = allAppts.filter(
        (a: any) => a.start && new Date(a.start) > new Date()
      );

      const stats = {
        userCounts: {
          total: allPractitioners.length + allPatients.length,
          doctors: allPractitioners.length,
          patients: allPatients.length,
          receptionists: 0,
          nurses: 0,
        },
        organizationCounts: {
          total: allOrgs.length,
          active: allOrgs.filter((o: any) => o.active !== false).length,
        },
        appointmentCounts: {
          total: allAppts.length,
          today: todayAppts.length,
          upcoming: upcomingAppts.length,
        },
        revenue: { total: 0, monthly: 0, growth: 0 },
      };

      const recent: AdminActivityItem[] = [
        ...allPractitioners.slice(0, 5).map((p: any) => ({
          id: p.id,
          type: 'user_created' as const,
          description: `Doctor ${p.name?.[0]?.given?.[0] || ''} ${p.name?.[0]?.family || ''}`,
          user: { name: p.name?.[0]?.given?.[0] || 'Desconocido', role: 'doctor' },
          timestamp: p.meta?.lastUpdated || new Date().toISOString(),
          status: 'success' as const,
        })),
        ...allPatients.slice(0, 5).map((p: any) => ({
          id: p.id,
          type: 'user_created' as const,
          description: `Paciente ${p.name?.[0]?.given?.[0] || ''} ${p.name?.[0]?.family || ''}`,
          user: { name: p.name?.[0]?.given?.[0] || 'Desconocido', role: 'patient' },
          timestamp: p.meta?.lastUpdated || new Date().toISOString(),
          status: 'success' as const,
        })),
        ...todayAppts.slice(0, 3).map((a: any) => ({
          id: a.id,
          type: 'appointment_created' as const,
          description: `Cita programada - ${a.description || 'Sin descripción'}`,
          user: { name: 'Sistema', role: 'system' },
          timestamp: a.meta?.lastUpdated || a.start || new Date().toISOString(),
          status: 'success' as const,
        })),
      ];

      recent.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setData({ stats, activity: recent.slice(0, 10) });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}
