'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, cn } from '@aion/ui';
import { Building2 } from 'lucide-react';
import type { AdminOrganization } from '@/lib/admin/types';

interface OrganizationTableProps {
  organizations: AdminOrganization[];
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
};

export function OrganizationTable({ organizations, loading }: OrganizationTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Centro</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No hay centros médicos registrados
              </TableCell>
            </TableRow>
          ) : (
            organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-foreground text-sm">{org.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground capitalize">{org.type}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {org.phone && <p className="text-sm text-muted-foreground">{org.phone}</p>}
                    {org.email && (
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {org.email}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{org.address}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn('text-xs', STATUS_COLORS[org.status] || '')}
                    variant="outline"
                  >
                    {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(org.createdAt).toLocaleDateString('es')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
