# AUDITORÍA COMPLETA DE AION — MVP FUNCIONAL

**Fecha:** 2026-07-19
**Apps auditadas:** doctor-dashboard (:3002), patient-portal (:3003), admin-panel (:3001)
**Packages auditados:** auth, domain, medplum-client, fhir, ui, vendor-medplum
**Archivos examinados:** ~140+
**Tests existentes:** 0 (cero)

---

## 1. RESUMEN EJECUTIVO

Aion tiene una arquitectura sólida (monorepo con 3 apps, 6 packages, Medplum FHIR backend) pero arrastra **deuda técnica significativa** típica de un MVP construido rápido:

- **37 hallazgos de código hardcodeado** (usuarios mock, configs, URLs, fechas)
- **5 instancias de código muerto** (funciones vacías, handlers sin conectar, sort que no ordena)
- **6 duplicaciones críticas entre packages** (ServerFhirClient duplicado, 3 copias de getMedplumBaseUrl)
- **0 tests** — ningún test unitario, de integración, o E2E
- **3 apps en distintos estados de madurez**: doctor-dashboard es la más avanzada, patient-portal está casi vacía, admin-panel tiene módulos mixtos

### Fortalezas

- Doctor-dashboard tiene integración Medplum real en pacientes, citas, agenda, encuentros, dashboard, perfil
- Uso correcto de `searchResources`, `createResource`, `updateResource`, `deleteResource` con FHIR
- Client-side y server-side auth checks (cookies + hooks)
- Package `@aion/vendor-medplum` aísla la dependencia de Medplum (buena práctica)
- Sistema de roles funcionando (doctor, receptionist, nurse, patient, admin)

### Debilidades Críticas

| Área | Problema |
|------|----------|
| **Finanzas** (ambas apps) | 100% datos mock, 0 integración Medplum |
| **Patient Portal** | Dashboard con placeholders estáticos, sin datos reales |
| **Admin Panel** | Dashboard charts mockeados, revenue hardcodeado a $0 |
| **Packages duplicados** | `@aion/fhir` y `@aion/medplum-client` compiten — ServerFhirClient duplicado |
| **Tests** | No existe ni un solo test |
| **Settings** | Almacenado en localStorage, no en Medplum |
| **Onboarding** | API `/api/onboarding/save` no implementada (solo se llama) |

---

## 2. CÓDIGO HARDCODEADO IDENTIFICADO

### 2.1 Datos de Usuario

| Archivo | Línea | Código | Severidad |
|---------|-------|--------|-----------|
| `doctor-dashboard/app/finance/hooks/useFinanceData.ts` | 7-42 | `MOCK_TRANSACTIONS` — 22 transacciones con nombres reales (María García, Dr. Anthony Davila), fechas y montos | **P0** |
| `admin-panel/app/finance/hooks/useFinanceData.ts` | 7-42 | Idéntico — `MOCK_TRANSACTIONS` duplicado con datos inventados | **P0** |
| `doctor-dashboard/lib/onboarding/store.ts` | — | `saveToBackend()` POSTea a `/api/onboarding/save` que **no existe** | **P0** |
| `doctor-dashboard/app/dashboard/DashboardLayout.tsx` | 126 | Role check `['doctor', 'receptionist', 'nurse']` hardcodeado | P1 |
| `doctor-dashboard/middleware.ts` | 7-15 | Route→role mapping hardcodeado | P1 |
| `doctor-dashboard/app/page.tsx` | 36 | Role strings `'doctor'`, `'receptionist'`, `'nurse'` | P1 |
| `doctor-dashboard/app/login/page.tsx` | 14 | `allowedRoles={['doctor', 'receptionist', 'nurse']}` | P1 |
| `doctor-dashboard/app/dashboard/page.tsx` | — | `import { DashboardLayout } ...` — duplicado en 7 layouts | P2 |
| `patient-portal/app/page.tsx` | 24 | `user.roles.includes('patient')` | P1 |
| `patient-portal/app/login/page.tsx` | 12 | `allowedRoles={['patient']}` | P1 |

