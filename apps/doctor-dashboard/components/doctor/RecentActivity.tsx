import type { ActivityItem } from '@aion/domain';

function formatRelative(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `Hace ${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay === 1) return 'Ayer';
    return `Hace ${diffDay} días`;
  } catch {
    return '—';
  }
}

const EVENT_STYLES: Record<string, { dot: string; bg: string; label: string }> = {
  appointment_created: {
    dot: 'bg-blue-500',
    bg: 'bg-blue-50',
    label: 'Nueva cita',
  },
  appointment_cancelled: {
    dot: 'bg-red-400',
    bg: 'bg-red-50',
    label: 'Cita cancelada',
  },
  patient_registered: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    label: 'Nuevo paciente',
  },
  consultation_completed: {
    dot: 'bg-indigo-500',
    bg: 'bg-indigo-50',
    label: 'Consulta',
  },
};

interface Props {
  events: ActivityItem[];
}

export default function RecentActivity({ events }: Props) {
  const visible = events.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-6">Actividad reciente</h3>

      {visible.length === 0 ? (
        <p className="text-sm text-slate-400 py-12 text-center">
          No hay actividad reciente
        </p>
      ) : (
        <div className="relative">
          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-100" />
          <ul className="space-y-5">
            {visible.map((ev) => {
              const style = EVENT_STYLES[ev.type] ?? { dot: 'bg-slate-300', bg: 'bg-slate-50', label: 'Evento' };
              return (
                <li key={ev.id} className="flex items-start gap-3 pl-0">
                  <div className={`relative z-10 mt-0.5 h-[22px] w-[22px] rounded-full ${style.bg} flex items-center justify-center shrink-0 ring-2 ring-white`}>
                    <div className={`h-2 w-2 rounded-full ${style.dot}`} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm text-slate-700">{ev.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatRelative(ev.timestamp)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
