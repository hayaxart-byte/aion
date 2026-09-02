'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { UserTable } from './components/UserTable';
import type { AdminUser } from '@/lib/admin/types';

export default function AdminUsersPage() {
  const { client } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [practitioners, patients] = await Promise.all([
        client.search('Practitioner', { _count: '200' }),
        client.search('Patient', { _count: '200' }),
      ]);

      const mapUser = (r: any, resourceType: string, role: string): AdminUser => ({
        id: r.id,
        name: [r.name?.[0]?.given?.[0], r.name?.[0]?.family].filter(Boolean).join(' ') || 'Sin nombre',
        email: r.telecom?.find((t: any) => t.system === 'email')?.value || '',
        role,
        resourceType,
        organization: r.managingOrganization?.display || 'N/A',
        status: r.active !== false ? 'active' : 'inactive',
        lastActive: r.meta?.lastUpdated || new Date().toISOString(),
        createdAt: r.meta?.created || new Date().toISOString(),
      });

      const mapped: AdminUser[] = [
        ...(practitioners.entry ?? []).map((e: any) => mapUser(e.resource, 'Practitioner', 'doctor')),
        ...(patients.entry ?? []).map((e: any) => mapUser(e.resource, 'Patient', 'patient')),
      ];

      setUsers(mapped);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestión de usuarios del sistema
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
        <UserTable users={users} loading={loading} />
      </div>
    </div>
  );
}
