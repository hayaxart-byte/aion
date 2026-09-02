'use client';

import { useEffect, useState } from 'react';
import type { FilterState } from '@/components/calendar/CalendarFilters';

interface CalendarPreferences {
  sidebarCollapsed: boolean;
  filters: FilterState;
  timeRange: { start: number; end: number };
}

const ALL_TYPES = ['new', 'followup', 'telemedicine', 'checkup', 'emergency', 'other'];
const ALL_CHANNELS = ['in_person', 'video', 'phone'];

const DEFAULTS: CalendarPreferences = {
  sidebarCollapsed: false,
  filters: { types: ALL_TYPES, channels: ALL_CHANNELS },
  timeRange: { start: 8, end: 19 },
};

const STORAGE_KEY = 'aion:calendar-prefs';

export function useCalendarPreferences() {
  const [prefs, setPrefs] = useState<CalendarPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULTS,
          ...parsed,
          filters: { ...DEFAULTS.filters, ...parsed.filters },
        };
      }
    } catch {}
    return DEFAULTS;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  function toggleSidebar() {
    setPrefs(p => ({ ...p, sidebarCollapsed: !p.sidebarCollapsed }));
  }

  function setFilters(filters: FilterState) {
    setPrefs(p => ({ ...p, filters }));
  }

  function setTimeRange(start: number, end: number) {
    setPrefs(p => ({ ...p, timeRange: { start, end } }));
  }

  return { prefs, toggleSidebar, setFilters, setTimeRange };
}
