'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MedplumClient } from '@aion/vendor-medplum';
import { getDataType, getPathDisplayName } from '@aion/vendor-medplum';
import type { ExtendedInternalSchemaElement } from '@aion/vendor-medplum';
import type { Patient } from '@aion/vendor-medplum';
import { Card, CardContent, CardHeader, CardTitle } from '@aion/ui';
import { Button } from '@aion/ui';
import { Input } from '@aion/ui';
import { Select } from '@aion/ui';
import { Spinner } from '@aion/ui';

interface ClinicalGroup {
  id: string;
  title: string;
  description: string;
  fields: string[];
}

const CLINICAL_GROUPS: ClinicalGroup[] = [
  {
    id: 'personal',
    title: 'Datos personales',
    description: 'Información básica de identificación del paciente',
    fields: ['name', 'birthDate', 'gender'],
  },
  {
    id: 'contact',
    title: 'Contacto',
    description: 'Medios de contacto del paciente',
    fields: ['telecom', 'address'],
  },
  {
    id: 'clinical',
    title: 'Información clínica',
    description: 'Datos relevantes para la atención médica',
    fields: ['generalPractitioner', 'maritalStatus'],
  },
  {
    id: 'admin',
    title: 'Información administrativa',
    description: 'Datos de gestión del paciente en el sistema',
    fields: ['identifier', 'active'],
  },
];

interface Props {
  medplum: MedplumClient;
  defaultValue?: Patient;
  onSave: (patient: Patient) => Promise<void>;
  onDelete?: () => Promise<void>;
  mode: 'create' | 'edit';
}

