'use client';

import { useState } from 'react';
import { cn } from '@aion/ui';

export interface FilterState {
  types: string[];
  channels: string[];
}

interface CalendarFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bgClass: string; dotClass: string }> = {
  new: { label: 'Primera vez', color: 'blue', bgClass: 'bg-blue-100 text-blue-700 border-blue-300', dotClass: 'bg-blue-500' },
  followup: { label: 'Reconsulta', color: 'green', bgClass: 'bg-green-100 text-green-700 border-green-300', dotClass: 'bg-green-500' },
  telemedicine: { label: 'Telemedicina', color: 'purple', bgClass: 'bg-purple-100 text-purple-700 border-purple-300', dotClass: 'bg-purple-500' },
  checkup: { label: 'Control', color: 'amber', bgClass: 'bg-amber-100 text-amber-700 border-amber-300', dotClass: 'bg-amber-500' },
  emergency: { label: 'Urgencia', color: 'red', bgClass: 'bg-red-100 text-red-700 border-red-300', dotClass: 'bg-red-500' },
  other: { label: 'Otro', color: 'slate', bgClass: 'bg-slate-100 text-slate-700 border-slate-300', dotClass: 'bg-slate-500' },
};

const CHANNEL_CONFIG: Record<string, { label: string }> = {
  in_person: { label: 'Presencial' },
  video: { label: 'Video' },
  phone: { label: 'Teléfono' },
};

export function CalendarFilters({ filters, onChange }: CalendarFiltersProps) {
  const [expanded, setExpanded] = useState(true);
  const hasActiveFilters = filters.types.length < Object.keys(TYPE_CONFIG).length
    || filters.channels.length < Object.keys(CHANNEL_CONFIG).length;

  function toggleType(key: string) {
    const next = filters.types.includes(key)
      ? filters.types.filter(t => t !== key)
      : [...filters.types, key];
    onChange({ ...filters, types: next.length === 0 ? Object.keys(TYPE_CONFIG) : next });
  }

  function toggleChannel(key: string) {
    const next = filters.channels.includes(key)
      ? filters.channels.filter(c => c !== key)
      : [...filters.channels, key];
    onChange({ ...filters, channels: next.length === 0 ? Object.keys(CHANNEL_CONFIG) : next });
  }

  function clearAll() {
    onChange({ types: Object.keys(TYPE_CONFIG), channels: Object.keys(CHANNEL_CONFIG) });
  }

  return (
    <div className="space-y-4">
      <button
        className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-slate-500"
        onClick={() => setExpanded(!expanded)}
      >
        <span>Filtros</span>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-normal normal-case">
              Activos
            </span>
          )}
          <svg className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {expanded && (
        <>
          {hasActiveFilters && (
            <button
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
              onClick={clearAll}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          )}

          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-2">Tipo de consulta</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                const active = filters.types.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleType(key)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all border',
                      active ? cfg.bgClass : 'bg-white text-slate-400 border-slate-200 opacity-50',
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dotClass)} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-2">Canal</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(CHANNEL_CONFIG).map(([key, cfg]) => {
                const active = filters.channels.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleChannel(key)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border',
                      active ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-400 border-slate-200 opacity-50',
                    )}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2">
            {hasActiveFilters ? '✅ Filtros activos' : 'Mostrando todos los tipos'}
          </div>
        </>
      )}
    </div>
  );
}
