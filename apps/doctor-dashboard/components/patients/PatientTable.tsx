'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@aion/ui';
import type { PatientRowData } from '@/lib/patients';
import { PatientRow } from './PatientRow';

interface PatientTableProps {
  patients: PatientRowData[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSchedule: (id: string) => void;
  onNewConsultation: (id: string) => void;
}

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[280px]">Paciente</TableHead>
          <TableHead className="w-[120px]">Documento</TableHead>
          <TableHead className="w-[160px]">Contacto</TableHead>
          <TableHead className="w-[80px]">Género</TableHead>
          <TableHead className="w-[120px]">Ciudad</TableHead>
          <TableHead className="w-[120px]">Integridad</TableHead>
          <TableHead className="w-[48px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <PatientRow
            key={patient.id}
            patient={patient}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onSchedule={onSchedule}
            onNewConsultation={onNewConsultation}
          />
        ))}
      </TableBody>
    </Table>
  );
}
