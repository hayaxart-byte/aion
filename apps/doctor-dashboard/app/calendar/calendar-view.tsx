'use client';

import { useMemo, useState } from 'react';
import { cn, Button, Spinner } from '@aion/ui';
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useWeekAppointments } from './use-week-appointments';
import type { CalendarAppointment } from './use-week-appointments';
import WeekGrid from './week-grid';
import type { SlotInfo } from './week-grid';
import CreateAppointmentDialog from './create-appointment-dialog';
import EditAppointmentDialog from './edit-appointment-dialog';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import type { FilterState } from '@/components/calendar/CalendarFilters';
import { useCalendarPreferences } from '@/lib/calendar/preferences';

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${monday.toLocaleDateString('es', opts)} — ${sunday.toLocaleDateString('es', opts)}`;
}

export default function CalendarView() {
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
  const { appointments, isLoading, error, refresh } = useWeekAppointments(currentMonday);
  const { prefs, toggleSidebar, setFilters } = useCalendarPreferences();

  const [createDialog, setCreateDialog] = useState<{
    open: boolean; date: Date; hour: number; minute: number;
  }>({ open: false, date: new Date(), hour: 9, minute: 0 });

  const [editDialog, setEditDialog] = useState<{
    open: boolean; appointment: CalendarAppointment | null;
  }>({ open: false, appointment: null });

  const filteredAppointments = useMemo(() => {
    if (prefs.filters.types.length === 0 && prefs.filters.channels.length === 0) return appointments;
    return appointments.filter(a =>
      prefs.filters.types.includes(a.type) &&
      prefs.filters.channels.includes(a.channel)
    );
  }, [appointments, prefs.filters]);

  function goToday() { setCurrentMonday(getMonday(new Date())); }
  function goWeek(delta: number) {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + delta * 7);
    setCurrentMonday(d);
  }
  function handleSlotClick(info: SlotInfo) {
    setCreateDialog({ open: true, date: info.date, hour: info.hour, minute: info.minute });
  }
  function handleAppointmentClick(appt: CalendarAppointment) {
    setEditDialog({ open: true, appointment: appt });
  }
  function handleSaved() { refresh(); }

  return (
    <div className="flex gap-0">
      <div className={cn(
        'border-r border-slate-200 bg-white transition-all duration-200 overflow-hidden shrink-0',
        prefs.sidebarCollapsed ? 'w-0 p-0' : 'w-56 p-4',
      )}>
        <div className={cn('space-y-4', prefs.sidebarCollapsed && 'hidden')}>
          <CalendarFilters filters={prefs.filters} onChange={setFilters} />
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="px-2" onClick={toggleSidebar} title={prefs.sidebarCollapsed ? 'Mostrar filtros' : 'Ocultar filtros'}>
              {prefs.sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>Hoy</Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="px-2" onClick={() => goWeek(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="px-2" onClick={() => goWeek(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 ml-1">{formatWeekRange(currentMonday)}</h2>
          </div>
        </div>

        {error ? (
          <div className="text-sm text-destructive bg-destructive/10 rounded-xl p-4">
            Error al cargar citas: {error.message}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <WeekGrid
            monday={currentMonday}
            appointments={filteredAppointments}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        )}

        <CreateAppointmentDialog
          open={createDialog.open}
          onClose={() => setCreateDialog({ ...createDialog, open: false })}
          prefillDate={createDialog.date}
          prefillHour={createDialog.hour}
          prefillMinute={createDialog.minute}
          onSaved={handleSaved}
        />

        <EditAppointmentDialog
          open={editDialog.open}
          appointment={editDialog.appointment}
          onClose={() => setEditDialog({ ...editDialog, open: false })}
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}
