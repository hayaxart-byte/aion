import type { DashboardData } from '@aion/domain';

export type { DashboardData };

const emptyData: DashboardData = {
  summary: { todayAppointments: 0, pendingCount: 0, cancelledCount: 0, nextAppointment: null },
  upcoming: [],
  recentPatients: [],
  activity: [],
};

export async function fetchDashboardData(getAccessToken: () => string | null): Promise<DashboardData> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return emptyData;
  }

  const res = await fetch('/api/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return emptyData;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error del servidor: ${res.status}`);
  }

  return res.json();
}