### 2.2 Configuraciones y Centro Médico

| Archivo | Línea | Código | Severidad |
|---------|-------|--------|-----------|
| `doctor-dashboard/app/settings/settings-view.tsx` | 43-66 | `DEFAULTS`: duración 30min, hora 8-19, días Lun-Vie, timezone `America/Mexico_City`, `30min` recordatorio | **P0** |
| `doctor-dashboard/app/calendar/week-grid.tsx` | 9-15 | `START_HOUR=8`, `END_HOUR=19`, `SLOT_HEIGHT=48` | P1 |
| `doctor-dashboard/components/calendar/CurrentTimeIndicator.tsx` | 5-6 | `START_HOUR=8`, `END_HOUR=19` | P1 |
| `doctor-dashboard/lib/calendar/preferences.ts` | 18 | Default `timeRange: { start: 8, end: 19 }` | P1 |
| `doctor-dashboard/app/calendar/create-appointment-dialog.tsx` | 32 | Default duration `30` minutos | P1 |
| `doctor-dashboard/components/appointment/ClinicalAppointmentForm.tsx` | 46 | Default `duration = 30` | P1 |
| `doctor-dashboard/app/calendar/calendar-view.tsx` | 39 | Default prefill time `hour: 9, minute: 0` | P2 |
| `doctor-dashboard/components/patient/ClinicalPatientForm.tsx` | 21-46 | `CLINICAL_GROUPS` hardcodeados | P2 |
| `doctor-dashboard/components/onboarding/PlanSelector.tsx` | 6-33 | 2 planes hardcodeados (Basic $0, Premium $299/mes) | P2 |
| `doctor-dashboard/app/onboarding/preview/page.tsx` | 70 | Plan label `'Básico'` hardcodeado | P2 |
| `doctor-dashboard/app/dashboard/page.tsx` | 28,32,36,38 | Stat card changes (8.2, 3.5, -2.1) hardcodeados | P2 |
| `admin-panel/app/dashboard/components/AdminCharts.tsx` | 49-50 | Fallback values 45, 320 hardcodeados | P2 |

### 2.3 URLs y Puertos

| Archivo | Línea | Código | Severidad |
|---------|-------|--------|-----------|
| `packages/ui/src/login-page.tsx` | 24-28 | `PORTAL_URLS`: doctor/receptionist/nurse → `localhost:3002`, patient → `localhost:3000`, admin → `localhost:3001` | **P0** |
| `packages/auth/src/auth-service.ts` | 53,55 | Fallback `'http://localhost:8103/'` | P1 |
| `packages/medplum-client/src/config.ts` | 3,5 | Fallback `'http://localhost:8103/'` | P1 |
| `packages/fhir/src/server.ts` | 4 | Fallback `'http://localhost:8103/'` | P1 |
| `doctor-dashboard/next.config.ts` | — | Tunnel URL hardcodeada `pleasant-refused-towers-sullivan.trycloudflare.com` | P2 |
| `doctor-dashboard/.env.local` | — | Configuración SMTP comentada | P2 |
| `patient-portal/.env.local` | — | `NEXT_PUBLIC_APP_URL=http://localhost:3003` | P2 |

### 2.4 Código Mock en Producción

| Archivo | Línea | Código | Severidad |
|---------|-------|--------|-----------|
| `admin-panel/app/dashboard/page.tsx` | 10-18 | `CHART_DATA` — 7 días de datos mock de gráficos | **P0** |
| `admin-panel/app/dashboard/page.tsx` | 48 | Revenue stat `'$0.00'` hardcodeado | **P0** |
| `admin-panel/app/dashboard/components/AdminAlerts.tsx` | 14-33 | `MOCK_ALERTS` — 3 alertas completamente mock | **P0** |
| `admin-panel/hooks/useAdminStats.ts` | 41-42 | `receptionists: 0, nurses: 0` | P1 |
| `admin-panel/hooks/useAdminStats.ts` | 53 | `revenue: { total: 0, monthly: 0, growth: 0 }` | **P0** |
| `patient-portal/app/dashboard/page.tsx` | — | Dashboard completo con placeholders ("No hay citas próximas", etc.) | **P0** |
| `doctor-dashboard/app/finance/page.tsx` | 88 | `previousPayments={150.00}` | P1 |
| `admin-panel/app/finance/page.tsx` | 95 | `previousPayments={150.00}` | P1 |
| `doctor-dashboard/app/finance/hooks/useFinanceData.ts` | 54 | Simulated 400ms delay | P1 |

