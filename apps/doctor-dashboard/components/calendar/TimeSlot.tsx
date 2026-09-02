'use client';

import { useState } from 'react';
import { cn } from '@aion/ui';

interface TimeSlotProps {
  hour: number;
  minute: number;
  isOccupied: boolean;
  isCurrentTime: boolean;
  isHour: boolean;
  onClick: () => void;
}

export function TimeSlot({ hour, minute, isOccupied, isCurrentTime, isHour, onClick }: TimeSlotProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isAvailable = !isOccupied;

  return (
    <div
      className={cn(
        'relative border-l transition-colors duration-100',
        isHour ? 'border-slate-300' : 'border-slate-200',
        isAvailable ? 'cursor-pointer' : 'cursor-default',
        isHovered && isAvailable && 'bg-primary/[0.03]',
        isCurrentTime && 'bg-red-50/40',
      )}
      style={{ height: 48 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isAvailable ? onClick : undefined}
    >
      {isAvailable && isHovered && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-30 pointer-events-none">
          Click para agendar
        </div>
      )}
    </div>
  );
}
