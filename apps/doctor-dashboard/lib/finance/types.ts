export type FinanceTab = 'income' | 'expenses' | 'cashflow' | 'receivables' | 'payables';

export interface FinanceTransaction {
  id: string;
  date: string;
  patient: string;
  doctor: string;
  cashier: string;
  billed: number;
  paid: number;
  balance: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface FinanceFiltersState {
  dateRange: { start: Date | null; end: Date | null };
  patient: string;
  cashier: string;
  doctor: string;
  code: string;
  service: string;
  hideRelated: boolean;
}
