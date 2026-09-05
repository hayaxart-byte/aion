'use client';

import { cn } from '@aion/ui';

export interface DataItem {
  label: string;
  value: string | number | undefined | null;
  format?: 'text' | 'date' | 'phone' | 'email';
}

interface MedicalDataGridProps {
  title?: string;
  items: DataItem[];
  className?: string;
  emptyText?: string;
  columns?: 2 | 3;
}

export function MedicalDataGrid({
  title,
  items,
  className,
  emptyText = '—',
  columns = 2,
}: MedicalDataGridProps) {
  const hasData = items.some(
    (item) => item.value !== undefined && item.value !== null && item.value !== ''
  );

  function formatValue(v: string | number | undefined | null, fmt?: string) {
    if (v === undefined || v === null || v === '') return emptyText;
    switch (fmt) {
      case 'date':
        try {
          return new Date(v).toLocaleDateString('es', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
        } catch {
          return String(v);
        }
      case 'phone':
        return String(v).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      case 'email':
        return (
          <a href={`mailto:${v}`} className="text-blue-600 hover:underline">
            {v}
          </a>
        );
      default:
        return String(v);
    }
  }

  return (
    <div className={cn('bg-white rounded-lg border p-4', className)}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      )}
      <div
        className={cn(
          'grid gap-0.5',
          columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col py-2 border-b border-gray-50 last:border-0"
          >
            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
            <span className="text-sm text-gray-900 mt-0.5">
              {formatValue(item.value, item.format)}
            </span>
          </div>
        ))}
      </div>
      {!hasData && <p className="text-sm text-gray-400 italic mt-2">{emptyText}</p>}
    </div>
  );
}
