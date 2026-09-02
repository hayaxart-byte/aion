import CalendarView from './calendar-view';

export default function CalendarPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
        <p className="text-sm text-slate-400 mt-1">Vista semanal de citas</p>
      </div>
      <CalendarView />
    </div>
  );
}
