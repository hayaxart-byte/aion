'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { OrganizationTable } from './components/OrganizationTable';
import type { AdminOrganization } from '@/lib/admin/types';

export default function AdminOrganizationsPage() {
  const { client } = useAuth();
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await client.search('Organization', { _count: '100' });
      const mapped: AdminOrganization[] = (result.entry ?? []).map((e: any) => {
        const r = e.resource;
        return {
          id: r.id,
          name: r.name || 'Sin nombre',
          type: r.type?.[0]?.coding?.[0]?.code || r.type?.[0]?.text || 'N/A',
          status: r.active !== false ? 'active' : 'inactive',
          address: r.address?.[0]?.line?.[0] || 'N/A',
          phone: r.telecom?.find((t: any) => t.system === 'phone')?.value || 'N/A',
          email: r.telecom?.find((t: any) => t.system === 'email')?.value || 'N/A',
          createdAt: r.meta?.created || new Date().toISOString(),
        };
      });
      setOrganizations(mapped);
    } catch (err) {
      console.error('Error loading organizations:', err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Centros médicos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestión de centros y organizaciones
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
        <OrganizationTable organizations={organizations} loading={loading} />
      </div>
    </div>
  );
}