export default function ClinicalPatientForm({ medplum, defaultValue, onSave, onDelete, mode }: Props) {
  const [patient, setPatient] = useState<Patient>(defaultValue ?? { resourceType: 'Patient', active: true });
  const [schemaReady, setSchemaReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let cancelled = false;
    medplum.requestSchema('Patient').then(() => {
      if (!cancelled) setSchemaReady(true);
    });
    return () => { cancelled = true; };
  }, [medplum]);

  const elements = useMemo(() => {
    if (!schemaReady) return {} as Record<string, ExtendedInternalSchemaElement>;
    const schema = getDataType('Patient');
    return (schema?.elements ?? {}) as Record<string, ExtendedInternalSchemaElement>;
  }, [schemaReady]);

  const fieldElement = useCallback(
    (key: string): ExtendedInternalSchemaElement | undefined => elements[key],
    [elements]
  );

  function updateField(key: string, value: any) {
    setPatient((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(patient);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (!schemaReady) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      {CLINICAL_GROUPS.map((group) => {
        const groupElements = group.fields.filter((f) => fieldElement(f));
        if (groupElements.length === 0) return null;

        return (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="text-base">{group.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupElements.map((key) => {
                const el = fieldElement(key);
                if (!el) return null;
                const label = getPathDisplayName(key);
                const required = (el.min ?? 0) > 0;
                const currentValue = (patient as any)[key];
                const fhirType = el.type?.[0]?.code ?? 'string';

                return (
                  <div key={key}>
                    <label className="text-sm font-medium block mb-1.5">
                      {label}
                      {required && <span className="text-destructive ml-0.5">*</span>}
                    </label>
                    <FhirFieldInput
                      fhirType={fhirType}
                      fieldName={key}
                      value={currentValue}
                      onChange={(v) => updateField(key, v)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : mode === 'create' ? 'Crear paciente' : 'Guardar cambios'}
        </Button>
        {mode === 'edit' && onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Eliminar paciente
          </Button>
        )}
      </div>
    </form>
  );
}

function FhirFieldInput({
  fhirType,
  fieldName,
  value,
  onChange,
}: {
  fhirType: string;
  fieldName: string;
  value: any;
  onChange: (v: any) => void;
}) {
  switch (fhirType) {
    case 'HumanName':
      return <HumanNameInputLocal value={value} onChange={onChange} />;
    case 'date':
      return (
        <Input
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      );
    case 'code': {
      const opts =
        fieldName === 'gender'
          ? [
              { value: '', label: 'Seleccionar...' },
              { value: 'male', label: 'Masculino' },
              { value: 'female', label: 'Femenino' },
              { value: 'other', label: 'Otro' },
              { value: 'unknown', label: 'Desconocido' },
            ]
          : [{ value: '', label: 'Seleccionar...' }];
      return (
        <Select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
        >
          {opts.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      );
    }
    case 'boolean':
      return (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Input
            type="checkbox"
            className="h-4 w-4 rounded"
            checked={value !== false}
            onChange={(e) => onChange(e.target.checked)}
          />
          Paciente activo en el sistema
        </label>
      );
    case 'ContactPoint':
      return <ContactPointInput value={value} onChange={onChange} />;
    case 'Address':
      return <AddressInputLocal value={value} onChange={onChange} />;
    case 'Identifier':
      return (
        <Input
          value={value?.[0]?.value ?? ''}
          onChange={(e) => {
            const arr = value ? [...value] : [];
            const v = e.target.value;
            if (v) {
              arr[0] = {
                use: 'usual',
                type: {
                  coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR', display: 'Medical record number' }],
                },
                value: v,
              };
            } else {
              arr.splice(0, arr.length);
            }
            onChange(arr.length > 0 ? arr : undefined);
          }}
          placeholder="N° de expediente (opcional)"
        />
      );
    case 'Reference':
      return (
        <Input
          value={value?.[0]?.display ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v ? [{ display: v }] : undefined);
          }}
          placeholder="Nombre del médico de cabecera"
        />
      );
    case 'CodeableConcept':
      return (
        <Input
          value={value?.text ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v ? { text: v } : undefined);
          }}
          placeholder="Ingrese descripción"
        />
      );
    default:
      return (
        <Input
          value={typeof value === 'object' ? '' : (value ?? '')}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      );
  }
}

function HumanNameInputLocal({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const name = value?.[0] ?? {};
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-muted-foreground">Nombres</label>
        <Input
          className="mt-1"
          value={name.given?.[0] ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange([{ ...name, use: 'official', given: v ? [v] : undefined }]);
          }}
          placeholder="Ej: Juan"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Apellidos</label>
        <Input
          className="mt-1"
          value={name.family ?? ''}
          onChange={(e) => {
            onChange([{ ...name, use: 'official', family: e.target.value || undefined }]);
          }}
          placeholder="Ej: Pérez"
        />
      </div>
    </div>
  );
}

function ContactPointInput({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const items: any[] = value ?? [];

  function updateSystem(system: string, newValue: string) {
    const filtered = items.filter((i: any) => i.system !== system);
    if (newValue) {
      filtered.push({ system, value: newValue, use: system === 'phone' ? 'mobile' : undefined });
    }
    onChange(filtered.length > 0 ? filtered : undefined);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-muted-foreground">Teléfono</label>
        <Input
          type="tel"
          className="mt-1"
          value={items.find((i) => i.system === 'phone')?.value ?? ''}
          onChange={(e) => updateSystem('phone', e.target.value)}
          placeholder="Ej: +52 555 123 4567"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Email</label>
        <Input
          type="email"
          className="mt-1"
          value={items.find((i) => i.system === 'email')?.value ?? ''}
          onChange={(e) => updateSystem('email', e.target.value)}
          placeholder="Ej: juan@correo.com"
        />
      </div>
    </div>
  );
}

function AddressInputLocal({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const addr = value?.[0] ?? {};
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Calle y número</label>
        <Input
          className="mt-1"
          value={addr.line?.[0] ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange([{ ...addr, use: 'home', line: v ? [v] : undefined }]);
          }}
          placeholder="Calle y número"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Ciudad</label>
          <Input
            className="mt-1"
            value={addr.city ?? ''}
            onChange={(e) => onChange([{ ...addr, city: e.target.value || undefined }])}
            placeholder="Ciudad"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Estado</label>
          <Input
            className="mt-1"
            value={addr.state ?? ''}
            onChange={(e) => onChange([{ ...addr, state: e.target.value || undefined }])}
            placeholder="Estado"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">CP</label>
          <Input
            className="mt-1"
            value={addr.postalCode ?? ''}
            onChange={(e) => onChange([{ ...addr, postalCode: e.target.value || undefined }])}
            placeholder="CP"
          />
        </div>
      </div>
    </div>
  );
}
