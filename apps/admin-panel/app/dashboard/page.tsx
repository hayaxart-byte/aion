'use client';

import { useMemo } from 'react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { AdminStatsCards } from './components/AdminStatsCards';
import { AdminCharts } from './components/AdminCharts';
import { AdminRecentActivity } from './components/AdminRecentActivity';

export default function AdminDashboard() {
  const { data, loading } = useAdminStats();

  const cards = useMemo(() => data ? [
    {
      label: 'Usuarios totales',
      value: data.stats.userCounts.total,
      color: 'blue' as const,
    },
    {
      label: 'Centros médicos',
      value: data.stats.organizationCounts.total,
      color: 'green' as const,
    },
    {
      label: 'Citas de hoy',
      value: data.stats.appointmentCounts.today,
      color: 'purple' as const,
    },
    {
      label: 'Citas totales',
      value: data.stats.appointmentCounts.total,
      color: 'orange' as const,
    },
  ] : [], [data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Doctores', value: data.stats.userCounts.doctors },
      { name: 'Pacientes', value: data.stats.userCounts.patients },
      { name: 'Citas hoy', value: data.stats.appointmentCounts.today },
      { name: 'Citas totales', value: data.stats.appointmentCounts.total },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vista general del sistema Aion
        </p>
      </div>

      <AdminStatsCards stats={cards} loading={loading} />
      <AdminCharts data={chartData} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminRecentActivity activities={data?.activity || []} loading={loading} />
      </div>
    </div>
  );
}