---

## 3. INTEGRACIÓN CON MEDPLUM

### 3.1 Uso del Cliente Medplum por App

| App | searchResources | createResource | updateResource | deleteResource | readResource | getProfile |
|-----|:---:|:---:|:---:|:---:|:---:|:---:|
| **Doctor Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Patient Portal** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (solo auth) |
| **Admin Panel** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3.2 Recursos FHIR Utilizados

| Recurso | Doctor Dashboard | Patient Portal | Admin Panel |
|---------|:----------------:|:--------------:|:-----------:|
| `Patient` | search, read, create, update, delete | ❌ | search (users) |
| `Appointment` | search, create, update (status) | ❌ | search (stats) |
| `Encounter` | search, read | ❌ | ❌ |
| `Practitioner` | read | ❌ | search (users) |
| `Organization` | ❌ | ❌ | search |
| `AllergyIntolerance` | search | ❌ | ❌ |
| `Coverage` | search | ❌ | ❌ |

### 3.3 Problemas de Integración

| # | Problema | App | Impacto |
|---|----------|-----|---------|
| 1 | `useFinanceData` obtiene `client` de `useAuth()` pero **nunca lo usa** — todo es mock | Ambas | **Crítico** |
| 2 | Patient Portal no hace **ninguna** llamada FHIR — es un cascarón | patient-portal | **Crítico** |
| 3 | Admin Panel: revenue stats hardcodeados a $0, sin `PaymentNotic` o `Invoice` | admin-panel | **Crítico** |
| 4 | `useAdminStats` solo cuenta `_count:100` — sin paginación | admin-panel | Medio |
| 5 | `users/page.tsx` sin paginación (`_count:200`) | admin-panel | Medio |
| 6 | Settings guardado en localStorage, no en Medplum `Practitioner` | doctor-dashboard | Alto |

### 3.4 AccessPolicy y ProjectMembership

| Archivo | Hallazgo |
|---------|----------|
| Todos los middlewares | Usan cookies (`aion_auth`, `aion_role`) para autorización, no `ProjectMembership` de Medplum |
| `packages/auth/src/utils.ts` | Mapeo hardcodeado `Practitioner→doctor`, `Patient→patient` |
| `packages/auth/src/utils.ts` | Tag system `'http://aion.app/roles'` hardcodeado |

---

## 4. CÓDIGO MUERTO, DUPLICADO Y NO UTILIZADO

### 4.1 Archivos/Packages Duplicados

| Archivo 1 | Archivo 2 | Problema | Acción |
|-----------|-----------|----------|--------|
| `packages/medplum-client/src/server.ts` | `packages/fhir/src/server.ts` | ServerFhirClient **duplicado** (~40 líneas c/u) | Eliminar uno |
| `packages/auth/src/auth-service.ts` (getMedplumBaseUrl) | `packages/medplum-client/src/config.ts` (MEDPLUM_BASE_URL) | Misma lógica 2 veces | Unificar |
| `packages/fhir/src/server.ts` (getBaseUrl inline) | Misma lógica | 3ra copia | Usar shared |
| `packages/auth/src/utils.ts` (private `extractProfileName`) | `packages/domain/src/fhir.ts` (`extractProfileName` exportada) | Función idéntica duplicada | Importar desde domain |
| `packages/auth/src/auth-provider.tsx` (getAccessToken) | `packages/medplum-client/src/session.ts` (getAccessToken) | Misma lógica de fallback a localStorage | Unificar |
| `packages/fhir/src/appointments.ts` (getAppointments) | Mismo archivo (getUpcomingAppointments) | Loop de parsing duplicado (~25 líneas) | Extraer helper |

