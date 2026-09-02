'use client';

import { Button, cn } from '@aion/ui';
import { CheckCheck } from 'lucide-react';

interface FinanceFooterProps {
  totalBilled: number;
  totalPaid: number;
  totalBalance: number;
  previousPayments?: number;
  onApproveAll?: () => void;
}

export function FinanceFooter({ totalBilled, totalPaid, totalBalance, previousPayments = 0, onApproveAll }: FinanceFooterProps) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-medium">Total facturas del periodo</p>
          <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
            <div><span className="text-muted-foreground">Facturado:</span><span className="font-semibold ml-1">${totalBilled.toFixed(2)}</span></div>
            <div><span className="text-muted-foreground">Pagado:</span><span className="font-semibold text-green-600 ml-1">${totalPaid.toFixed(2)}</span></div>
            <div>
              <span className="text-muted-foreground">Saldo:</span>
              <span className={cn('font-semibold ml-1', totalBalance > 0 ? 'text-destructive' : 'text-foreground')}>
                ${totalBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-medium">Total pagos por facturas anteriores</p>
          <p className="text-lg font-semibold text-foreground mt-1">${previousPayments.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-medium">Total</p>
          <p className="text-lg font-bold text-foreground mt-1">${(totalBilled + previousPayments).toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="text-xs text-muted-foreground">Última actualización: {new Date().toLocaleString('es')}</div>
        <Button variant="ghost" size="sm" onClick={onApproveAll} className="flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50">
          <CheckCheck className="w-4 h-4" />Aprobar todo
        </Button>
      </div>
    </div>
  );
}
