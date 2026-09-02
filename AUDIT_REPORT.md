# AUDIT REPORT — AION Platform Architecture

**Fecha:** 2026-06-10
**Auditoría:** Arquitectura post-migración
**Objetivo:** Verificar desacoplamiento de Medplum, seguridad, escalabilidad y preparación para producción

---

## Índice

1. [Verificación de dependencias Medplum](#1-verificación-de-dependencias-medplum)
2. [Acoplamiento oculto con Medplum](#2-acoplamiento-oculto-con-medplum)
3. [Sistema de roles](#3-sistema-de-roles)
4. [Seguridad](#4-seguridad)
5. [Código duplicado](#5-código-duplicado)
6. [Componentes para mover a packages](#6-componentes-para-mover-a-packages)
7. [Dependencias innecesarias](#7-dependencias-innecesarias)
8. [Preparación para despliegue](#8-preparación-para-despliegue)
9. [Resumen de riesgos](#9-resumen-de-riesgos)
10. [Recomendaciones para producción](#10-recomendaciones-para-producción)

---

## 1. Verificación de dependencias Medplum

### 1.1 Importaciones directas `@medplum/*` en apps

| App | Importaciones directas | Resultado |
|-----|----------------------|-----------|
| `doctor-dashboard` | 0 | ✅ Limpio |
| `patient-portal` | 0 | ✅ Limpio |
| `admin-panel` | 0 | ✅ Limpio |
| `packages/medplum-client` | 0 | ✅ Limpio |
| `vendor/medplum` | 5 (desde `src/index.ts`) | ✅ Único punto de contacto |

**Único archivo** que importa `@medplum/*` directamente:
- `vendor/medplum/src/index.ts` — exporta `MedplumClient`, `getDataType`, `getPathDisplayName`, tipos `Patient`, `Appointment`

### 1.2 Cadena de dependencia verificada

```
apps/* → @aion/medplum-client → @aion/vendor-medplum → @medplum/core (npm)
                                                      → @medplum/fhirtypes (npm)
apps/* → @aion/domain (zero deps)
apps/* → @aion/ui (solo React + Radix)
```

### 1.3 package.json

| Archivo | `@medplum/*` en dependencies | Resultado |
|---------|------------------------------|-----------|
| `vendor/medplum/package.json` | `@medplum/core` ^5.1.15, `@medplum/fhirtypes` ^5.1.15 | ✅ Aislado |
| `apps/*/package.json` | 0 | ✅ Limpio |
| `packages/*/package.json` | 0 | ✅ Limpio |

**Veredicto:** La capa de abstracción es correcta. Ningún app importa `@medplum/*` directamente.

---

## 2. Acoplamiento oculto con Medplum

Se identificaron **18 hallazgos** de acoplamiento, de los cuales **6 son críticos** porque impedirían cambiar Medplum por otro servidor FHIR sin modificar código de aplicación.

### 🔴 CRÍTICOS

| # | Hallazgo | Archivo | Línea |
|---|----------|---------|-------|
| H1 | **Apps llaman métodos de MedplumClient directamente** (`search()`, `readResource()`, `createResource()`, `updateResource()`, `deleteResource()`) | `apps/doctor-dashboard/app/appointments/page.tsx`, `apps/doctor-dashboard/app/patients/[id]/page.tsx`, `apps/patient-portal/app/appointments/page.tsx`, y +8 archivos | Múltiples |
| H2 | **Apps importan tipos de Medplum** (`MedplumClient`, `Patient`, `Appointment`, `getDataType`, `getPathDisplayName`, `ExtendedInternalSchemaElement`) | `apps/doctor-dashboard/components/patient/ClinicalPatientForm.tsx`, `apps/doctor-dashboard/components/appointment/ClinicalAppointmentForm.tsx`, `apps/doctor-dashboard/app/patients/[id]/page.tsx` | 4-7, 4-5, 8 |
| H3 | **Login usa OAuth específico de Medplum** (`startLogin()`, `processCode()`, scope `openid offline_access`) | `packages/medplum-client/src/client.ts` | 28-34 |
| H4 | **Formulario clínico usa `requestSchema()` y `getDataType()`** — sistema de esquemas de Medplum | `apps/doctor-dashboard/components/patient/ClinicalPatientForm.tsx` | 5, 62, 70-71 |
| H5 | **Formato localStorage `medplum:activeLogin`** — lectura directa del formato interno de Medplum | `packages/medplum-client/src/session.ts` | 7-8 |
| H6 | **Apps acceden a `aion.getProfile()` directamente** — bypass del modelo `User` | `apps/doctor-dashboard/app/dashboard/DashboardLayout.tsx` | 26 |

### 🟡 ALTOS

| # | Hallazgo | Archivo | Línea |
|---|----------|---------|-------|
| H7 | `storagePrefix` por defecto `'medplum:'` en 4 archivos | `packages/medplum-client/src/auth.tsx`, `session.ts`, `apps/*/lib/auth.tsx` | Múltiples |
| H8 | Sesión Medplum: `getProfile()`, `getActiveLogin()`, `getAccessToken()` expuestos en `AionClient` | `packages/medplum-client/src/client.ts` | 43-61 |
| H9 | Nombres infraestructura Terraform con prefijo `medplum-` | `infra/terraform/{azure,gcp}/*.tf` | ~30 archivos |

### 🟠 MEDIOS

| # | Hallazgo | Archivo | Línea |
|---|----------|---------|-------|
| H10 | Ruta FHIR hardcodeada `/fhir/R4/` | `packages/medplum-client/src/server.ts` | 26, 50 |
| H11 | Variables de entorno `MEDPLUM_*` | `.env`, `packages/medplum-client/src/config.ts` | Múltiples |
| H12 | URL default `http://localhost:8103/` (puerto Medplum) | `packages/medplum-client/src/config.ts` | 3, 5 |

### 🔵 BAJOS

| # | Hallazgo | Archivo | Línea |
|---|----------|---------|-------|
| H13 | Hook `useMedplumQuery` — nombre con "Medplum" | `packages/medplum-client/src/use-query.ts` y 4 archivos | Múltiples |

---

## 3. Sistema de roles

### 3.1 Arquitectura actual

```
detectRoles(profile):
  1. FHIR meta.tag system=http://aion.app/roles → array de códigos
  2. resourceType mapping (Practitioner→doctor, Patient→patient)
  3. qualification codes (MD/DO→doctor, RN→nurse)
  4. Fallback → ['patient']
```

**5 roles hardcodeados:** `admin`, `doctor`, `receptionist`, `nurse`, `patient`

### 3.2 Hallazgos

| # | Hallazgo | Severidad | Detalle |
|---|----------|-----------|---------|
| R1 | **Roles 100% client-side** | 🔴 Crítico | No hay validación server-side de roles. Un usuario puede manipular JS para cambiar su rol. |
| R2 | **No soporta IdP externo** | 🟡 Alto | No lee claims OIDC, grupos LDAP, ni atributos SAML. Solo funciona con FHIR. |
| R3 | **Fallback inseguro a `['patient']`** | 🟡 Alto | Un `resourceType` desconocido otorga acceso paciente automáticamente. |
| R4 | **Sin validación runtime de roles** | 🟡 Alto | Solo TypeScript compile-time; roles inválidos no son rechazados. |
| R5 | **Sin soporte MFA/2FA** | 🟡 Alto | No hay segundo factor de autenticación. |
| R6 | **receptionist y nurse mapean a `/doctor`** | 🔵 Bajo | Comparten dashboard con doctor, sin filtrar UI por sub-rol. |

---

## 4. Seguridad

### 4.1 🔴 CRÍTICOS

| # | Hallazgo | Archivo | Línea |
|---|----------|---------|-------|
| S1 | **Protección de rutas solo client-side** — sin Next.js middleware | Todos los `DashboardLayout.tsx` | Múltiples |
| S2 | **Admin panel sin guard de autenticación** — `/dashboard` se renderiza sin verificar sesión | `apps/admin-panel/app/dashboard/page.tsx` | Todo el archivo |
| S3 | **API route no valida tokens** — solo verifica existencia, no firma/expiración | `apps/doctor-dashboard/app/api/dashboard/route.ts` | 6-10 |
| S4 | **Sin autorización server-side** — cualquier token válido accede a cualquier endpoint | `apps/doctor-dashboard/app/api/dashboard/route.ts` | 8-10 |
| S5 | **Tokens OAuth en localStorage** — vulnerables a XSS | `packages/medplum-client/src/session.ts` | 7 |
| S6 | **Token en POST body** en vez de `Authorization` header | `apps/doctor-dashboard/app/api/dashboard/route.ts` | 6 |

### 4.2 🟡 ALTOS

| # | Hallazgo | Archivo | Línea |
|---|----------|---------|-------|
| S7 | **Credenciales demo hardcodeadas** `admin@aion.com` / `Aion2024!` | `apps/doctor-dashboard/app/login/page.tsx` | 27-28 |
| S8 | **Sin protección CSRF** en ningún endpoint | Todos los formularios y API | — |
| S9 | **Sin invalidación server-side de sesión al logout** — tokens no revocados | `packages/medplum-client/src/client.ts` | 39-41 |
| S10 | **No hay httpOnly/Secure cookies** | Todo el código | — |
| S11 | **Root pages no redirigen si el rol no corresponde** — spinner infinito | `apps/*/app/page.tsx` | 19-22 |

### 4.3 🟠 MEDIOS

| # | Hallazgo | Archivo | Línea |
|---|----------|---------|-------|
| S12 | Sin rate limiting en API route | `apps/doctor-dashboard/app/api/dashboard/route.ts` | — |
| S13 | Sin auditoría de acceso a API | `apps/doctor-dashboard/app/api/dashboard/route.ts` | — |
| S14 | Nombre de usuario renderizado desde FHIR sin sanitización (XSS potencial) | `apps/patient-portal/app/dashboard/page.tsx:12`, `Sidebar.tsx:75` | Múltiples |

---

## 5. Código duplicado

### 5.1 🔴 Duplicación alta (debería unificarse)

| # | Código duplicado | Ocurrencias | Archivos |
|---|-----------------|-------------|----------|
| D1 | **Login pages** ~90% idénticas | 3 | `apps/*/app/login/page.tsx` |
| D2 | **Selector de roles** (multi-role screen) | 3 | `apps/*/app/login/page.tsx` (líneas 75-105) |
| D3 | **Root pages** ~85% idénticas | 3 | `apps/*/app/page.tsx` |

### 5.2 🟡 Duplicación media (debería importar desde packages)

| # | Código duplicado | Ocurrencias | Archivos |
|---|-----------------|-------------|----------|
| D4 | `formatTime()` — 4x copias idénticas | 4 | `appointments/page.tsx`, `PatientDetail.tsx`, `UpcomingAppointments.tsx`, `SummaryCards.tsx` |
| D5 | `extractName()` — no importan desde `@aion/domain` | 3 | `appointments/page.tsx`, `dashboard.service.ts`, `PatientDetail.tsx` |
| D6 | `patientIdFromRef()` — duplicado local | 2 | `dashboard.service.ts` + `@aion/domain` (canónico) |
| D7 | CSS variables idénticas entre doctor y patient | 2 | `globals.css` de ambos |

### 5.3 🔵 Duplicación baja

| # | Código duplicado | Ocurrencias | Archivos |
|---|-----------------|-------------|----------|
| D8 | `STATUS_STYLES` en domain pero **nunca importado** por apps | 0 imports | `packages/domain/src/constants.ts` |
| D9 | `formatDate()` / `formatDateShort()` | 3 | `PatientDetail.tsx`, `RecentPatients.tsx` |

---

## 6. Componentes para mover a packages

### 6.1 Para `@aion/ui`

| Componente | Ubicación actual | Razón |
|------------|-----------------|-------|
| **LoginPage** (prop-based) | 3 copias en `apps/*/app/login/` | ~150 líneas duplicadas 3x |
| **RoleSelector** | Dentro de cada login page | ~30 líneas JSX idénticas 3x |
| **LoadingSpinner** | ~10+ archivos, inline | Patrón repetido en toda la plataforma |
| **AuthGuard** | En cada DashboardLayout | ~20 líneas de lógica duplicada |
| **ErrorBoundary** | Solo en doctor-dashboard | 2 archivos casi idénticos |

### 6.2 Para `@aion/domain`

| Utilidad | Acción |
|----------|--------|
| `formatTime()` | Agregar (ahora duplicado 4x) |
| `extractName()` | Ya existe — apps deben importarlo |
| `patientIdFromRef()` | Ya existe — apps deben importarlo |
| `STATUS_STYLES` | Actualizar formato o eliminar (nadie lo importa) |

---

## 7. Dependencias innecesarias

| # | Dependencia | Archivo | Problema |
|---|-------------|---------|----------|
| U1 | `prettier` (3.8.3) | Root `package.json` | Sin configuración ni scripts; **no se usa** |
| U2 | `eslint` en admin-panel | `apps/admin-panel/package.json` | Tiene script `lint` pero **no existe eslint.config.*** |
| U3 | `components.json` (shadcn) | `apps/doctor-dashboard/`, `apps/patient-portal/` | Stale — apunta a `@/components/ui` que ya no existe |

---

## 8. Preparación para despliegue

### 8.1 Netlify

| Requisito | Estado |
|-----------|--------|
| `netlify.toml` | ❌ No existe |
| Monorepo config (base, publish, command) | ❌ Sin configurar |
| Build output (`.next/`) | ✅ Estructura correcta |

### 8.2 Vercel

| Requisito | Estado |
|-----------|--------|
| `vercel.json` | ❌ No existe |
| Monorepo project settings | ❌ Sin configurar |
| Next.js config | ⚠️ `next.config.ts` vacío |

### 8.3 Railway

| Requisito | Estado |
|-----------|--------|
| `railway.json` / `nixpacks.toml` | ❌ No existe |
| Dockerfile | ❌ No existe |

### 8.4 Problemas generales

| # | Problema | Severidad | Detalle |
|---|----------|-----------|---------|
| P1 | **URLs `localhost` hardcodeadas** en defaults de 3 login pages | 🔴 Alto | `http://localhost:3000/3001/3002` como fallback |
| P2 | **Node engine restrictivo** `>=22.18.0` | 🔴 Alto | CIs estándar usan Node 20 LTS |
| P3 | **`.next/` no en `.gitignore`** | 🟡 Medio | Build artifacts trackeables |
| P4 | **Admin-panel sin `.env` / `.env.local`** | 🟡 Medio | No hay configuración de entorno |
| P5 | **`NEXT_PUBLIC_DEBUG=development`** en `.env` | 🔵 Bajo | Podría activarse accidentalmente en producción |
| P6 | **`.env` en git** (no en `.gitignore`) | 🔵 Bajo | Debe ser `.env.example` |

---

## 9. Resumen de riesgos

### 🔴 Críticos (9)

| # | Riesgo | Categoría | Impacto |
|---|--------|-----------|---------|
| 1 | Apps llaman métodos MedplumClient directamente (search, createResource, etc.) | Acoplamiento | Bloquea cambio de FHIR provider |
| 2 | Apps importan tipos Medplum (Patient, Appointment, MedplumClient) | Acoplamiento | Bloquea cambio de FHIR provider |
| 3 | Login usa OAuth específico de Medplum (startLogin, processCode) | Acoplamiento | Bloquea cambio de FHIR provider |
| 4 | Formulario usa requestSchema/getDataType de Medplum | Acoplamiento | Bloquea cambio de FHIR provider |
| 5 | localStorage keys con formato interno de Medplum | Acoplamiento | Rotura si cambia Medplum |
| 6 | DashboardLayout accede a getProfile() directamente | Acoplamiento | Bypass del modelo User |
| 7 | Protección de rutas solo client-side, sin middleware | Seguridad | Bypass total de autenticación |
| 8 | API route no valida tokens (solo existencia) | Seguridad | Acceso no autorizado a datos |
| 9 | Tokens en localStorage, vulnerables a XSS | Seguridad | Exfiltración de credenciales |

### 🟡 Altos (14)

| # | Riesgo | Categoría | Impacto |
|---|--------|-----------|---------|
| 10 | Roles 100% client-side, sin validación server-side | Roles/Seguridad | Suplantación de rol |
| 11 | Fallback inseguro a `['patient']` para resourceType desconocido | Roles | Acceso paciente por defecto |
| 12 | No soporta IdP externo (OIDC, LDAP, SAML) | Roles | Sin integración enterprise |
| 13 | Sin MFA/2FA | Seguridad | Autenticación débil |
| 14 | Credenciales demo hardcodeadas en código fuente | Seguridad | Exposición de credenciales |
| 15 | Sin CSRF protection | Seguridad | Ataques de falsificación |
| 16 | Sin invalidación server-side de sesión al logout | Seguridad | Sesiones persistentes |
| 17 | Nombres infraestructura con prefijo "medplum" | Acoplamiento | Confusión de naming |
| 18 | Login pages ~90% duplicadas | Deuda técnica | Mantenimiento costoso |
| 19 | Sin config de deploy (netlify.toml, vercel.json, railway.json) | Deploy | Imposible deploy out-of-the-box |
| 20 | Node engine restrictivo (>=22.18) | Deploy | Falla en CI estándar |
| 21 | URLs localhost hardcodeadas como default | Deploy | Rotura en producción si no se configuran env vars |
| 22 | Admin-panel sin eslint config | Deuda técnica | No puede lintear |
| 23 | Sin Next.js middleware para auth | Seguridad | Protección solo client-side |

### 🟠 Medios (10)

| # | Riesgo | Categoría |
|---|--------|-----------|
| 24 | Ruta FHIR `/fhir/R4/` hardcodeada | Acoplamiento |
| 25 | Variables de entorno `MEDPLUM_*` | Acoplamiento |
| 26 | URL default `localhost:8103` | Acoplamiento |
| 27 | `formatTime()` duplicado 4x | Deuda técnica |
| 28 | `extractName()` duplicado (no importa desde domain) | Deuda técnica |
| 29 | Sin rate limiting en API | Seguridad |
| 30 | Sin auditoría de acceso | Seguridad |
| 31 | Paciente-portal sin loading/error boundaries | UX/Deuda técnica |
| 32 | Admin-panel es esqueleto sin funcionalidad real | Deuda técnica |
| 33 | `.next/` no en `.gitignore` | Deuda técnica |

### 🔵 Bajos (6)

| # | Riesgo | Categoría |
|---|--------|-----------|
| 34 | Hook `useMedplumQuery` con nombre "Medplum" | Acoplamiento (cosmético) |
| 35 | `STATUS_STYLES` en domain pero nunca importado | Deuda técnica |
| 36 | `prettier` en devDeps sin uso | Dependencia innecesaria |
| 37 | `components.json` stale de shadcn | Deuda técnica |
| 38 | receptionist/nurse comparten dashboard con doctor | UX |
| 39 | `.env` en git tracking | Deuda técnica |

---

## 10. Recomendaciones para producción

### Inmediatas (antes de deploy)

1. **Implementar Next.js Middleware** — Agregar `apps/*/middleware.ts` que valide tokens JWT (firma, expiración, issuer) en cada request a rutas protegidas y API routes.

2. **Validar tokens server-side** — En `apps/doctor-dashboard/app/api/dashboard/route.ts`, verificar la firma del JWT usando la clave pública del servidor FHIR antes de procesar la request.

3. **Agregar autorización server-side** — Verificar que el token contenga los roles requeridos para cada endpoint. Nunca confiar en roles declarados por el cliente.

4. **Mover tokens a httpOnly cookies** — Reemplazar `localStorage` por cookies httpOnly, Secure, SameSite=Strict para prevenir exfiltración via XSS.

5. **Eliminar credenciales demo hardcodeadas** — Reemplazar por variable de entorno `NEXT_PUBLIC_DEMO_CREDENTIALS` o un mecanismo que no exponga credenciales en código fuente.

6. **Agregar protección CSRF** — Implementar tokens CSRF o validación de headers `Origin`/`Referer` en todos los endpoints POST.

7. **Configurar deploy** — Crear `netlify.toml`, `vercel.json`, o `railway.json` según la plataforma destino.

8. **Ampliar Node engine** — `>=18.0.0` o al menos `>=20.0.0` para compatibilidad con CI estándar.

### Corto plazo (próximo sprint)

9. **Extraer login pages a componente compartido** en `@aion/ui` con props para branding, redirect roles, y dev prefill.

10. **Centralizar utilidades duplicadas** — Mover `formatTime()`, `extractName()`, `formatDate()` a `@aion/domain` y actualizar imports en apps.

11. **Agregar AuthGuard componente** compartido en `@aion/medplum-client` o `@aion/ui` para eliminar duplicación en DashboardLayouts.

12. **Eliminar `prettier`** de root devDependencies si no se usa, o agregar configuración.

13. **Agregar eslint.config** a admin-panel.

14. **Agregar `.next/` a `.gitignore`**.

### Mediano plazo

15. **Abstract métodos de MedplumClient** detrás de una interfaz propia en `@aion/medplum-client` (ej: `searchResources()`, `getResource()`, `createResource()`) para que las apps nunca llamen `medplum.search()` directamente.

16. **Desacoplar OAuth** — Reemplazar `startLogin()`/`processCode()` por un flow de autenticación genérico que soporte múltiples proveedores (Medplum OAuth, OIDC, API Key).

17. **Reemplazar `requestSchema()`** en `ClinicalPatientForm` con un schema de formulario estático o genérico, eliminando la dependencia del sistema de esquemas de Medplum.

18. **Agregar soporte para IdP externo** — Leer roles desde claims OIDC (ej: `groups`, `roles`) o atributos SAML, además de FHIR meta.tags.

19. **Implementar validación server-side de roles** — Endpoint que verifique que el token JWT contiene los roles requeridos antes de servir datos.

20. **Agregar rate limiting y auditoría** a API routes.

21. **Renombrar `useMedplumQuery`** a `useFhirQuery` o `useAionQuery`.

22. **Refrescar infraestructura Terraform** — Renombrar recursos de `medplum-*` a `aion-*`.

---

## Apéndice: Puntos fuertes de la arquitectura actual

A pesar de los riesgos identificados, la arquitectura tiene fortalezas importantes:

- ✅ **Capa vendor** (`@aion/vendor-medplum`) correctamente implementada como único punto de contacto
- ✅ **0 importaciones directas** de `@medplum/*` en apps
- ✅ **package-lock.json limpio** — sin symlinks rotos
- ✅ **3 apps compilan** exitosamente con Turborepo
- ✅ **AuthProvider compartido** — toda la lógica de auth en `@aion/medplum-client`
- ✅ **Modelo User con roles** tipado y centralizado en `@aion/domain`
- ✅ **Selector de roles** funcional para usuarios multi-rol
- ✅ **Sin dependencias nativas** — despliegue universal
- ✅ **Sin circular dependencies** en el grafo de paquetes
