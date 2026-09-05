'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@aion/ui';
import { PatientContextMenu } from './PatientContextMenu';
import type { PatientRowData } from '@/lib/patients';

interface PatientTableProps {
  patients: PatientRowData[];
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

const COMPLETENESS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  complete: { label: 'Completo', variant: 'success' },
  partial: { label: 'Parcial', variant: 'warning' },
  minimal: { label: 'Mínimo', variant: 'neutral' },
};

export function PatientTable({
  patients,
  onView,
  onEdit,
  onDelete,
  onSchedule,
  onNewConsultation,
}: PatientTableProps) {
  if (patients.length === 0) return null;

  return (
    <>
      {/* Desktop: full table */}
      <div className="hidden md:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Paciente</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[120px]">Documento</TableHead>
              <TableHead className="min-w-[140px]">Contacto</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[80px]">Género</TableHead>
              <TableHead className="hidden xl:table-cell min-w-[120px]">Ciudad</TableHead>
              <TableHead className="min-w-[100px]">Integridad</TableHead>
              <TableHead className="w-[48px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow
                key={patient.id}
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
                <TableCell className="hidden lg:table-cell">
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
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : '—'}
                  </span>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <span className="text-sm text-muted-foreground">{patient.city || '—'}</span>
                </TableCell>
                <TableCell>
                  {(() => {
                    const config = COMPLETENESS_CONFIG[patient.dataCompleteness] ?? COMPLETENESS_CONFIG.minimal;
                    return <Badge variant={config.variant}>{config.label}</Badge>;
                  })()}
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {patients.map((patient) => {
          const config = COMPLETENESS_CONFIG[patient.dataCompleteness] ?? COMPLETENESS_CONFIG.minimal;
          return (
            <div
              key={patient.id}
              className="rounded-xl border border-border/50 bg-white p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${genderAvatarColor(patient.gender)}`}>
                    {initials(patient.name)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{patient.name}</p>
                    {patient.birthDate && (
                      <p className="text-xs text-muted-foreground">{patient.birthDate}</p>
                    )}
                  </div>
                </div>
                <PatientContextMenu
                  patientId={patient.id}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSchedule={onSchedule}
                  onNewConsultation={onNewConsultation}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {patient.documentId && (
                  <div>
                    <span className="text-muted-foreground">Documento:</span>{' '}
                    <span className="text-foreground">{patient.documentId}</span>
                  </div>
                )}
                {patient.city && (
                  <div>
                    <span className="text-muted-foreground">Ciudad:</span>{' '}
                    <span className="text-foreground">{patient.city}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="col-span-2 truncate">
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="text-foreground">{patient.email}</span>
                  </div>
                )}
                {patient.phone && (
                  <div>
                    <span className="text-muted-foreground">Tel:</span>{' '}
                    <span className="text-foreground">{patient.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/30">
                <Badge variant={config.variant}>{config.label}</Badge>
                <button
                  onClick={() => onView(patient.id)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Ver detalle
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
