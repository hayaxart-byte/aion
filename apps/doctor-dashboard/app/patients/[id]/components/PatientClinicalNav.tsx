'use client';

import { useState } from 'react';
import { cn } from '@aion/ui';
import {
  LayoutDashboard,
  User,
  FileText,
  Stethoscope,
  FolderOpen,
  Pill,
  Syringe,
  AlertTriangle,
  Shield,
  Calendar,
  DollarSign,
  Users,
  Activity,
  CreditCard,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'summary', label: 'Resumen', icon: LayoutDashboard },
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'clinical-history', label: 'Historias Clínicas', icon: FileText },
  { id: 'diagnostics', label: 'Diagnósticos', icon: Stethoscope },
  { id: 'documents', label: 'Documentos', icon: FolderOpen },
  { id: 'medications', label: 'Medicamentos', icon: Pill },
  { id: 'non-pharmacological', label: 'T. No farmacológico', icon: Activity },
  { id: 'vaccines', label: 'Vacunas', icon: Syringe },
  { id: 'allergies', label: 'Alergias', icon: AlertTriangle },
  { id: 'insurance', label: 'Seguros médicos', icon: Shield },
  { id: 'appointments', label: 'Citas', icon: Calendar },
  { id: 'income', label: 'Ingresos', icon: DollarSign },
  { id: 'receivables', label: 'Cuentas por cobrar', icon: CreditCard },
  { id: 'profile-activity', label: 'Actividad de perfiles', icon: Users },
] as const;

interface PatientClinicalNavProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  onNewAppointment: () => void;
  allergiesCount?: number;
}

export function PatientClinicalNav({
  activeSection,
  onSectionChange,
  onNewAppointment,
  allergiesCount,
}: PatientClinicalNavProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'h-full border-r border-border/50 bg-white flex flex-col transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <div
        className={cn(
          'p-3 space-y-2 border-b border-border/50',
          collapsed && 'flex flex-col items-center'
        )}
      >
        <button
          onClick={onNewAppointment}
          className={cn(
            'w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors',
            collapsed ? 'h-10 w-10 p-0' : 'h-9 px-4'
          )}
          title="Crear cita"
        >
          <Plus className="h-4 w-4" />
          {!collapsed && 'Crear cita'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all',
                'hover:bg-blue-50 hover:text-blue-600',
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 font-medium'
                  : 'text-gray-600'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-blue-600' : 'text-gray-400'
                )}
              />
              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!collapsed && item.id === 'allergies' && allergiesCount !== undefined && allergiesCount > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {allergiesCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-8 border-t border-border/50 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );
}
