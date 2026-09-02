export interface AdminUserCounts {
  total: number;
  doctors: number;
  patients: number;
  receptionists: number;
  nurses: number;
}

export interface AdminOrgCounts {
  total: number;
  active: number;
}

export interface AdminApptCounts {
  total: number;
  today: number;
  upcoming: number;
}

export interface AdminStats {
  userCounts: AdminUserCounts;
  organizationCounts: AdminOrgCounts;
  appointmentCounts: AdminApptCounts;
  revenue: { total: number; monthly: number; growth: number };
}

export interface AdminActivityItem {
  id: string;
  type: 'user_created' | 'appointment_created' | 'payment_received' | 'user_updated';
  description: string;
  user: { name: string; role: string };
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'pending';
}

export interface AdminDashboardData {
  stats: AdminStats;
  activity: AdminActivityItem[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  resourceType: string;
  organization: string;
  status: string;
  lastActive: string;
  createdAt: string;
}

export interface AdminOrganization {
  id: string;
  name: string;
  type: string;
  status: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface StatCardData {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'purple' | 'orange';
}
