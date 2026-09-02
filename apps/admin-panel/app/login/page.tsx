'use client';

import { useAuth } from '@/lib/auth';
import { LoginPage } from '@aion/ui';

export default function Login() {
  const { login, user, loading } = useAuth();

  return (
    <LoginPage
      login={login}
      user={user}
      loading={loading}
      allowedRoles={['admin']}
      title="Aion"
      description="Panel de Administración"
    />
  );
}