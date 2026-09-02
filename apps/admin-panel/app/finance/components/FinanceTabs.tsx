'use client';

import { TrendingUp, TrendingDown, Wallet, Receipt, CreditCard } from 'lucide-react';
import { cn } from '@aion/ui';
import type { FinanceTab } from '@/lib/finance/types';
import { TAB_LABELS, TAB_DESCRIPTIONS } from '@/lib/finance/constants';

const TAB_ICONS: Record<FinanceTab, React.ComponentType<{ className?: string }>> = {
  income: TrendingUp,
  expenses: TrendingDown,
  cashflow: Wallet,
  receivables: Receipt,
  payables: CreditCard,
};

const TABS = Object.keys(TAB_LABELS) as FinanceTab[];

interface FinanceTabsProps {
  activeTab: FinanceTab;
  onTabChange: (tab: FinanceTab) => void;
}

export function FinanceTabs({ activeTab, onTabChange }: FinanceTabsProps) {
  return (
    <div className="border-b border-border bg-card rounded-t-xl">
      <div className="flex items-center gap-1 px-4 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const Icon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 border-transparent whitespace-nowrap',
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:border-border'
              )}
              title={TAB_DESCRIPTIONS[tab]}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
              {TAB_LABELS[tab]}
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
