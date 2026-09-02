import { MedplumClient } from '@aion/vendor-medplum';
import type { Invoice, PaymentNotice } from '@aion/vendor-medplum';

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

export interface FinanceSummary {
  totalBilled: number;
  totalPaid: number;
  totalBalance: number;
  transactions: FinanceTransaction[];
}

function toAmount(value: number | undefined | { value?: number }): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  return value.value ?? 0;
}

function toFinanceTransaction(invoice: Invoice, payments: PaymentNotice[]): FinanceTransaction {
  const paid = payments
    .filter((p) => p.amount?.value != null)
    .reduce((sum, p) => sum + (p.amount?.value ?? 0), 0);

  const billed = toAmount(invoice.totalGross) || toAmount(invoice.totalNet);

  return {
    id: invoice.id ?? '',
    date: invoice.date ?? '',
    patient: invoice.subject?.display ?? '—',
    doctor: '',
    cashier: '',
    billed,
    paid,
    balance: Math.max(0, billed - paid),
    status: invoice.status === 'balanced' ? 'paid' : 'pending',
  };
}

export async function getFinanceSummary(
  medplum: MedplumClient,
): Promise<FinanceSummary> {
  const [invoicesResult, paymentsResult] = await Promise.allSettled([
    medplum.searchResources('Invoice', { _count: 100 }),
    medplum.searchResources('PaymentNotice', { _count: 100 }),
  ]);

  const invoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value as Invoice[] : [];
  const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value as PaymentNotice[] : [];

  const transactions = invoices.map((inv) =>
    toFinanceTransaction(inv, payments.filter((p) => p.response?.reference?.includes(inv.id ?? '')))
  );

  const totalBilled = transactions.reduce((s, t) => s + t.billed, 0);
  const totalPaid = transactions.reduce((s, t) => s + t.paid, 0);

  return {
    totalBilled,
    totalPaid,
    totalBalance: totalBilled - totalPaid,
    transactions,
  };
}
