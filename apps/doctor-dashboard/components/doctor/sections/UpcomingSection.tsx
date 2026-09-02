'use client';

import { useAuth } from '@/lib/auth';
import { useMedplumQuery } from '@aion/medplum-client';
import { fetchDashboardData } from '@/lib/dashboard-data';
import UpcomingAppointments from '@/components/doctor/UpcomingAppointments';

export default function UpcomingSection() {
  const { getAccessToken } = useAuth();
  const { data } = useMedplumQuery(
    'dashboard',
    () => fetchDashboardData(getAccessToken),
    { staleTime: 30_000 }
  );
  return <UpcomingAppointments appointments={data?.upcoming ?? []} />;
}
