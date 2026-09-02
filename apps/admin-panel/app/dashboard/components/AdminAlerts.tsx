'use client';

import { Card } from '@aion/ui';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@aion/ui';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
}

interface AdminAlertsProps {
  alerts?: Alert[];
  loading?: boolean;
}

const ALERT_STYLES: Record<string, string> = {
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
};

const ICON_MAP = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

export function AdminAlerts({ alerts = [], loading }: AdminAlertsProps) {
  if (loading) {
    return (
      <Card className="p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Alertas del sistema</h3>
        <p className="text-sm text-muted-foreground">No hay alertas activas</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Alertas del sistema</h3>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = ICON_MAP[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border',
                ALERT_STYLES[alert.type]
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs mt-0.5 opacity-80">{alert.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
