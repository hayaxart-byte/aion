'use client';

import { Card, Badge, cn } from '@aion/ui';
import { UserPlus, CalendarPlus, CreditCard, Clock } from 'lucide-react';
import type { AdminActivityItem } from '@/lib/admin/types';

interface AdminRecentActivityProps {
  activities: AdminActivityItem[];
  loading?: boolean;
}

const ICON_MAP = {
  user_created: UserPlus,
  appointment_created: CalendarPlus,
  payment_received: CreditCard,
  user_updated: UserPlus,
};

const TYPE_COLORS: Record<string, string> = {
  user_created: 'bg-blue-50 text-blue-600',
  appointment_created: 'bg-purple-50 text-purple-600',
  payment_received: 'bg-green-50 text-green-600',
  user_updated: 'bg-gray-50 text-gray-600',
};

const STATUS_COLORS: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  pending: 'bg-blue-100 text-blue-700',
};

export function AdminRecentActivity({ activities, loading }: AdminRecentActivityProps) {
  if (loading) {
    return (
      <Card className="p-5">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function formatTimestamp(iso: string): string {
    try {
      return new Date(iso).toLocaleString('es', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Actividad reciente</h3>
        <span className="text-xs text-muted-foreground">{activities.length} eventos</span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay actividad reciente
          </p>
        ) : (
          activities.map((activity) => {
            const Icon = ICON_MAP[activity.type] || Clock;
            const typeColor = TYPE_COLORS[activity.type] || 'bg-gray-50 text-gray-600';
            const statusColor = activity.status ? STATUS_COLORS[activity.status] : '';
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <div className={cn('p-2 rounded-full shrink-0', typeColor)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground truncate">{activity.description}</p>
                    {activity.status && statusColor && (
                      <Badge className={cn('text-[10px] px-2 py-0 shrink-0', statusColor)} variant="outline">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>por {activity.user.name}</span>
                    <span>·</span>
                    <span>{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
