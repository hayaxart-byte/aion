import Link from 'next/link';

const actions = [
  {
    href: '/patients/new',
    label: 'Nuevo paciente',
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
      </svg>
    ),
  },
  {
    href: '/appointments/new',
    label: 'Nueva cita',
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    href: '/patients',
    label: 'Buscar paciente',
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    href: '/appointments',
    label: 'Abrir agenda',
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
];

export default function QuickActions() {
  return (
    <div className="bg-slate-100/60 p-2 rounded-xl flex flex-wrap items-center gap-3 max-w-max">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="inline-flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:text-primary hover:border-primary/30 transition-all duration-200"
        >
          {action.icon}
          {action.label}
        </Link>
      ))}
    </div>
  );
}
