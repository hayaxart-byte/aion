export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'nurse' | 'patient';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  profileReference?: string;
  profile?: any;
}

export interface AppointmentWithPatient {
  id: string;
  patientName: string;
  patientId: string;
  start: string;
  status: string;
  description?: string;
}

export interface SummaryData {
  todayAppointments: number;
  nextAppointment: AppointmentWithPatient | null;
  pendingCount: number;
  cancelledCount: number;
}

export interface RecentPatientInfo {
  id: string;
  name: string;
  lastVisit: string;
  gender?: string;
}

export interface ActivityItem {
  id: string;
  type: 'appointment_created' | 'appointment_cancelled' | 'patient_registered' | 'consultation_completed';
  description: string;
  timestamp: string;
}

export interface DashboardData {
  summary: SummaryData;
  upcoming: AppointmentWithPatient[];
  recentPatients: RecentPatientInfo[];
  activity: ActivityItem[];
}

export const ROLE_LABELS_SHORT: Record<UserRole, string> = {
  admin: 'Administrador',
  doctor: 'Médico',
  receptionist: 'Recepción',
  nurse: 'Enfermería',
  patient: 'Paciente',
};

export const ROLE_ICONS: Record<UserRole, string> = {
  admin: '⚙️',
  doctor: '👨‍⚕️',
  receptionist: '📋',
  nurse: '🩺',
  patient: '🧑',
};
