'use client';

import { useAuth } from '@/lib/auth';
import { useMedplumQuery } from '@aion/medplum-client';
import { fetchDashboardData } from '@/lib/dashboard-data';
import RecentActivity from '@/components/doctor/RecentActivity';

export default function RecentActivitySection() {
  const { getAccessToken } = useAuth();
  const { data } = useMedplumQuery(
    'dashboard',
    () => fetchDashboardData(getAccessToken),
    { staleTime: 30_000 }
  );
  return <RecentActivity events={data?.activity ?? []} />;
}
