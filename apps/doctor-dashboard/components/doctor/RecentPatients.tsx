import Link from 'next/link';
import { Button } from '@aion/ui';
import type { RecentPatientInfo } from '@aion/domain';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function initials(name: string): string {
  return name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function avatarColor(gender?: string): string {
  switch (gender) {
    case 'male': return 'bg-blue-100 text-blue-700';
    case 'female': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

interface Props {
  patients: RecentPatientInfo[];
}

export default function RecentPatients({ patients }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-800">Pacientes recientes</h3>
        {patients.length > 0 && (
          <Link href="/patients">
            <span className="text-xs font-medium text-primary hover:underline">Ver todos</span>
          </Link>
        )}
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-10 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
            <svg aria-hidden="true" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">No hay pacientes recientes</p>
          <Link href="/patients/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm text-sm">
              Registrar paciente
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-1 -mx-1">
          {patients.map((p) => (
            <li key={p.id}>
              <Link
                href={`/patients/${p.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-full ${avatarColor(p.gender)} flex items-center justify-center text-xs font-bold shrink-0`}>
                  {initials(p.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Última visita: {formatDate(p.lastVisit)}
                  </p>
                </div>
                <svg aria-hidden="true" className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
