'use client';

import { useAuth } from '@/lib/auth';
import { useMedplumQuery } from '@aion/medplum-client';
import { fetchDashboardData } from '@/lib/dashboard-data';
import RecentPatients from '@/components/doctor/RecentPatients';

export default function RecentPatientsSection() {
  const { getAccessToken } = useAuth();
  const { data } = useMedplumQuery(
    'dashboard',
    () => fetchDashboardData(getAccessToken),
    { staleTime: 30_000 }
  );
  return <RecentPatients patients={data?.recentPatients ?? []} />;
}
