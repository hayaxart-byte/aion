'use client';

import { Card } from '@aion/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface AdminChartsProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

export function AdminCharts({ data, loading }: AdminChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4" />
          <div className="h-60 bg-muted/50 rounded" />
        </Card>
      </div>
    );
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Distribución del sistema</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
            <YAxis stroke="#9CA3AF" fontSize={11} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Cantidad">
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
