'use client';

import { useState } from 'react';
import { Button, Input, Label, Switch, Popover, PopoverContent, PopoverTrigger, cn } from '@aion/ui';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Search, Filter, X, ChevronDown, User, Stethoscope, Hash, Building } from 'lucide-react';
import type { FinanceFiltersState, FinanceTab } from '@/lib/finance/types';
import { TAB_FILTERS } from '@/lib/finance/constants';

interface FinanceFiltersProps {
  tab: FinanceTab;
  filters: FinanceFiltersState;
  onFilterChange: (filters: Partial<FinanceFiltersState>) => void;
  onClear: () => void;
}

export function FinanceFilters({ tab, filters, onFilterChange, onClear }: FinanceFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const tabFilters = TAB_FILTERS[tab];

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') return value.start || value.end;
    if (key === 'hideRelated') return value;
    return value && value !== '';
  }).length;

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker
          startDate={filters.dateRange.start}
          endDate={filters.dateRange.end}
          onChange={(start, end) => onFilterChange({ dateRange: { start, end } })}
        />

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={filters.patient || filters.service}
              onChange={(e) => {
                const v = e.target.value;
                if (tab === 'expenses' || tab === 'payables') onFilterChange({ service: v });
                else onFilterChange({ patient: v });
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn('flex items-center gap-1.5 h-9', showAdvanced && 'border-primary bg-primary/5 text-primary')}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={cn('w-3 h-3 transition-transform', showAdvanced && 'rotate-180')} />
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-foreground h-9">
            <X className="w-4 h-4 mr-1" />Limpiar
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/50">
          {tabFilters.patient && (
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />Paciente
              </Label>
              <Input placeholder="Filtrar por paciente..." value={filters.patient} onChange={(e) => onFilterChange({ patient: e.target.value })} className="h-8 text-sm mt-1" />
            </div>
          )}
          {tabFilters.cashier && (
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Building className="w-3 h-3" />Cajero
              </Label>
              <Input placeholder="Filtrar por cajero..." value={filters.cashier} onChange={(e) => onFilterChange({ cashier: e.target.value })} className="h-8 text-sm mt-1" />
            </div>
          )}
          {tabFilters.doctor && (
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Stethoscope className="w-3 h-3" />Doctor
              </Label>
              <Input placeholder="Filtrar por doctor..." value={filters.doctor} onChange={(e) => onFilterChange({ doctor: e.target.value })} className="h-8 text-sm mt-1" />
            </div>
          )}
          {tabFilters.code && (
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Hash className="w-3 h-3" />Código de facturación
              </Label>
              <Input placeholder="Código..." value={filters.code} onChange={(e) => onFilterChange({ code: e.target.value })} className="h-8 text-sm mt-1" />
            </div>
          )}
          {tabFilters.service && (
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Building className="w-3 h-3" />Servicios
              </Label>
              <Input placeholder="Buscar servicio..." value={filters.service} onChange={(e) => onFilterChange({ service: e.target.value })} className="h-8 text-sm mt-1" />
            </div>
          )}
          <div className="flex items-center gap-3 col-span-full">
            <Switch id="hide-related" checked={filters.hideRelated} onCheckedChange={(checked) => onFilterChange({ hideRelated: checked })} />
            <Label htmlFor="hide-related" className="text-sm text-muted-foreground cursor-pointer">Ocultar relacionados</Label>
          </div>
        </div>
      )}
    </div>
  );
}
