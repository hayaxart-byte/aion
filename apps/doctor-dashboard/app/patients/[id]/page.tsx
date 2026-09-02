'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import ClinicalPatientForm from '@/components/patient/ClinicalPatientForm';
import { Spinner } from '@aion/ui';
import { MedicalDataGrid } from '@/components/ui/MedicalDataGrid';
import { PatientClinicalNav } from './components/PatientClinicalNav';
import { PatientProfileHeader } from './components/PatientProfileHeader';
import { usePatientExtraData } from './hooks/usePatientData';
import type { Patient } from '@aion/vendor-medplum';
import type { AppointmentWithPatient } from '@aion/domain';

const SECTION_LABELS: Record<string, string> = {
  summary: 'Resumen',
  profile: 'Perfil',
  'clinical-history': 'Historias Clínicas',
  diagnostics: 'Diagnósticos',
  documents: 'Documentos',
  medications: 'Medicamentos',
  'non-pharmacological': 'T. No farmacológico',
  vaccines: 'Vacunas',
  allergies: 'Alergias',
  insurance: 'Seguros médicos',
  appointments: 'Citas',
  income: 'Ingresos',
  receivables: 'Cuentas por cobrar',
  'profile-activity': 'Actividad de perfiles',
};

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { client } = useAuth();
  const id = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [nextAppointment, setNextAppointment] = useState<AppointmentWithPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const { allergies, insurance } = usePatientExtraData(id, client);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.readResource('Patient', id);
      setPatient(result as Patient);

      const today = new Date().toISOString().split('T')[0];
      const apptBundle = await client.search('Appointment', {
        'date:ge': today,
        'actor:Patient': id,
        _sort: 'date',
        _count: '1',
        status: 'booked',
      });
      const appt = (apptBundle.entry?.[0]?.resource as any) ?? null;
      setNextAppointment(
        appt
          ? {
              id: appt.id,
              patientName: '',
              patientId: id,
              start: appt.start,
              status: appt.status,
              description: appt.description,
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar paciente');
    } finally {
      setLoading(false);
    }
  }, [client, id]);

  useEffect(() => { load(); }, [load]);

  async function handleUpdate(updated: Patient) {
    setError(null);
    try {
      const result = await client.updateResource({ ...updated, id });
      setPatient(result as Patient);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este paciente?')) return;
    try {
      await client.deleteResource('Patient', id);
      router.push('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md">{error}</div>
        <button className="text-sm text-primary underline mt-3" onClick={load}>Reintentar</button>
      </div>
    );
  }

  if (!patient) return null;

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Editar paciente</h1>
          <button className="text-sm text-muted-foreground underline" onClick={() => setEditing(false)}>
            Volver al detalle
          </button>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>
        )}

        <ClinicalPatientForm
          medplum={client}
          defaultValue={patient}
          onSave={handleUpdate}
          onDelete={handleDelete}
          mode="edit"
        />
      </div>
    );
  }

  const n = patient.name?.[0];
  const fullName = [n?.given?.[0], n?.family].filter(Boolean).join(' ') || 'Sin nombre';
  const contactPerson = patient.contact?.[0];

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-border/50 bg-white">
      <PatientClinicalNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onNewAppointment={() => router.push(`/calendar?newAppointment=${patient.id}`)}
        allergiesCount={allergies.length}
      />
      <div className="flex-1 overflow-y-auto">
        <PatientProfileHeader
          patient={patient}
          allergiesCount={allergies.length}
          nextAppointment={nextAppointment}
        />

        <div className="flex items-center justify-end gap-2 px-6 py-2 border-b border-border/50 bg-gray-50/50">
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Editar información
          </button>
          <button
            onClick={handleDelete}
            className="text-xs font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Eliminar
          </button>
        </div>

        <div className="p-6">
          {activeSection === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MedicalDataGrid
                title="Información del paciente"
                items={[
                  { label: 'Nombre completo', value: fullName },
                  { label: 'Fecha de nacimiento', value: patient.birthDate, format: 'date' },
                  {
                    label: 'Sexo',
                    value:
                      patient.gender === 'male'
                        ? 'Masculino'
                        : patient.gender === 'female'
                          ? 'Femenino'
                          : patient.gender === 'other'
                            ? 'Otro'
                            : '—',
                  },
                  {
                    label: 'Documento',
                    value:
                      patient.identifier?.find(
                        (i: any) =>
                          i.type?.coding?.[0]?.code === 'DNI' ||
                          i.type?.coding?.[0]?.code === 'CC' ||
                          i.type?.coding?.[0]?.code === 'MR'
                      )?.value,
                  },
                  { label: 'Estado', value: patient.active !== false ? 'Activo' : 'Inactivo' },
                  { label: 'Expediente', value: `#${patient.id?.substring(0, 8)}` },
                ]}
              />

              <MedicalDataGrid
                title="Información de contacto"
                items={[
                  {
                    label: 'Celular',
                    value: patient.telecom?.find((t) => t.system === 'phone')?.value,
                    format: 'phone',
                  },
                  {
                    label: 'Correo electrónico',
                    value: patient.telecom?.find((t) => t.system === 'email')?.value,
                    format: 'email',
                  },
                  { label: 'Dirección', value: patient.address?.[0]?.line?.[0] },
                  { label: 'País', value: patient.address?.[0]?.country },
                  { label: 'Ciudad', value: patient.address?.[0]?.city },
                ]}
              />

              <MedicalDataGrid
                title="Persona de contacto"
                items={
                  contactPerson
                    ? [
                        { label: 'Nombre', value: contactPerson.name?.text || contactPerson.name?.given?.[0] },
                        { label: 'Relación', value: (contactPerson.relationship as any)?.[0]?.coding?.[0]?.display || (contactPerson.relationship as any)?.[0]?.text },
                        {
                          label: 'Teléfono',
                          value: contactPerson.telecom?.find((t: any) => t.system === 'phone')?.value,
                          format: 'phone',
                        },
                        {
                          label: 'Email',
                          value: contactPerson.telecom?.find((t: any) => t.system === 'email')?.value,
                          format: 'email',
                        },
                      ]
                    : [{ label: 'Estado', value: 'No hay registro de persona de contacto' }]
                }
                emptyText="No hay registro de persona de contacto"
              />

              <MedicalDataGrid
                title="Seguro médico"
                items={
                  insurance
                    ? [
                        { label: 'Aseguradora', value: insurance.payor?.[0]?.display },
                        { label: 'Número de póliza', value: (insurance as any).policyNumber },
                        { label: 'Relación', value: insurance.relationship?.coding?.[0]?.display },
                        {
                          label: 'Vigencia desde',
                          value: insurance.period?.start,
                          format: 'date',
                        },
                        {
                          label: 'Vigencia hasta',
                          value: insurance.period?.end,
                          format: 'date',
                        },
                      ]
                    : [{ label: 'Estado', value: 'Sin seguro médico registrado' }]
                }
                emptyText="Sin seguro médico registrado"
              />
            </div>
          )}

          {activeSection === 'allergies' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Alergias registradas</h2>
              {allergies.length > 0 ? (
                <div className="grid gap-3">
                  {allergies.map((a, i) => (
                    <div key={a.id || i} className="bg-white rounded-lg border border-border/50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          <span className="text-red-600 text-sm font-bold">!</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {a.code?.coding?.[0]?.display || a.code?.text || 'Alergia no especificada'}
                          </p>
                          {a.reaction?.[0]?.manifestation?.[0] && (
                            <p className="text-sm text-gray-500 mt-1">
                              Reacción:{' '}
                              {a.reaction[0].manifestation[0].text ||
                                a.reaction[0].manifestation[0].coding?.[0]?.display}
                            </p>
                          )}
                          {a.criticality && (
                            <span className="inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                              {a.criticality === 'high'
                                ? 'Alta'
                                : a.criticality === 'low'
                                  ? 'Baja'
                                  : a.criticality}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay alergias registradas para este paciente.</p>
              )}
            </div>
          )}

          {activeSection === 'insurance' && insurance && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Detalles del seguro</h2>
              <MedicalDataGrid
                items={[
                  { label: 'Aseguradora', value: insurance.payor?.[0]?.display },
                  { label: 'Número de póliza', value: (insurance as any).policyNumber },
                  {
                    label: 'Relación con el asegurado',
                    value: insurance.relationship?.coding?.[0]?.display,
                  },
                  { label: 'Vigencia desde', value: insurance.period?.start, format: 'date' },
                  { label: 'Vigencia hasta', value: insurance.period?.end, format: 'date' },
                  { label: 'Orden', value: insurance.order != null ? String(insurance.order) : null },
                ]}
              />
            </div>
          )}

          {activeSection !== 'profile' && activeSection !== 'allergies' && activeSection !== 'insurance' && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                <span className="text-lg font-bold text-gray-300">*</span>
              </div>
              <p className="text-sm font-medium">Módulo en desarrollo</p>
              <p className="text-xs mt-1">{SECTION_LABELS[activeSection] || activeSection}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
