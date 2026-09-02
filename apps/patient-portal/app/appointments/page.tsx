'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, Badge } from '@aion/ui';

interface Appointment {
  id: string;
  status: string;
  start: string;
  description: string;
}

export default function AppointmentsPage() {
  const { client } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    async function load() {
      const result = await client.search('Appointment');
      if (result.entry) {
        setAppointments(
          result.entry.map((e) => {
            const r = e.resource as unknown as Record<string, string>;
            return {
              id: r.id as string,
              status: r.status as string,
              start: (r.start as string) || '',
              description: (r.description as string) || '',
            };
          })
        );
      }
    }
    load();
  }, [client]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis Citas</h1>
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No tienes citas programadas
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.description || 'Consulta'}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.start ? new Date(a.start).toLocaleDateString('es', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    }) : 'Fecha por confirmar'}
                  </p>
                </div>
                <Badge variant={
                  a.status === 'booked' ? 'info' :
                  a.status === 'fulfilled' ? 'success' : 'neutral'
                }>
                  {a.status === 'booked' ? 'Programada' :
                   a.status === 'fulfilled' ? 'Completada' : a.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
