export const ROLE_LABELS: Record<string, string> = {
  Practitioner: 'Médico',
  Doctor: 'Médico',
  Patient: 'Paciente',
  RelatedPerson: 'Familiar',
  Admin: 'Administrador',
};

export const STATUS_STYLES: Record<string, string> = {
  booked: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  arrived: 'bg-amber-100 text-amber-700',
  fulfilled: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  noshow: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
};
