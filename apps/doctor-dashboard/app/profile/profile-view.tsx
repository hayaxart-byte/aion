'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import {
  Card, CardContent, CardHeader, CardTitle,
  Avatar, Button, Spinner, Badge,
} from '@aion/ui';
import { extractProfileName, extractProfileEmail, extractProfileRole } from '@aion/domain';
import type { User } from '@aion/domain';

interface ProfileStats {
  todayAppointments: number;
  totalPatients: number;
  totalAppointments: number;
}

function getInitials(name: string): string {
  return name.split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function ProfileView() {
  const { client, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<ProfileStats>({ todayAppointments: 0, totalPatients: 0, totalAppointments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const p = client.getProfile();
        setProfile(p);

        const today = new Date().toISOString().split('T')[0];
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];

        const [todayRes, patientsRes, allApptsRes] = await Promise.all([
          client.search('Appointment', { 'date:ge': today, 'date:lt': nextDayStr, _count: '100' }),
          client.search('Patient', { _count: '1', _total: 'accurate' }),
          client.search('Appointment', { _count: '1', _total: 'accurate' }),
        ]);

        setStats({
          todayAppointments: (todayRes.entry ?? []).filter((e: any) => e.resource?.resourceType === 'Appointment').length,
          totalPatients: patientsRes.total ?? 0,
          totalAppointments: allApptsRes.total ?? 0,
        });
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [client]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const name = user?.name ?? (profile ? extractProfileName(profile) : 'Usuario');
  const email = profile ? extractProfileEmail(profile) : user?.email;
  const role = profile ? extractProfileRole(profile) : user?.roles?.[0] ?? 'Profesional';
  const resourceType = profile?.resourceType ?? '';

  return (
    <div className="max-w-4xl space-y-5">
      <Card>
        <div className="h-2 rounded-t-2xl bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar name={name} className="h-20 w-20 text-xl" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-800">{name}</h2>
                <Badge variant="secondary">{role}</Badge>
              </div>
              {email && (
                <p className="text-sm text-slate-400 mt-1">{email}</p>
              )}
              {resourceType && (
                <p className="text-xs text-slate-300 mt-2 font-mono">{resourceType}</p>
              )}
            </div>
            <Button variant="outline" size="sm" disabled>
              Editar perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card>
          <CardContent className="py-5 text-center">
            <p className="text-3xl font-bold text-primary">{stats.todayAppointments}</p>
            <p className="text-xs text-slate-400 mt-1">Citas hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <p className="text-3xl font-bold text-emerald-600">{stats.totalPatients}</p>
            <p className="text-xs text-slate-400 mt-1">Pacientes registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <p className="text-3xl font-bold text-amber-600">{stats.totalAppointments}</p>
            <p className="text-xs text-slate-400 mt-1">Citas totales</p>
          </CardContent>
        </Card>
      </div>

      {profile?.qualification && profile.qualification.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Especialidades</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {profile.qualification.map((q: any, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary/40" />
                  <span>
                    {q.code?.coding?.[0]?.display ?? q.text ?? `Calificación ${i + 1}`}
                    {q.issuer?.display && <span className="text-slate-400 ml-1">— {q.issuer.display}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Identificadores</CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.identifier && profile.identifier.length > 0 ? (
            <ul className="space-y-2">
              {profile.identifier.map((id: any, i: number) => (
                <li key={i} className="text-sm flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="text-slate-500 font-mono">{id.type?.coding?.[0]?.code ?? id.type?.text ?? 'ID'}:</span>
                  <span className="text-slate-700 font-medium">{id.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Sin identificadores registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
