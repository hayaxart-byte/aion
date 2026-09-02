# MIGRATION REPORT — AION Platform

## 1. Architecture Final

```
AION/
├── apps/
│   ├── doctor-dashboard/   → Next.js 16, rol médico (puerto 3002)
│   ├── patient-portal/     → Next.js 16, rol paciente (puerto 3000)
│   └── admin-panel/        → Next.js 16, rol admin (puerto 3001)
│
├── packages/
│   ├── domain/             → @aion/domain (tipos, constantes, utilidades FHIR, User/roles)
│   ├── ui/                 → @aion/ui (Button, Card, Calendar, Dialog, Popover, DropdownMenu)
│   └── medplum-client/     → @aion/medplum-client (AionClient, ServerFhirClient, AuthProvider, cache, hooks)
│
├── vendor/
│   └── medplum/            → @aion/vendor-medplum (thin re-export de @medplum/core + @medplum/fhirtypes)
│
├── infra/
│   ├── postgres/           → Config PostgreSQL local
│   └── terraform/          → Terraform Azure + GCP
│
├── .env                    → Variables de entorno AION (FHIR URL, app URLs, debug)
├── turbo.json              → Build tasks para apps AION
└── package.json            → name: "aion", packageManager: npm@11.6.0, workspaces simplificados
```

### Dependency Graph

```
apps/{doctor-dashboard,patient-portal,admin-panel}
  ├── @aion/ui              → packages/ui
  │     └── react, @radix-ui/*, cva, clsx, tailwind-merge, lucide-react, react-day-picker
  ├── @aion/domain           → packages/domain (zero deps)
  └── @aion/medplum-client   → packages/medplum-client
        ├── @aion/vendor-medplum → vendor/medplum
        │     └── @medplum/core (npm registry) — único punto de contacto con Medplum
        └── React (peer dep)
```

## 2. Dependencies Eliminated

### Local packages (29) — all deleted

| Package | Reason |
|---------|--------|
| `packages/core` | Medplum SDK — ahora es npm dep via vendor/medplum |
| `packages/server` | Medplum FHIR server — se ejecuta externamente |
| `packages/react` | No usado por AION |
| `packages/react-hooks` | No usado por AION |
| `packages/fhirtypes` | Medplum types — ahora npm dep via vendor/medplum |
| `packages/definitions` | No usado por AION |
| `packages/app` | Medplum app (no AION) |
| `packages/agent` | Medplum agent |
| `packages/bot-layer` | No usado |
| `packages/ccda` | No usado |
| `packages/cdk` | No usado |
| `packages/cli` | No usado |
| `packages/create-medplum` | No usado |
| `packages/docs` | No usado |
| `packages/dosespot-core` | No usado |
| `packages/dosespot-react` | No usado |
| `packages/e2e` | No usado |
| `packages/eslint-config` | No usado |
| `packages/examples` | No usado |
| `packages/fhir-router` | No usado |
| `packages/generator` | No usado |
| `packages/graphiql` | No usado |
| `packages/health-gorilla-core` | No usado |
| `packages/health-gorilla-react` | No usado |
| `packages/hl7` | No usado |
| `packages/mock` | No usado |
| `packages/scriptsure-react` | No usado |

### Infrastructure — deleted or moved to infra/

| Directory | Action |
|-----------|--------|
| `postgres/` | Moved to `infra/postgres/` |
| `scripts/` | Deleted (32 Medplum build/deploy scripts legacy) |
| `terraform/` | Moved to `infra/terraform/` |
| `charts/` | Deleted (Medplum Helm charts) |
| `.github/` | Deleted (Medplum CI/CD) |
| `Dockerfile` | Deleted (Medplum Docker) |
| `docker-compose.yml` | Deleted (Medplum compose) |
| `docker-compose.full-stack.yml` | Deleted |

### Root config files — deleted

| File | Reason |
|------|--------|
| `api-extractor.json` | Medplum API docs tooling |
| `biome.json` | Medplum linter config |
| `vitest.config.ts` | Medplum test config |
| `tsdoc.json` | Medplum TSDoc config |
| `eslint.config.mjs` | Medplum ESLint config (root level) |
| `sonar-project.properties` | Medplum SonarCloud |
| `SECURITY.md` | Medplum security policy |
| `NOTICE` | Medplum legal notice |
| `LICENSE.txt` | Medplum license |
| `.prettierignore` | Was Medplum-specific |
| `.gitattributes` | Was Medplum-specific |
| `.dockerignore` | Was Medplum-specific |
| `README.md` | Was Medplum README |

### Dead code in apps — deleted

| File | Reason |
|------|--------|
| `apps/patient-portal/components/ui/*` | Duplicated in `@aion/ui`, zero imports |
| `apps/patient-portal/lib/utils.ts` | `cn()` utility duplicated in `@aion/ui` |
| `apps/doctor-dashboard/lib/medplum-cache.ts` | Replaced by `@aion/medplum-client` cache |
| `apps/doctor-dashboard/lib/use-medplum-query.ts` | Replaced by `@aion/medplum-client` hook |
| `apps/doctor-dashboard/components/doctor/types.ts` | Types moved to `@aion/domain` |

