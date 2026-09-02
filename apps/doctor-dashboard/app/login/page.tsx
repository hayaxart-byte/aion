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
      allowedRoles={['doctor', 'receptionist', 'nurse']}
      title="Aion"
      description="La historia completa de tu salud"
    />
  );
}