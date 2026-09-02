'use client';

import { useMemo, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, cn } from '@aion/ui';
import { ChevronUp, ChevronDown, MoreVertical, Eye, Edit, Download, Trash2, Search } from 'lucide-react';
import type { FinanceTransaction, FinanceTab } from '@/lib/finance/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/finance/constants';

interface FinanceTableProps {
  transactions: FinanceTransaction[];
  loading?: boolean;
  tab: FinanceTab;
  onRowClick?: (transaction: FinanceTransaction) => void;
  onAction?: (action: string, transaction: FinanceTransaction) => void;
}

const PATIENT_LABEL: Record<FinanceTab, string> = {
  income: 'Paciente',
  expenses: 'Proveedor',
  cashflow: 'Paciente',
  receivables: 'Paciente',
  payables: 'Proveedor',
};

export function FinanceTable({ transactions, loading, tab, onRowClick, onAction }: FinanceTableProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortField) return transactions;
    return [...transactions].sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, sortField, sortDirection]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border/50">
        <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
          <Search className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No se encontraron registros</h3>
        <p className="text-sm text-muted-foreground mt-1">Ajusta los filtros para ver más resultados</p>
      </div>
    );
  }

  const columns = [
    { key: 'date', label: 'Fecha', sortable: true, align: '' as const },
    { key: 'patient', label: PATIENT_LABEL[tab], sortable: true, align: '' as const },
    { key: 'doctor', label: 'Doctor', sortable: true, align: '' as const },
    { key: 'cashier', label: 'Cajero', sortable: true, align: '' as const },
    { key: 'billed', label: 'Facturado', sortable: false, align: 'right' as const },
    { key: 'paid', label: 'Pagado', sortable: false, align: 'right' as const },
    { key: 'balance', label: 'Saldo', sortable: false, align: 'right' as const },
    { key: 'status', label: 'Estado', sortable: false, align: '' as const },
  ];

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(col.align === 'right' && 'text-right', col.sortable && 'cursor-pointer hover:bg-muted/50')}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className={cn('flex items-center gap-1', col.align === 'right' && 'justify-end')}>
                  {col.label}
                  {col.sortable && sortField === col.key && (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
            ))}
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((t) => (
            <TableRow key={t.id} className="hover:bg-primary/5 cursor-pointer" onClick={() => onRowClick?.(t)}>
              <TableCell className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString('es')}</TableCell>
              <TableCell>
                <div className="font-medium text-foreground">{t.patient}</div>
                {(tab === 'expenses' || tab === 'payables') && <div className="text-xs text-muted-foreground">Proveedor</div>}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{t.doctor}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{t.cashier}</TableCell>
              <TableCell className="text-sm text-right font-medium text-foreground">${t.billed.toFixed(2)}</TableCell>
              <TableCell className="text-sm text-right font-medium text-green-600">${t.paid.toFixed(2)}</TableCell>
              <TableCell className="text-sm text-right font-medium">
                <span className={cn(t.balance > 0 ? 'text-destructive' : 'text-muted-foreground')}>
                  ${t.balance.toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                <Badge className={cn('text-xs', STATUS_COLORS[t.status])}>{STATUS_LABELS[t.status]}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onAction?.('view', t)}><Eye className="w-4 h-4 mr-2" />Ver detalle</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction?.('edit', t)}><Edit className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction?.('download', t)}><Download className="w-4 h-4 mr-2" />Descargar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction?.('delete', t)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
