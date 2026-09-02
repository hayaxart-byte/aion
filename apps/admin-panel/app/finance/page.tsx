'use client';

import { useState, useMemo, useCallback } from 'react';
import { Spinner } from '@aion/ui';
import { FinanceTabs } from './components/FinanceTabs';
import { FinanceFilters } from './components/FinanceFilters';
import { FinanceTable } from './components/FinanceTable';
import { FinanceFooter } from './components/FinanceFooter';
import { FinanceMetrics } from './components/FinanceMetrics';
import { FinanceFAB } from './components/FinanceFAB';
import { useFinanceData } from './hooks/useFinanceData';
import type { FinanceTab, FinanceFiltersState, FinanceTransaction } from '@/lib/finance/types';

const DEFAULT_FILTERS: FinanceFiltersState = {
  dateRange: { start: null, end: null },
  patient: '',
  cashier: '',
  doctor: '',
  code: '',
  service: '',
  hideRelated: false,
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('income');
  const [filters, setFilters] = useState<FinanceFiltersState>(DEFAULT_FILTERS);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expenses'>('all');

  const { data, loading, error } = useFinanceData(activeTab, filters);

  const filteredByType = useMemo(() => {
    if (!data || filterType === 'all') return data || [];
    if (filterType === 'income') return data.filter((t) => t.paid >= 0);
    return data.filter((t) => t.paid < 0);
  }, [data, filterType]);

  const totals = useMemo(() => {
    if (!data) return { billed: 0, paid: 0, balance: 0 };
    return data.reduce(
      (acc, t) => ({ billed: acc.billed + t.billed, paid: acc.paid + t.paid, balance: acc.balance + t.balance }),
      { billed: 0, paid: 0, balance: 0 }
    );
  }, [data]);

  const income = data?.filter((t) => t.balance >= 0).reduce((acc, t) => acc + t.paid, 0) || 0;
  const expenses = data?.filter((t) => t.balance < 0).reduce((acc, t) => acc + Math.abs(t.paid), 0) || 0;

  const handleFilterChange = useCallback((partial: Partial<FinanceFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleTabChange = useCallback((tab: FinanceTab) => {
    setActiveTab(tab);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleFilterTypeChange = useCallback((type: 'all' | 'income' | 'expenses') => {
    setFilterType(type);
  }, []);

  const handleRowClick = useCallback((transaction: FinanceTransaction) => {
    console.log('[Finance] Row click:', transaction.id);
  }, []);

  const handleAction = useCallback((action: string, transaction: FinanceTransaction) => {
    console.log('[Finance] Action:', action, transaction.id);
  }, []);

  const handleNewIncome = useCallback(() => {
    alert('Nuevo ingreso — funcionalidad en desarrollo');
  }, []);

  const handleNewExpense = useCallback(() => {
    alert('Nuevo egreso — funcionalidad en desarrollo');
  }, []);

  const handleApproveAll = useCallback(() => {
    const pending = (filteredByType || []).filter((t) => t.status === 'pending').length;
    alert(`Aprobando ${pending} transacciones pendientes`);
  }, [filteredByType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive">Error al cargar datos financieros</div>
        <div className="text-sm text-muted-foreground mt-2">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finanzas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gestión financiera del centro médico</p>
      </div>

      <FinanceTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'cashflow' && (
        <FinanceMetrics income={income} expenses={expenses} onFilterChange={handleFilterTypeChange} onClearFilters={handleClearFilters} />
      )}

      <FinanceFilters tab={activeTab} filters={filters} onFilterChange={handleFilterChange} onClear={handleClearFilters} />
      <FinanceTable transactions={filteredByType} loading={loading} tab={activeTab} onRowClick={handleRowClick} onAction={handleAction} />
      <FinanceFooter totalBilled={totals.billed} totalPaid={totals.paid} totalBalance={totals.balance} onApproveAll={handleApproveAll} />
      <FinanceFAB onNewIncome={handleNewIncome} onNewExpense={handleNewExpense} />
    </div>
  );
}
