'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@aion/ui';

function isOnboardingComplete(): boolean {
  try {
    const raw = localStorage.getItem('aion:onboarding');
    if (!raw) return false;
    return JSON.parse(raw)?.state?.completed === true;
  } catch {
    return false;
  }
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const hasCompleted = isOnboardingComplete();
    if (!hasCompleted) {
      router.replace('/onboarding');
      return;
    }

    const hasRole = user.roles.some((r) => r === 'doctor' || r === 'receptionist' || r === 'nurse');
    if (hasRole) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
}
