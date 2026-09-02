'use client';

import { useMemo } from 'react';
import type { CalendarAppointment } from './use-week-appointments';
import AppointmentBlock from './appointment-block';
import { TimeSlot } from '@/components/calendar/TimeSlot';
import { CurrentTimeIndicator } from '@/components/calendar/CurrentTimeIndicator';

const START_HOUR = 8;
const END_HOUR = 19;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const SLOTS = TOTAL_HOURS * 2;
const SLOT_HEIGHT = 48;

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getDayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function getDayDate(monday: Date, dayOffset: number): Date {
  const d = new Date(monday);
  d.setDate(d.getDate() + dayOffset);
  return d;
}

function isToday(date: Date): boolean {
  const t = new Date();
  return date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate();
}

interface SlotInfo {
  dayIndex: number;
  slotIndex: number;
  hour: number;
  minute: number;
  date: Date;
}

interface Props {
  monday: Date;
  appointments: CalendarAppointment[];
  onSlotClick: (info: SlotInfo) => void;
  onAppointmentClick: (appt: CalendarAppointment) => void;
}

export type { SlotInfo };

export default function WeekGrid({ monday, appointments, onSlotClick, onAppointmentClick }: Props) {
  const timeLabels: { label: string; row: number }[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    timeLabels.push({ label: `${String(h).padStart(2, '0')}:00`, row: (h - START_HOUR) * 2 });
  }

  const occupiedSet = useMemo(() => {
    const set = new Set<string>();
    for (const appt of appointments) {
      const di = getDayIndex(appt.start);
      let cursor = new Date(appt.start);
      while (cursor < appt.end) {
        const h = cursor.getHours();
        const m = cursor.getMinutes();
        const slotI = Math.floor(((h * 60 + m) - START_HOUR * 60) / 30);
        if (slotI >= 0 && slotI < SLOTS) {
          set.add(`${di}-${slotI}`);
        }
        cursor = new Date(cursor.getTime() + 30 * 60000);
      }
    }
    return set;
  }, [appointments]);

  function position(appt: CalendarAppointment) {
    const startMin = appt.start.getHours() * 60 + appt.start.getMinutes();
    const endMin = appt.end.getHours() * 60 + appt.end.getMinutes();
    const dayMin = START_HOUR * 60;
    const clampedStart = Math.max(startMin, dayMin);
    const clampedEnd = Math.min(endMin, END_HOUR * 60);
    const startSlot = (clampedStart - dayMin) / 30;
    const endSlot = (clampedEnd - dayMin) / 30;
    const span = Math.max(endSlot - startSlot, 1);
    return {
      top: startSlot * SLOT_HEIGHT,
      height: span * SLOT_HEIGHT - 2,
      dayIndex: getDayIndex(appt.start),
    };
  }

  const groupedByDay = new Map<number, CalendarAppointment[]>();
  for (const appt of appointments) {
    const di = getDayIndex(appt.start);
    if (!groupedByDay.has(di)) groupedByDay.set(di, []);
    groupedByDay.get(di)!.push(appt);
  }

  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const currentSlotIndex = Math.floor((currentMin - START_HOUR * 60) / 30);

  return (
    <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="min-w-[900px]">
        <div className="flex border-b border-slate-200 bg-slate-50/50 sticky top-0 z-20">
          <div className="w-16 shrink-0" />
          {DAY_LABELS.map((label, i) => {
            const date = getDayDate(monday, i);
            const today = isToday(date);
            return (
              <div
                key={label}
                className={`flex-1 text-center py-3 text-xs font-semibold uppercase tracking-wider
                  ${today ? 'text-primary' : 'text-slate-500'}`}
              >
                {label}
                <span className={`ml-1 font-normal ${today ? 'text-primary' : 'text-slate-400'}`}>
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex relative">
          <div className="w-16 shrink-0 relative">
            {timeLabels.map((t) => (
              <div
                key={t.row}
                className="text-[11px] text-slate-600 font-medium pr-2 text-right leading-none"
                style={{ height: SLOT_HEIGHT, paddingTop: t.row === 0 ? 0 : undefined }}
              >
                <span className="relative" style={{ top: -6 }}>{t.label}</span>
              </div>
            ))}
          </div>

          {DAY_LABELS.map((_, dayIdx) => {
            const dayDate = getDayDate(monday, dayIdx);
            const today = isToday(dayDate);
            const dayAppts = groupedByDay.get(dayIdx) ?? [];

            return (
              <div
                key={dayIdx}
                className={`flex-1 relative ${today ? 'bg-primary/[0.02]' : ''}`}
                style={{ height: SLOTS * SLOT_HEIGHT }}
              >
                {Array.from({ length: SLOTS }).map((_, slotIdx) => {
                  const hour = START_HOUR + Math.floor(slotIdx / 2);
                  const minute = (slotIdx % 2) * 30;
                  const isHour = minute === 0;
                  const key = `${dayIdx}-${slotIdx}`;
                  const isOccupied = occupiedSet.has(key);
                  const isCurrentTime = today && slotIdx === currentSlotIndex;

                  return (
                    <TimeSlot
                      key={key}
                      hour={hour}
                      minute={minute}
                      isOccupied={isOccupied}
                      isCurrentTime={isCurrentTime}
                      isHour={isHour}
                      onClick={() => onSlotClick({ dayIndex: dayIdx, slotIndex: slotIdx, hour, minute, date: dayDate })}
                    />
                  );
                })}

                {dayAppts.map((appt) => {
                  const pos = position(appt);
                  return (
                    <AppointmentBlock
                      key={appt.id}
                      appointment={appt}
                      style={{ top: pos.top, height: pos.height }}
                      onClick={() => onAppointmentClick(appt)}
                    />
                  );
                })}

                {today && <CurrentTimeIndicator slotHeight={SLOT_HEIGHT} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