### Root devDependencies — removed

| Package | Reason |
|---------|--------|
| `@babel/core`, `@babel/preset-*` | Medplum build tooling |
| `@jest/globals`, `@jest/types` | Medplum test tooling |
| `@microsoft/api-*` | Medplum API docs |
| `@types/jest` | Medplum test types |
| `babel-jest`, `babel-preset-vite` | Medplum build tooling |
| `cross-env` | Medplum build tooling |
| `esbuild` | Medplum build tooling |
| `formidable` | Medplum dep |
| `identity-obj-proxy` | Medplum test mock |
| `jest`, `jest-*` | Medplum test framework |
| `jsdom` | Medplum test env |
| `npm-check-updates` | Medplum tooling |
| `nyc` | Medplum code coverage |
| `prettier-plugin-organize-imports` | Optional |
| `rimraf` | Medplum build tooling |
| `shx` | Medplum build tooling |
| `sort-package-json` | Medplum tooling |
| `source-map-explorer` | Medplum tooling |
| `tslib` | Medplum build tooling |
| `tsx` | Medplum tooling |
| `typescript` | Moved to root `devDependencies` (needed by apps) |
| `vite` | Medplum build tooling |
| `vitest` | Medplum test framework |
| `vitest-websocket-mock` | Medplum test mock |
| `lucide-react` | Now handled by `@aion/ui` hoisting |
| `react-day-picker` | Now handled by `@aion/ui` hoisting |

## 3. Dependencies Conserved

### Workspace packages (4)

| Package | Location | Purpose |
|---------|----------|---------|
| `@aion/domain` | `packages/domain` | Shared types (User, roles, FHIR utilities), constants |
| `@aion/ui` | `packages/ui` | Design system (7 UI components + cn) |
| `@aion/medplum-client` | `packages/medplum-client` | Medplum wrapper, AuthProvider unificado, cache, query hooks |
| `@aion/vendor-medplum` | `vendor/medplum` | Thin re-export boundary to `@medplum/core` |

### npm dependencies (apps)

| Package | Used By | Purpose |
|---------|---------|---------|
| `next` | All apps | Framework |
| `react`, `react-dom` | All apps | UI library |
| `@medplum/core` | `vendor/medplum` → transitive | Medplum SDK (from npm, no longer local) |
| `@medplum/fhirtypes` | `vendor/medplum` → transitive | FHIR types (from npm, no longer local) |

## 4. Implemented Features

### Unified Authentication Model

- **User type** with `roles[]` array (`admin`, `doctor`, `receptionist`, `nurse`, `patient`)
- **Role detection** from FHIR Practitioner/Patient resourceType and meta tags
- **Single login** per app with unified AuthProvider via `@aion/medplum-client`
- **Role-based routing**: doctor→/doctor, patient→/patient, admin→/admin
- **Role selector UI**: multi-role users see a portal picker after login
- **Role+name display** in doctor sidebar and patient/admin headers

### Architecture

- All auth logic centralized in `packages/medplum-client/src/auth.tsx`
- Each app imports `AuthProvider` and `useAuth` from `@aion/medplum-client`
- `storagePrefix` differentiates sessions: `medplum:` / `medplum:patient:` / `medplum:admin:`

## 5. Build Validation

| App | Status | Details |
|-----|--------|---------|
| `@aion/domain` | ✅ PASS | Zero dependencies, pure TypeScript |
| `@aion/ui` | ✅ PASS | TypeScript checks clean |
| `@aion/medplum-client` | ✅ PASS | With @types/node devDep |
| `@aion/vendor-medplum` | ✅ PASS | @medplum/core resolved from npm (5.1.17) |
| `@aion/doctor-dashboard` | ✅ BUILD OK | 11 routes, 1 API route |
| `@aion/patient-portal` | ✅ BUILD OK | 6 routes |
| `@aion/admin-panel` | ✅ BUILD OK | 4 routes |

### Key Build Fixes

1. **`packageManager` field** added to root `package.json` (required by Turborepo 2.x)
2. **`package-lock.json` regenerated** — stale symlinks `link: packages/core` replaced with npm registry resolution
3. **`@types/node`** added to `@aion/medplum-client` devDependencies

## 6. Risks Encountered

