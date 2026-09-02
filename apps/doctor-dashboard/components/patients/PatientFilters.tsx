'use client';

import { Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger, Button, Badge } from '@aion/ui';
import type { PatientFiltersState } from '@/lib/patients';

const GENDER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
];

const COMPLETENESS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'complete', label: 'Completo' },
  { value: 'partial', label: 'Parcial' },
  { value: 'minimal', label: 'Mínimo' },
];

interface PatientFiltersProps {
  filters: PatientFiltersState;
  onChange: (filters: PatientFiltersState) => void;
  activeCount: number;
}

export function PatientFilters({ filters, onChange, activeCount }: PatientFiltersProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 rounded-xl gap-2 relative">
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="default" className="h-5 min-w-[20px] px-1 text-[11px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Género
            </p>
            <div className="flex flex-wrap gap-1.5">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...filters, gender: opt.value })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    filters.gender === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Integridad de datos
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMPLETENESS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...filters, completeness: opt.value })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    filters.completeness === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {activeCount > 0 && (
            <button
              onClick={() => onChange({ gender: '', completeness: '' })}
              className="text-xs text-primary font-medium hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