### 4.2 Código Muerto (Dead Code)

| Archivo | Línea | Problema |
|---------|-------|----------|
| `admin-panel/app/finance/page.tsx` | 61 | `handleFilterTypeChange` es arrow function **vacía** — los filtros Income/Expenses no funcionan |
| `admin-panel/app/finance/page.tsx` | 96 | `FinanceFAB` recibe `onNewIncome={() => {}}` y `onNewExpense={() => {}}` — botones no hacen nada |
| `admin-panel/app/finance/page.tsx` | 95 | `FinanceFooter` sin `onApproveAll` — botón "Aprobar todo" no hace nada |
| `admin-panel/app/finance/components/FinanceTable.tsx` | 29-32 | `handleSort` actualiza estado de sort pero **nunca ordena** los datos |
| `admin-panel/app/finance/components/FinanceTable.tsx` | 117-123 | `onAction` nunca se pasa desde parent — acciones del menú no hacen nada |
| `admin-panel/app/finance/page.tsx` | 51-58 | `handleTabChange` tiene if-else con código **idéntico** en ambas ramas |
| `admin-panel/app/finance/hooks/useFinanceData.ts` | 45 | `const { client } = useAuth()` — client obtenido pero **nunca usado** |
| `admin-panel/app/users/components/UserTable.tsx` | 121-124 | Botón `MoreVertical` sin `onClick` — decorativo |
| `admin-panel/hooks/useAdminStats.ts` | 29 | Tipos `'payment_received'`, `'user_updated'` definidos pero nunca emitidos |
| `doctor-dashboard/app/finance/hooks/useFinanceData.ts` | 45 | Mismo problema — `client` obtenido, nunca usado |
| `doctor-dashboard/components/onboarding/OtpVerification.tsx` | — | Componente existente pero onboarding ya no usa WhatsApp OTP |
| `packages/auth/src/utils.ts` | 39-52 | `extractProfileName` privada — duplicado de `domain/src/fhir.ts` |

### 4.3 Imports No Utilizados

| Archivo | Import |
|---------|--------|
| `doctor-dashboard/lib/onboarding/api.ts` | `sendOtpCode`, `verifyOtpCode` — deprecated, throw errors |
| `admin-panel/app/dashboard/page.tsx` | `Users`, `Building2`, `Calendar`, `DollarSign` de `lucide-react` |
| Varios | `Coverage`, `CarePlan`, `DocumentReference`, `Location`, `Schedule`, `Slot` en vendor-medplum — exportados pero no importados |

---

## 5. PROBLEMAS DE SEGURIDAD

| # | Archivo | Problema | Severidad |
|---|---------|----------|-----------|
| 1 | `doctor-dashboard/lib/onboarding/api.ts` | `geocodeAddress()` llama a Nominatim (OpenStreetMap) **sin API key** — público, sin rate limit | Medio |
| 2 | Todos los `.env.local` | URLs de Medplum en texto plano (localhost:8103) — exposición interna | Bajo |
| 3 | `packages/medplum-client/src/cache.ts` | Estado mutable compartido (`Map` singleton) — posible fuga de datos entre sesiones | Medio |
| 4 | `doctor-dashboard/app/finance/hooks/useFinanceData.ts` | `client` de `useAuth()` nunca se usa — el dato mock podría confundirse con real | Bajo |
| 5 | Admin-panel: ruta `/finance` **no protegida** en middleware.ts | Falta en `ROUTE_ROLES` — solo depende del guard client-side | Medio |

---

## 6. DEUDA TÉCNICA POR PRIORIDAD

### P0 — Crítica (Debe arreglarse antes del próximo deploy)

