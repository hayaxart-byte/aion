'use client';

import { useState } from 'react';
import { Button, cn } from '@aion/ui';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

interface FinanceMetricsProps {
  income: number;
  expenses: number;
  onFilterChange: (type: 'all' | 'income' | 'expenses') => void;
  onClearFilters: () => void;
}

export function FinanceMetrics({ income, expenses, onFilterChange, onClearFilters }: FinanceMetricsProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expenses'>('all');

  const handleTypeChange = (type: 'all' | 'income' | 'expenses') => {
    setSelectedType(type);
    onFilterChange(type);
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Mostrar:</span>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            {(['all', 'income', 'expenses'] as const).map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleTypeChange(type)}
                className="h-7 px-3 text-xs"
              >
                {type === 'all' ? 'Ambos' : type === 'income' ? 'Ingresos' : 'Egresos'}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Ingresos</span>
              <span className="text-sm font-semibold ml-1 text-foreground">${income.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-full">
              <TrendingDown className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Egresos</span>
              <span className="text-sm font-semibold ml-1 text-foreground">${expenses.toFixed(2)}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3 mr-1" />Limpiar filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
