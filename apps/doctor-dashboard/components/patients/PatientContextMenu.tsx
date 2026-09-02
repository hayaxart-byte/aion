'use client';

import { MoreHorizontal, Eye, Pencil, Trash2, CalendarPlus, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@aion/ui';

interface PatientContextMenuProps {
  patientId: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onNewConsultation?: (id: string) => void;
}

export function PatientContextMenu({
  patientId,
  onView,
  onEdit,
  onDelete,
  onSchedule,
  onNewConsultation,
}: PatientContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Acciones del paciente"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onView && (
          <DropdownMenuItem onClick={() => onView(patientId)}>
            <Eye className="h-4 w-4 mr-2" />
            Ver detalle
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(patientId)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
        )}
        {onSchedule && (
          <DropdownMenuItem onClick={() => onSchedule(patientId)}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Agendar cita
          </DropdownMenuItem>
        )}
        {onNewConsultation && (
          <DropdownMenuItem onClick={() => onNewConsultation(patientId)}>
            <FileText className="h-4 w-4 mr-2" />
            Nueva consulta
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(patientId)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
