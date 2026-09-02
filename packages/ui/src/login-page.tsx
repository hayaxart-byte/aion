'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@aion/domain';
import { ROLE_LABELS_SHORT, ROLE_ICONS } from '@aion/domain';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Spinner } from './spinner';

interface LoginPageProps {
  login: (email: string, password: string) => Promise<void>;
  user?: { name?: string; roles?: UserRole[] } | null;
  loading: boolean;
  allowedRoles: UserRole[];
  title?: string;
  description?: string;
  backgroundClass?: string;
}

const PORTAL_URLS: Record<string, string> = {
  doctor: process.env.NEXT_PUBLIC_DOCTOR_URL || 'http://localhost:3002',
  receptionist: process.env.NEXT_PUBLIC_DOCTOR_URL || 'http://localhost:3002',
  nurse: process.env.NEXT_PUBLIC_DOCTOR_URL || 'http://localhost:3002',
  patient: process.env.NEXT_PUBLIC_PATIENT_URL || 'http://localhost:3003',
  admin: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001',
};

function portalForRole(role: UserRole): string {
  return PORTAL_URLS[role] || '';
}

function validatePortalUrls(): void {
  const missing = Object.entries(PORTAL_URLS)
    .filter(([_, url]) => !url)
    .map(([role]) => role);
  if (missing.length > 0) {
    console.warn(`⚠️ Missing env vars for roles: ${missing.join(', ')}. Using fallback localhost.`);
  }
}

validatePortalUrls();

export function LoginPage({
  login,
  user,
  loading: authLoading,
  allowedRoles,
  title = 'Aion',
  description = 'La historia completa de tu salud',
  backgroundClass = 'bg-gradient-to-br from-background to-muted',
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [roleSelection, setRoleSelection] = useState<UserRole[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (user.roles!.length === 1) {
      handleRedirect(user.roles![0]);
    } else if (user.roles!.length > 1) {
      setRoleSelection(user.roles!);
    }
  }, [user, authLoading]);

  function handleRedirect(role: UserRole) {
    if (allowedRoles.includes(role)) {
      router.replace('/dashboard');
    } else {
      window.location.href = portalForRole(role);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${backgroundClass}`}>
        <Spinner />
      </div>
    );
  }

  if (roleSelection && roleSelection.length > 1) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${backgroundClass} p-4`}>
        <Card className="w-full max-w-md shadow-xl shadow-black/[0.04]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bienvenido, {user?.name}</CardTitle>
            <CardDescription>Selecciona cómo deseas ingresar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roleSelection.map((role) => (
              <Button
                key={role}
                variant="outline"
                className="w-full justify-start gap-3 h-14 text-base rounded-xl"
                onClick={() => handleRedirect(role)}
              >
                <span className="text-xl">{ROLE_ICONS[role]}</span>
                <div className="text-left">
                  <p className="font-medium">{ROLE_LABELS_SHORT[role]}</p>
                  <p className="text-xs text-muted-foreground">
                    {role === 'doctor' || role === 'receptionist' || role === 'nurse'
                      ? 'Portal Profesional'
                      : role === 'patient'
                        ? 'Portal Paciente'
                        : 'Panel de Administración'}
                  </p>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${backgroundClass} p-4`}>
      <Card className="w-full max-w-md shadow-xl shadow-black/[0.04]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/10">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Correo electrónico</label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Contraseña</label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl" disabled={submitting}>
              {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
