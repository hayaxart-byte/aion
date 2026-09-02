'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Input, Button, cn } from '@aion/ui';
import { Search, MoreVertical } from 'lucide-react';
import type { AdminUser } from '@/lib/admin/types';

interface UserTableProps {
  users: AdminUser[];
  loading?: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  doctor: 'bg-blue-100 text-blue-700 border-blue-200',
  patient: 'bg-green-100 text-green-700 border-green-200',
  receptionist: 'bg-orange-100 text-orange-700 border-orange-200',
  nurse: 'bg-pink-100 text-pink-700 border-pink-200',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

export function UserTable({ users, loading }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border rounded-xl bg-background text-sm text-foreground"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="patient">Paciente</option>
          <option value="receptionist">Recepcionista</option>
          <option value="nurse">Enfermera</option>
        </select>
      </div>

      <div className="border border-border/50 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', ROLE_COLORS[user.role] || '')} variant="outline">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{user.resourceType}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', STATUS_COLORS[user.status] || '')} variant="outline">
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.lastActive).toLocaleString('es')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredUsers.length} de {users.length} usuarios
      </div>
    </div>
  );
}
