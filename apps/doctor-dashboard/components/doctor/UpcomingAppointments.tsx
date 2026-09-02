import Link from 'next/link';
import { Badge, Button } from '@aion/ui';
import type { AppointmentWithPatient } from '@aion/domain';

interface Props {
  appointments: AppointmentWithPatient[];
}

const STATUS_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'destructive' | 'neutral'> = {
  booked: 'info',
  pending: 'warning',
  fulfilled: 'success',
  cancelled: 'destructive',
  arrived: 'success',
};

const STATUS_LABEL: Record<string, string> = {
  booked: 'Confirmada',
  pending: 'Pendiente',
  fulfilled: 'Completada',
  cancelled: 'Cancelada',
  arrived: 'Llegó',
};

export default function UpcomingAppointments({ appointments }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Próximas citas</h3>

      {appointments.length === 0 ? (
        <div className="text-center py-10 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
            <svg aria-hidden="true" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">No hay citas próximas</p>
          <Link href="/appointments/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm text-sm">
              Agendar cita
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 -mx-1">
          {appointments.map((a) => {
            const variant = STATUS_VARIANT[a.status] ?? 'neutral';
            const label = STATUS_LABEL[a.status] ?? a.status;
            return (
              <Link
                key={a.id}
                href={`/appointments?date=${a.start?.split('T')[0] ?? ''}`}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.patientName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatTime(a.start)}
                    {a.description && <span> &middot; {a.description}</span>}
                  </p>
                </div>
                <Badge variant={variant}>{label}</Badge>
                <svg aria-hidden="true" className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}
