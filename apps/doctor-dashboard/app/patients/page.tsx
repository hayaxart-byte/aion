'use client';

import { useRouter } from 'next/navigation';
import { Plus, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button, Spinner, Card, CardContent } from '@aion/ui';
import { usePatientSearch } from '@/lib/patients';
import { PatientSearchBar } from '@/components/patients/PatientSearchBar';
import { PatientFilters } from '@/components/patients/PatientFilters';
import { PatientTable } from '@/components/patients/PatientTable';

export default function PatientsPage() {
  const router = useRouter();
  const { client } = useAuth();
  const {
    patients,
    loading,
    error,
    search,
    setSearch,
    filters,
    setFilters,
    hasActiveFilters,
    clearFilters,
    totalCount,
  } = usePatientSearch(client);

  const activeFilterCount = [filters.gender, filters.completeness].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Lista de pacientes registrados</p>
        </div>
        <Button
          className="h-10 px-5 rounded-xl font-medium text-sm shadow-sm gap-2"
          onClick={() => router.push('/patients/new')}
        >
          <Plus className="h-4 w-4" />
          Nuevo paciente
        </Button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <PatientSearchBar value={search} onChange={setSearch} />
          </div>
          <PatientFilters
            filters={filters}
            onChange={setFilters}
            activeCount={activeFilterCount}
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error?.message || 'Error al cargar pacientes'}
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <span>{totalCount} paciente{totalCount !== 1 ? 's' : ''}</span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary font-medium hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : patients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              {hasActiveFilters ? (
                'No se encontraron pacientes con los filtros seleccionados.'
              ) : (
                <>
                  No hay pacientes registrados.{' '}
                  <button
                    onClick={() => router.push('/patients/new')}
                    className="text-primary underline font-medium"
                  >
                    Registre el primer paciente
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <PatientTable
            patients={patients}
            onView={(id) => router.push(`/patients/${id}`)}
            onEdit={(id) => router.push(`/patients/${id}?edit=true`)}
            onDelete={async (id) => {
              if (confirm('¿Eliminar este paciente?')) {
                await client.deleteResource('Patient', id);
                clearFilters();
              }
            }}
            onSchedule={(id) => router.push(`/calendar?newAppointment=${id}`)}
            onNewConsultation={(id) => router.push(`/patients/${id}?newConsultation=true`)}
          />
        )}
      </div>
    </div>
  );
}
