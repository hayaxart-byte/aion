'use client';

import { useState } from 'react';
import { Button, cn } from '@aion/ui';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

interface FinanceFABProps {
  onNewIncome: () => void;
  onNewExpense: () => void;
}

export function FinanceFAB({ onNewIncome, onNewExpense }: FinanceFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-2">
          <Button onClick={onNewIncome} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg w-full">
            <TrendingUp className="w-4 h-4" />Nuevo ingreso
          </Button>
          <Button onClick={onNewExpense} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-full">
            <TrendingDown className="w-4 h-4" />Nuevo egreso
          </Button>
        </div>
      )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg transition-transform duration-300',
          isOpen ? 'rotate-45 bg-muted-foreground hover:bg-foreground' : 'bg-primary hover:bg-primary/90'
        )}
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </Button>
    </div>
  );
}
