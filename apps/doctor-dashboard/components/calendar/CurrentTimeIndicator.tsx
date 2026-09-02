'use client';

import { useEffect, useState } from 'react';

const START_HOUR = 8;
const END_HOUR = 19;
const TOTAL_VISIBLE_SLOTS = (END_HOUR - START_HOUR) * 2;

export function CurrentTimeIndicator({ slotHeight }: { slotHeight: number }) {
  const [position, setPosition] = useState(-1);

  useEffect(() => {
    function update() {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = START_HOUR * 60;
      const endMinutes = END_HOUR * 60;
      if (minutes < startMinutes || minutes >= endMinutes) {
        setPosition(-1);
        return;
      }
      const slotIndex = (minutes - startMinutes) / 30;
      const slotFraction = (minutes % 30) / 30;
      setPosition((slotIndex + slotFraction) * slotHeight);
    }

    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [slotHeight]);

  if (position < 0) return null;

  return (
    <div className="absolute left-0 right-0 pointer-events-none z-20" style={{ top: position }}>
      <div className="h-0.5 bg-red-500 relative shadow-sm">
        <div className="absolute -left-1 -top-[5px] h-3 w-3 rounded-full bg-red-500 shadow-md" />
      </div>
    </div>
  );
}