| # | Archivo | Problema | Solución |
|---|---------|----------|----------|
| 1 | `packages/ui/src/login-page.tsx:24-28` | `PORTAL_URLS` hardcodeados a localhost | Usar variables de entorno, no defaults |
| 2 | `admin-panel/app/dashboard/page.tsx:10-18` | `CHART_DATA` mock — gráficos irreales | Conectar a `useAdminStats` real |
| 3 | `admin-panel/app/dashboard/components/AdminAlerts.tsx:14-33` | Alertas completamente mock | Remover o conectar a FHIR |
| 4 | `admin-panel/hooks/useAdminStats.ts:53` | Revenue hardcodeado a $0 | Buscar `PaymentNotice`/`Invoice` en FHIR |
| 5 | `patient-portal/app/dashboard/page.tsx` | Dashboard con placeholders estáticos | Implementar FHIR queries |
| 6 | `doctor-dashboard/app/finance/hooks/useFinanceData.ts` + admin-panel | Finanzas 100% mock | Implementar con PaymentNotice/Invoice FHIR |
| 7 | `doctor-dashboard/lib/onboarding/store.ts` | POST a `/api/onboarding/save` que no existe | Implementar endpoint o remover |
| 8 | **NO HAY TESTS** | 0 tests en todo el proyecto | Agregar al menos 1 test por módulo |

### P1 — Alta Prioridad (Sprint 1-2)

| # | Archivo | Problema | Solución |
|---|---------|----------|----------|
| 1 | `packages/medplum-client/src/server.ts` vs `packages/fhir/src/server.ts` | ServerFhirClient duplicado | Eliminar uno, reexportar |
| 2 | `admin-panel/app/finance/page.tsx` | 4 handlers vacíos/dead code | Implementar o remover |
| 3 | `admin-panel/middleware.ts` | `/finance` no protegido | Agregar a `ROUTE_ROLES` |
| 4 | `doctor-dashboard/app/settings/settings-view.tsx` | Settings en localStorage | Migrar a Medplum `Practitioner` |
| 5 | `doctor-dashboard/app/calendar/week-grid.tsx` y `CurrentTimeIndicator.tsx` | START_HOUR/END_HOUR hardcodeados 8-19 | Leer de settings reales |
| 6 | `doctor-dashboard/lib/onboarding/store.ts` | `saveToBackend()` sin endpoint | Implementar o eliminar |
| 7 | `packages/auth/src/utils.ts` + `packages/domain/src/fhir.ts` | extractProfileName duplicado | Unificar |

### P2 — Media Prioridad (Sprint 3-4)

| # | Archivo | Problema | Solución |
|---|---------|----------|----------|
| 1 | `packages/auth/src/auth-service.ts` + `packages/medplum-client/src/config.ts` | getMedplumBaseUrl triplicado | Mover a un solo lugar |
| 2 | `packages/medplum-client/src/session.ts` + `auth-provider.tsx` | getAccessToken duplicado | Unificar |
| 3 | `doctor-dashboard/app/dashboard/DashboardLayout.tsx` | inline SVG icons — 10 nav items hardcodeados | Mover a constante |
| 4 | `admin-panel/hooks/useAdminStats.ts` | `_count: 100` sin paginación | Agregar paginación |
| 5 | `admin-panel/app/users/page.tsx` | `_count: 200` sin paginación | Agregar paginación |
| 6 | `packages/fhir/src/appointments.ts` | Loop de parsing duplicado | Extraer helper |
| 7 | `packages/fhir/src/encounters.ts` | getEncounters/getRecentEncounters casi idénticos | Simplificar |

---

## 7. ESTADO DE FUNCIONALIDADES POR APP

