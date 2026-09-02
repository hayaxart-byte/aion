import ProfileView from './profile-view';

export default function ProfilePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
        <p className="text-sm text-slate-400 mt-1">Información profesional y estadísticas</p>
      </div>
      <ProfileView />
    </div>
  );
}
