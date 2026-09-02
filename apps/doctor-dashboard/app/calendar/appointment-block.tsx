'use client';

import { cn } from '@aion/ui';
import type { CalendarAppointment } from './use-week-appointments';

const TYPE_STYLE: Record<string, { border: string; bg: string; text: string; badge: string; label: string }> = {
  new: {
    border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-700', label: '1ª vez',
  },
  followup: {
    border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-700', label: 'Reconsulta',
  },
  telemedicine: {
    border: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-800',
    badge: 'bg-purple-100 text-purple-700', label: 'Telemed',
  },
  checkup: {
    border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-700', label: 'Control',
  },
  emergency: {
    border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-800',
    badge: 'bg-red-100 text-red-700', label: 'Urgencia',
  },
  other: {
    border: 'border-l-slate-400', bg: 'bg-slate-50', text: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-600', label: 'Consulta',
  },
};

const CHANNEL_ICON: Record<string, string> = {
  in_person: '👤',
  video: '📹',
  phone: '📞',
};

const STATUS_BADGE: Record<string, string> = {
  booked: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  arrived: 'bg-emerald-100 text-emerald-700',
  fulfilled: 'bg-slate-200 text-slate-500',
  cancelled: 'bg-red-100 text-red-700',
  noshow: 'bg-orange-100 text-orange-700',
};

const STATUS_LABEL: Record<string, string> = {
  booked: 'Confirmada',
  pending: 'Pendiente',
  arrived: 'Llegó',
  fulfilled: 'Completada',
  cancelled: 'Cancelada',
  noshow: 'No asistió',
};

interface Props {
  appointment: CalendarAppointment;
  style: React.CSSProperties;
  onClick: () => void;
}

export default function AppointmentBlock({ appointment, style, onClick }: Props) {
  const tStyle = TYPE_STYLE[appointment.type] ?? TYPE_STYLE.other;
  const isCancelled = appointment.status === 'cancelled';

  function fmtTime(d: Date) {
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div
      className={cn(
        'absolute left-0.5 right-0.5 rounded-lg border py-1.5 px-2 cursor-pointer',
        'transition-all duration-150 overflow-hidden z-10 group',
        isCancelled ? 'opacity-50 border-red-200' : 'border-slate-200 hover:shadow-md hover:-translate-y-0.5',
        tStyle.bg,
        tStyle.border,
      )}
      style={{ ...style, borderLeftWidth: '3px' }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <span>{fmtTime(appointment.start)} — {fmtTime(appointment.end)}</span>
      </div>

      <p className={cn(
        'text-xs font-semibold truncate mt-0.5',
        isCancelled ? 'line-through text-slate-400' : tStyle.text,
      )}>
        {appointment.patientName}
      </p>

      <div className="flex items-center gap-1 mt-1 flex-wrap">
        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', tStyle.badge)}>
          {tStyle.label}
        </span>
        <span className="text-[10px] text-slate-400">
          {CHANNEL_ICON[appointment.channel] ?? '👤'} {appointment.channel === 'in_person' ? 'Presencial' : appointment.channel === 'video' ? 'Video' : 'Tel'}
        </span>
        {appointment.status !== 'booked' && (
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', STATUS_BADGE[appointment.status] ?? '')}>
            {STATUS_LABEL[appointment.status] ?? appointment.status}
          </span>
        )}
      </div>

      {appointment.description && (
        <div className="absolute invisible group-hover:visible bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap shadow-lg z-30 pointer-events-none">
          {appointment.description}
        </div>
      )}
    </div>
  );
}
