import { Suspense } from 'react';
import QuickActions from '@/components/doctor/QuickActions';
import SummaryCardsSection from '@/components/doctor/sections/SummaryCardsSection';
import UpcomingSection from '@/components/doctor/sections/UpcomingSection';
import RecentPatientsSection from '@/components/doctor/sections/RecentPatientsSection';
import RecentActivitySection from '@/components/doctor/sections/RecentActivitySection';
import SummarySkeleton from '@/components/doctor/sections/SummarySkeleton';
import ListSkeleton from '@/components/doctor/sections/ListSkeleton';
import ActivitySkeleton from '@/components/doctor/sections/ActivitySkeleton';

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard clínico</h1>
        <p className="text-sm text-slate-400 mt-1">Resumen operativo del día</p>
      </div>

      <Suspense fallback={<SummarySkeleton />}>
        <SummaryCardsSection />
      </Suspense>

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<ActivitySkeleton />}>
            <RecentActivitySection />
          </Suspense>
          <Suspense fallback={<ListSkeleton />}>
            <UpcomingSection />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Suspense fallback={<ListSkeleton />}>
            <RecentPatientsSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
