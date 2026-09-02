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
      allowedRoles={['patient']}
      title="Aion"
      description="Tu historial médico, siempre contigo"
    />
  );
}