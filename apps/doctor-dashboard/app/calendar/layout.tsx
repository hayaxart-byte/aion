import type { ReactNode } from 'react';
import { DashboardLayout } from '../dashboard/DashboardLayout';

export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
