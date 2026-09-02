import type { FinanceTab } from './types';

export const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
};

export const STATUS_LABELS: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  overdue: 'Vencido',
};

export const TAB_LABELS: Record<FinanceTab, string> = {
  income: 'Ingresos',
  expenses: 'Egresos',
  cashflow: 'Flujo de caja',
  receivables: 'Cuentas por cobrar',
  payables: 'Cuentas por pagar',
};

export const TAB_DESCRIPTIONS: Record<FinanceTab, string> = {
  income: 'Gestión de ingresos del centro médico',
  expenses: 'Gestión de gastos y costos operativos',
  cashflow: 'Control del flujo de efectivo',
  receivables: 'Gestión de deudas y facturas pendientes',
  payables: 'Gestión de deudas y facturas por pagar',
};

export const TAB_FILTERS: Record<FinanceTab, { patient: boolean; cashier: boolean; doctor: boolean; code: boolean; service: boolean }> = {
  income: { patient: true, cashier: true, doctor: true, code: true, service: false },
  expenses: { patient: false, cashier: true, doctor: true, code: false, service: true },
  cashflow: { patient: true, cashier: true, doctor: true, code: true, service: true },
  receivables: { patient: true, cashier: true, doctor: true, code: true, service: false },
  payables: { patient: true, cashier: true, doctor: true, code: false, service: true },
};
