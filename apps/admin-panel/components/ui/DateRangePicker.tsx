'use client';

import { useState } from 'react';
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger, cn } from '@aion/ui';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  placeholder?: string;
}

export function DateRangePicker({ startDate, endDate, onChange, placeholder = 'Seleccionar rango' }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);

  const handleApply = () => {
    onChange(tempStart, tempEnd);
    setOpen(false);
  };

  const handleClear = () => {
    setTempStart(null);
    setTempEnd(null);
    onChange(null, null);
    setOpen(false);
  };

  const setToday = () => { const n = new Date(); setTempStart(n); setTempEnd(n); };
  const setThisWeek = () => { const n = new Date(); const s = new Date(n); s.setDate(n.getDate() - n.getDay()); setTempStart(s); setTempEnd(n); };
  const setThisMonth = () => { const n = new Date(); const s = new Date(n); s.setDate(1); setTempStart(s); setTempEnd(n); };
  const setLastYear = () => { const n = new Date(); const s = new Date(n); s.setFullYear(s.getFullYear() - 1); setTempStart(s); setTempEnd(n); };

  const displayText = startDate && endDate
    ? `${format(startDate, 'dd/MM/yyyy', { locale: es })} - ${format(endDate, 'dd/MM/yyyy', { locale: es })}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-9 flex items-center gap-2 text-sm font-normal', !startDate && !endDate && 'text-muted-foreground')}>
          <CalendarIcon className="w-4 h-4" />
          <span className="min-w-[120px]">{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="flex flex-wrap gap-1 mb-4">
            <Button variant="outline" size="sm" onClick={setToday} className="h-7 text-xs">Hoy</Button>
            <Button variant="outline" size="sm" onClick={setThisWeek} className="h-7 text-xs">Esta semana</Button>
            <Button variant="outline" size="sm" onClick={setThisMonth} className="h-7 text-xs">Este mes</Button>
            <Button variant="outline" size="sm" onClick={setLastYear} className="h-7 text-xs">Último año</Button>
          </div>
          <Calendar
            mode="range"
            selected={{ from: tempStart || undefined, to: tempEnd || undefined }}
            onSelect={(range) => { setTempStart(range?.from || null); setTempEnd(range?.to || null); }}
            initialFocus
          />
        </div>
        <div className="flex items-center justify-between gap-2 p-3 border-t bg-muted/30 rounded-b-lg">
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">Limpiar</Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleApply}>Aplicar</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
