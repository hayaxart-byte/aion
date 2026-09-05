'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Button, Input, Select, Label, Separator,
} from '@aion/ui';
import type { PractitionerSettings } from '@aion/medplum-client';
import { DEFAULT_SETTINGS, loadPractitionerSettings, savePractitionerSettings } from '@aion/medplum-client';

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const TIMEZONES = [
  'America/Mexico_City', 'America/Argentina/Buenos_Aires', 'America/Santiago',
  'America/Bogota', 'America/Lima', 'America/Sao_Paulo', 'Europe/Madrid',
  'Europe/London', 'US/Eastern', 'US/Pacific', 'UTC',
];

const DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${checked ? 'bg-primary' : 'bg-input'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function SettingsView() {
  const { client } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PractitionerSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadPractitionerSettings(client).then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, [client]);

  function updateAgenda(updates: Partial<PractitionerSettings['agenda']>) {
    setSettings({ ...settings, agenda: { ...settings.agenda, ...updates } });
  }

  function updateNotifications(updates: Partial<PractitionerSettings['notifications']>) {
    setSettings({ ...settings, notifications: { ...settings.notifications, ...updates } });
  }

  function updateSystem(updates: Partial<PractitionerSettings['system']>) {
    setSettings({ ...settings, system: { ...settings.system, ...updates } });
  }

  function updateClinic(updates: Partial<PractitionerSettings['clinic']>) {
    setSettings({ ...settings, clinic: { ...settings.clinic, ...updates } });
  }

  function toggleDay(day: number) {
    const days = settings.agenda.activeDays.includes(day)
      ? settings.agenda.activeDays.filter(d => d !== day)
      : [...settings.agenda.activeDays, day];
    updateAgenda({ activeDays: days });
  }

  async function handleSave() {
    setSaving(true);
    await savePractitionerSettings(client, settings);
    setSaving(false);
  }

  const [tab, setTab] = useState('agenda');

  if (loading) {
    return (
      <div className="max-w-3xl space-y-5 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="max-w-3xl">
      <TabsList>
        <TabsTrigger value="agenda">Agenda</TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        <TabsTrigger value="system">Sistema</TabsTrigger>
        <TabsTrigger value="clinic">Clínica</TabsTrigger>
      </TabsList>

      <TabsContent value="agenda" className="mt-5 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Duración de citas</CardTitle>
            <CardDescription>Tiempo predeterminado para nuevas citas</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={settings.agenda.defaultDuration} onChange={(e) => updateAgenda({ defaultDuration: Number(e.target.value) })}>
              {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Horario laboral</CardTitle>
            <CardDescription>Define el horario de atención</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Hora de inicio</Label>
                <Select value={settings.agenda.startHour} onChange={(e) => updateAgenda({ startHour: Number(e.target.value) })}>
                  {Array.from({ length: 12 }, (_, i) => i + 6).map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                </Select>
              </div>
              <div>
                <Label>Hora de fin</Label>
                <Select value={settings.agenda.endHour} onChange={(e) => updateAgenda({ endHour: Number(e.target.value) })}>
                  {Array.from({ length: 12 }, (_, i) => i + 12).map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Días activos</CardTitle>
            <CardDescription>Selecciona los días de atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    settings.agenda.activeDays.includes(i)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="mt-5 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Canales de notificación</CardTitle>
            <CardDescription>Configura cómo recibir recordatorios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label>WhatsApp</Label>
                <p className="text-xs text-slate-400">Enviar recordatorios por WhatsApp</p>
              </div>
              <Toggle checked={settings.notifications.whatsappEnabled} onChange={(v) => updateNotifications({ whatsappEnabled: v })} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Email reminders</Label>
                <p className="text-xs text-slate-400">Recordatorios automáticos por correo</p>
              </div>
              <Toggle checked={settings.notifications.emailReminders} onChange={(v) => updateNotifications({ emailReminders: v })} />
            </div>
            <Separator />
            <div>
              <Label>Tiempo de recordatorio</Label>
              <Select value={settings.notifications.reminderMinutes} onChange={(e) => updateNotifications({ reminderMinutes: Number(e.target.value) })}>
                <option value={15}>15 min antes</option>
                <option value={30}>30 min antes</option>
                <option value={60}>1 hora antes</option>
                <option value={120}>2 horas antes</option>
                <option value={1440}>1 día antes</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="system" className="mt-5 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Región y formato</CardTitle>
            <CardDescription>Configuración regional del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Zona horaria</Label>
              <Select value={settings.system.timezone} onChange={(e) => updateSystem({ timezone: e.target.value })}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
              </Select>
            </div>
            <div>
              <Label>Formato de hora</Label>
              <Select value={settings.system.timeFormat} onChange={(e) => updateSystem({ timeFormat: e.target.value as '24h' | '12h' })}>
                <option value="24h">24 horas (14:30)</option>
                <option value="12h">12 horas (2:30 PM)</option>
              </Select>
            </div>
            <div>
              <Label>Formato de fecha</Label>
              <Select value={settings.system.dateFormat} onChange={(e) => updateSystem({ dateFormat: e.target.value })}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="clinic" className="mt-5 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Información de la clínica</CardTitle>
            <CardDescription>Datos del consultorio o centro médico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre de la clínica</Label>
              <Input value={settings.clinic.name} onChange={(e) => updateClinic({ name: e.target.value })} placeholder="Ej: Consultorio Dr. García" />
            </div>
            <div>
              <Label>URL del logo</Label>
              <Input value={settings.clinic.logoUrl} onChange={(e) => updateClinic({ logoUrl: e.target.value })} placeholder="https://ejemplo.com/logo.png" />
              {settings.clinic.logoUrl && (
                <div className="mt-2 h-12 w-12 rounded-xl border border-input overflow-hidden bg-slate-50 flex items-center justify-center">
                  <img src={settings.clinic.logoUrl} alt="logo" className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={settings.clinic.phone} onChange={(e) => updateClinic({ phone: e.target.value })} placeholder="+52 55 1234 5678" />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={settings.clinic.address} onChange={(e) => updateClinic({ address: e.target.value })} placeholder="Calle y número, Colonia, Ciudad" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar configuración'}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
