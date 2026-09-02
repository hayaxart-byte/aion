'use client';

import { useAuth } from '@/lib/auth';
import { useMedplumQuery } from '@aion/medplum-client';
import { fetchDashboardData } from '@/lib/dashboard-data';
import SummaryCards from '@/components/doctor/SummaryCards';

export default function SummaryCardsSection() {
  const { getAccessToken } = useAuth();
  const { data } = useMedplumQuery(
    'dashboard',
    () => fetchDashboardData(getAccessToken),
    { staleTime: 30_000 }
  );
  return <SummaryCards data={data?.summary ?? null} />;
}
