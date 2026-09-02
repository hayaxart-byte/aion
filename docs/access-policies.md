# Access Policies de Medplum — Aion

## ¿Qué es AccessPolicy?

AccessPolicy es un recurso de Medplum que controla el acceso a nivel de servidor. Se asigna a `ProjectMembership` y restringe qué recursos FHIR puede leer/escribir un usuario.

A diferencia del route guarding client-side (que solo oculta la UI), AccessPolicy **enforces** las reglas en el servidor FHIR: aunque un usuario malicioso modifique el frontend, el servidor rechazará operaciones no autorizadas.

## Políticas Definidas

### Doctor Policy

```json
{
  "resourceType": "AccessPolicy",
  "name": "Doctor Policy",
  "resource": [
    { "resourceType": "Patient", "read": true, "write": true },
    { "resourceType": "Appointment", "read": true, "write": true },
    { "resourceType": "Encounter", "read": true, "write": true },
    { "resourceType": "Practitioner", "read": true, "write": false },
    { "resourceType": "Observation", "read": true, "write": true },
    { "resourceType": "DiagnosticReport", "read": true, "write": true },
    { "resourceType": "MedicationRequest", "read": true, "write": true },
    { "resourceType": "CarePlan", "read": true, "write": true }
  ]
}
```

**Asignado a:** `doctor`, `receptionist`, `nurse`

### Patient Policy

```json
{
  "resourceType": "AccessPolicy",
  "name": "Patient Policy",
  "resource": [
    { "resourceType": "Patient", "read": true, "write": false },
    { "resourceType": "Appointment", "read": true, "write": true },
    { "resourceType": "Encounter", "read": false, "write": false },
    { "resourceType": "Observation", "read": true, "write": false },
    { "resourceType": "DiagnosticReport", "read": true, "write": false },
    { "resourceType": "MedicationRequest", "read": true, "write": false }
  ],
  "compartment": { "usePatientCompartment": true }
}
```

**Nota:** `usePatientCompartment: true` restringe al paciente a ver solo sus propios datos. Sin esto, todos los pacientes compartirían el mismo `AccessPolicy` y verían todos los recursos del proyecto.

**Asignado a:** `patient`

### Admin Policy

```json
{
  "resourceType": "AccessPolicy",
  "name": "Admin Policy",
  "resource": [
    { "resourceType": "Patient", "read": true, "write": true },
    { "resourceType": "Appointment", "read": true, "write": true },
    { "resourceType": "Encounter", "read": true, "write": true },
    { "resourceType": "Practitioner", "read": true, "write": true },
    { "resourceType": "Observation", "read": true, "write": true },
    { "resourceType": "DiagnosticReport", "read": true, "write": true },
    { "resourceType": "MedicationRequest", "read": true, "write": true },
    { "resourceType": "CarePlan", "read": true, "write": true },
    { "resourceType": "Organization", "read": true, "write": true },
    { "resourceType": "ProjectMembership", "read": true, "write": true }
  ]
}
```

**Asignado a:** `admin`

## Cómo aplicar las políticas

### Opción 1: Medplum Admin Console (UI)

1. Abrir Medplum Admin Console → `http://localhost:8103/`
2. Ir a **AccessPolicy** → **Create**
3. Pegar el JSON de la política
4. Ir a **ProjectMembership**
5. Editar el membership del usuario → asignar `accessPolicy`

### Opción 2: API REST

```bash
# Crear AccessPolicy
curl -X POST http://localhost:8103/fhir/R4/AccessPolicy \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @infra/medplum/access-policies.json

# Asignar a un usuario
curl -X PUT http://localhost:8103/fhir/R4/ProjectMembership/$MEMBERSHIP_ID \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "resourceType": "ProjectMembership",
    "user": { "reference": "Practitioner/$PRACTITIONER_ID" },
    "accessPolicy": { "reference": "AccessPolicy/$POLICY_ID" }
  }'
```

### Opción 3: Script de migración

```bash
# 1. Obtener token de admin
# 2. POST AccessPolicy para cada política
# 3. GET ProjectMembership → asociar cada usuario con su política
```

## Integración con el Route Guarding

AccessPolicy y route guarding son complementarios:

| Capa | Mecanismo | Defiende contra |
|------|-----------|-----------------|
| Middleware | Cookie `aion_role` | Navegación directa a URL |
| DashboardLayout | `user.roles` check | Errores de estado React |
| AccessPolicy | Servidor FHIR | Modificaciones maliciosas del frontend |
| LoginPage | `allowedRoles` | Autenticación con rol incorrecto |
