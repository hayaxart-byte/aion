'use client';

import { useAuth } from '@/lib/auth';
import { getPrimaryRoleLabel } from '@aion/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@aion/ui';

export default function ProfilePage() {
  const { user } = useAuth();

  const roleLabel = user?.roles ? getPrimaryRoleLabel(user.roles) : '—';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Nombre</p>
            <p className="font-medium">{user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rol</p>
            <p className="font-medium">{roleLabel}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}