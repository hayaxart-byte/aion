'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getPrimaryRoleLabel } from '@aion/auth';
import { Topbar, Spinner } from '@aion/ui';

const navItems = [
  { href: '/dashboard', label: 'Inicio' },
  { href: '/appointments', label: 'Mis Citas' },
  { href: '/profile', label: 'Mi Perfil' },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.roles.includes('patient')) {
      router.replace('/forbidden');
      return;
    }

    setReady(true);
  }, [user, loading, router]);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const roleLabel = user?.roles ? getPrimaryRoleLabel(user.roles) : 'Paciente';

  return (
    <div className="min-h-screen bg-muted">
      <Topbar
        navItems={navItems}
        title="Aion"
        userName={user?.name}
        userRole={roleLabel}
        onLogout={handleLogout}
      />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
