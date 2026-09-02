import type { SummaryData } from '@aion/domain';

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

interface Props {
  data: SummaryData | null;
}

export default function SummaryCards({ data }: Props) {
  if (!data) return null;

  const cards = [
    {
      label: 'Citas hoy',
      value: String(data.todayAppointments),
      icon: <CalendarIcon />,
      iconWrap: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Próxima cita',
      value: data.nextAppointment ? data.nextAppointment.patientName : 'Sin citas',
      subtitle: data.nextAppointment ? formatTime(data.nextAppointment.start) : undefined,
      icon: <UserIcon />,
      iconWrap: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Pendientes',
      value: String(data.pendingCount),
      icon: <ClockIcon />,
      iconWrap: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Canceladas',
      value: String(data.cancelledCount),
      icon: <XCircleIcon />,
      iconWrap: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                {card.label}
              </p>
              <p className={`mt-2 font-bold text-slate-800 ${card.label === 'Próxima cita' ? 'text-lg leading-tight' : 'text-3xl'}`}>
                {card.value}
              </p>
              {card.subtitle && (
                <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
              )}
            </div>
            <div className={`w-10 h-10 rounded-full ${card.iconWrap} flex items-center justify-center shrink-0 ml-4`}>
              <div className="h-5 w-5">{card.icon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
