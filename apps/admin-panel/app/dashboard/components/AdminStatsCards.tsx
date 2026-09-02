'use client';

import { Card, cn } from '@aion/ui';
import { Users, Building2, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import type { StatCardData } from '@/lib/admin/types';

const ICONS = {
  users: Users,
  building: Building2,
  calendar: Calendar,
  dollar: DollarSign,
};

const COLOR_MAP: Record<string, string> = {
  blue: 'border-l-blue-500 bg-blue-50/30',
  green: 'border-l-green-500 bg-green-50/30',
  purple: 'border-l-purple-500 bg-purple-50/30',
  orange: 'border-l-orange-500 bg-orange-50/30',
};

const ICON_BG: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
};

interface AdminStatsCardsProps {
  stats: StatCardData[];
  loading?: boolean;
}

export function AdminStatsCards({ stats, loading }: AdminStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 animate-pulse border border-border/50">
            <div className="h-4 bg-muted rounded w-1/2 mb-3" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  const iconKeys = ['users', 'building', 'calendar', 'dollar'] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = ICONS[iconKeys[i]];
        const borderClass = COLOR_MAP[stat.color];
        const iconBg = ICON_BG[stat.color];
        return (
          <Card key={stat.label} className={cn('p-5 border-l-4', borderClass)}>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                {stat.change !== undefined && (
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                    <span
                      className={cn(
                        'text-xs font-medium',
                        stat.trend === 'up'
                          ? 'text-green-600'
                          : stat.trend === 'down'
                            ? 'text-red-600'
                            : 'text-muted-foreground'
                      )}
                    >
                      {stat.change > 0 ? '+' : ''}
                      {stat.change}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs mes anterior</span>
                  </div>
                )}
              </div>
              <div className={cn('p-3 rounded-full shrink-0', iconBg)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
