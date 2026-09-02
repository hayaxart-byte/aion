import SettingsView from './settings-view';

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
        <p className="text-sm text-slate-400 mt-1">Preferencias del sistema y la clínica</p>
      </div>
      <SettingsView />
    </div>
  );
}