| Funcionalidad | Doctor Dashboard | Patient Portal | Admin Panel |
|---------------|:----------------:|:--------------:|:-----------:|
| **Login/Auth** | ✅ Medplum | ✅ Medplum | ✅ Medplum |
| **Dashboard** | ✅ Datos reales FHIR | ⚠️ Placeholders | ⚠️ Charts mock, revenue $0 |
| **Pacientes (lista)** | ✅ FHIR search | ❌ | ✅ FHIR search |
| **Paciente (detalle)** | ✅ FHIR read | ❌ | ❌ |
| **Crear paciente** | ✅ FHIR create | ❌ | ❌ |
| **Citas (lista)** | ✅ FHIR search | ❌ | ❌ |
| **Crear cita** | ✅ FHIR create | ❌ | ❌ |
| **Agenda/Calendario** | ✅ FHIR search | ❌ | ❌ |
| **Encuentros** | ✅ FHIR search/read | ❌ | ❌ |
| **Perfil** | ✅ FHIR getProfile | ❌ | ❌ |
| **Settings** | ⚠️ localStorage | ❌ | ❌ |
| **Onboarding** | ✅ (con email verify) | ❌ | ❌ |
| **Finanzas** | ❌ 100% mock | ❌ | ❌ 100% mock |
| **Usuarios (admin)** | ❌ | ❌ | ✅ FHIR search |
| **Organizaciones (admin)** | ❌ | ❌ | ✅ FHIR search |

**Leyenda:**
- ✅ = Funcional con Medplum (datos reales)
- ⚠️ = Parcial (datos mock/hardcodeados)
- ❌ = No implementado

---

## 8. MÉTRICAS DEL CÓDIGO

| Métrica | Valor |
|---------|-------|
| Archivos fuente | ~140 |
| Packages | 6 (`auth`, `domain`, `medplum-client`, `fhir`, `ui`, `vendor-medplum`) |
| Apps | 3 (doctor-dashboard, patient-portal, admin-panel) |
| Tests | **0** |
| Dependencias externas | Medplum 5.1.15, Next.js 16.2.7, React 19.2.4, Tailwind v4, Radix UI |
| Instancias de código hardcodeado | 37+ |
| Funciones muertas/vacías | 7 |
| Duplicaciones entre packages | 6 |
| Cobertura de tests | 0% |

---

## 9. PLAN DE ACCIÓN RECOMENDADO

### Sprint 1: Estabilización
1. Eliminar duplicación `ServerFhirClient` (unificar `@aion/medplum-client` y `@aion/fhir`)
2. Reemplazar `PORTAL_URLS` hardcodeados con variables de entorno
3. Conectar dashboard admin-panel a datos reales (charts, alerts, revenue)
4. Implementar dashboard de patient-portal con FHIR queries
5. Proteger ruta `/finance` en middleware de admin-panel

### Sprint 2: Finanzas y Settings
6. Implementar `FinanceData` con `PaymentNotice`/`Invoice` FHIR
7. Migrar Settings de localStorage a Medplum `Practitioner`
8. Implementar endpoint `/api/onboarding/save` o eliminar el store
9. Implementar `getAccessToken` unificado

### Sprint 3: Limpieza y Tests
10. Eliminar código muerto en Finanzas (handlers vacíos, sort, FAB)
11. Eliminar imports no utilizados
12. Agregar tests unitarios (vitest) para packages core
13. Agregar tests E2E (Playwright) para login y flujos principales
14. Unificar `extractProfileName` y `getMedplumBaseUrl`

### Sprint 4: Mejora Continua
15. Paginación en listas de admin-panel (users, organizations)
16. Implementar `AccessPolicy` y `ProjectMembership` de Medplum (reemplazar cookies)
17. Agregar monitoreo y logging
18. Revisar seguridad de Nominatim API key

---

## 10. SCRIPTS DE LIMPIEZA

### Limpieza de código muerto en Finanzas (ambas apps)

```bash
# Archivos a eliminar/refactorizar:
# 1. Eliminar MOCK_TRANSACTIONS de ambos useFinanceData.ts
# 2. Conectar a PaymentNotice FHIR

# Eliminar imports no usados en admin-panel/dashboard/page.tsx
# Reemplazar con datos reales de useAdminStats
```

### Unificación de packages duplicados

```bash
# ServerFhirClient: mantener en @aion/medplum-client, eliminar de @aion/fhir
# Luego reexportar desde @aion/fhir hacia @aion/medplum-client

# getMedplumBaseUrl: mover a @aion/domain (sin dependencias)
# extractProfileName: eliminar de auth/utils, importar desde domain
```