| # | Risk | Status | Mitigation |
|---|------|--------|------------|
| R1 | TypeScript `references` in Medplum tsconfig | ✅ Avoided | All 29 Medplum packages deleted |
| R2 | `@medplum/core` version mismatch after npm switch | ⚠️ Monitored | `^5.1.15` in vendor/medplum resolves to 5.1.17 |
| R3 | Workspace glob `packages/*` no longer matches Medplum | ✅ Resolved | Only 3 @aion packages remain |
| R4 | Dead code kept as orphan files | ✅ Cleaned | All confirmed dead files deleted |
| R5 | Root `overrides` for TypeScript removed | ⚠️ Noted | AION uses TS 5.x (default with Next.js) |
| R6 | Auth token localStorage key hardcoded | ✅ Fixed | `getAccessToken()` accepts `storagePrefix` parameter |
| R7 | Stale lockfile with `link: true` for Medplum packages | ✅ Fixed | Lockfile regenerated from scratch |
| R8 | Missing `packageManager` blocks Turborepo | ✅ Fixed | Added `npm@11.6.0` |
| R9 | `medplum` reference removed from shared auth | ✅ Fixed | Apps use `aion.getMedplumClient()` via `useMemo` |

## 7. Future Steps

### Short-term (next sprint)
1. Deploy `@medplum/core` FHIR server as external service (Docker, cloud, etc.)
2. Set `MEDPLUM_BASE_URL` in production to point to live FHIR server
3. Implement role tagging in Medplum via `meta.tag` with system `http://aion.app/roles`
4. Add loading/error boundaries to patient portal pages
5. Build out admin-panel with user management, config, audit log views

### Medium-term
1. Migrate from MedplumClient OAuth to JWT-based auth
2. Replace `@aion/vendor-medplum` with native FHIR calls if Medplum SDK is no longer needed
3. Add integration tests with a test FHIR server
4. Add `loading.tsx` and `error.tsx` to all route groups

---

## INTEGRACIÓN FUTURA DE MEDPLUM

### Dónde debe descargarse Medplum posteriormente

Medplum debe descargarse como un repositorio independiente, **fuera del monorepo de AION**:

```bash
# En un directorio paralelo a AION/
git clone https://github.com/medplum/medplum.git
cd medplum
npm install
npm run build:fast
```

### Cómo debe conectarse a AION

AION se conecta a Medplum exclusivamente a través de su **API REST FHIR** y el **SDK `@medplum/core`** (instalado desde npm). No existe dependencia directa del código fuente de Medplum.

```
AION app → @aion/medplum-client → @aion/vendor-medplum → @medplum/core (npm) → FHIR API
```

### Variables de entorno

| Variable | Propósito | Dónde se usa |
|----------|-----------|-------------|
| `NEXT_PUBLIC_MEDPLUM_BASE_URL` | URL pública del servidor FHIR | Client-side, `packages/medplum-client/src/config.ts` |
| `MEDPLUM_BASE_URL` | URL del servidor FHIR (server-side) | Server-side, `packages/medplum-client/src/config.ts` |
| `NEXT_PUBLIC_DOCTOR_URL` | URL del doctor-dashboard | Cross-app redirects tras login |
| `NEXT_PUBLIC_PATIENT_URL` | URL del patient-portal | Cross-app redirects tras login |
| `NEXT_PUBLIC_ADMIN_URL` | URL del admin-panel | Cross-app redirects tras login |

Ejemplo de configuración:

```env
NEXT_PUBLIC_MEDPLUM_BASE_URL=http://localhost:8103/
MEDPLUM_BASE_URL=http://localhost:8103/
NEXT_PUBLIC_DOCTOR_URL=http://localhost:3002
NEXT_PUBLIC_PATIENT_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

### Responsabilidades de AION

- **UI/UX**: Aplicaciones Next.js, componentes React, enrutamiento
- **Auth UI**: Formularios de login, selección de roles, gestión de sesión
- **Orquestación de datos**: Agregación de consultas, caché (cliente + servidor)
- **Lógica de negocio**: Transformaciones FHIR, cálculos clínicos, validaciones
- **Selector de roles**: Interfaz para usuarios multi-rol post-autenticación
- **Modelo de usuario unificado**: Sistema de roles (`UserRole`) independiente de Medplum

### Responsabilidades de Medplum

- **API FHIR**: CRUD sobre recursos FHIR (Patient, Appointment, Encounter, etc.)
- **OAuth**: Autenticación y gestión de tokens
- **Autorización**: Control de acceso a recursos FHIR basado en roles
- **Auditoría**: Registro de cambios en datos clínicos
- **Búsqueda**: Motor de búsqueda FHIR (texto completo, rangos de fecha, _include, etc.)

### Punto de conexión futuro

El único punto de conexión es `vendor/medplum/src/index.ts`:

```typescript
export { MedplumClient } from '@medplum/core';
```

- Para cambiar de proveedor FHIR, solo se modifica este archivo
- Ningún código de aplicación importa `@medplum/core` directamente
- La capa `@aion/medplum-client` abstrae toda la interacción con Medplum

### No realizar la integración todavía

Esta sección documenta únicamente cómo se conectará Medplum cuando sea necesario en el futuro. La plataforma AION actualmente funciona con datos de prueba y no requiere un servidor Medplum en ejecución para desarrollo.
