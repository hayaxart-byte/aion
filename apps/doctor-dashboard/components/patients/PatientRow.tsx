'use client';

import { TableCell, TableRow, Badge } from '@aion/ui';
import { PatientContextMenu } from './PatientContextMenu';
import type { PatientRowData } from '@/lib/patients';

interface PatientRowProps {
  patient: PatientRowData;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSchedule: (id: string) => void;
  onNewConsultation: (id: string) => void;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function genderAvatarColor(g: string): string {
  switch (g) {
    case 'female': return 'bg-rose-50 text-rose-600';
    case 'male': return 'bg-blue-50 text-blue-600';
    default: return 'bg-slate-100 text-slate-600';
  }
}

function genderLabel(g: string): string {
  switch (g) {
    case 'male': return 'M';
    case 'female': return 'F';
    default: return '—';
  }
}

const COMPLETENESS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  complete: { label: 'Completo', variant: 'success' },
  partial: { label: 'Parcial', variant: 'warning' },
  minimal: { label: 'Mínimo', variant: 'neutral' },
};

export function PatientRow({
  patient,
  onView,
  onEdit,
  onDelete,
  onSchedule,
  onNewConsultation,
}: PatientRowProps) {
  const config = COMPLETENESS_CONFIG[patient.dataCompleteness] ?? COMPLETENESS_CONFIG.minimal;
  return (
    <TableRow
      className="cursor-pointer"
      onDoubleClick={() => onView(patient.id)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${genderAvatarColor(patient.gender)}`}>
            {initials(patient.name)}
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">{patient.name}</p>
            {patient.birthDate && (
              <p className="text-xs text-muted-foreground">{patient.birthDate}</p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">{patient.documentId || '—'}</span>
      </TableCell>
      <TableCell>
        <div className="space-y-0.5">
          {patient.email && (
            <p className="text-xs text-muted-foreground truncate max-w-[140px]" title={patient.email}>
              {patient.email}
            </p>
          )}
          {patient.phone && (
            <p className="text-xs text-muted-foreground">{patient.phone}</p>
          )}
          {!patient.email && !patient.phone && (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">{genderLabel(patient.gender)}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">{patient.city || '—'}</span>
      </TableCell>
      <TableCell>
        <Badge variant={config.variant}>{config.label}</Badge>
      </TableCell>
      <TableCell>
        <PatientContextMenu
          patientId={patient.id}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onSchedule={onSchedule}
          onNewConsultation={onNewConsultation}
        />
      </TableCell>
    </TableRow>
  );
}
