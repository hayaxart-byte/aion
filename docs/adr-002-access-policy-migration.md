# ADR-002: Migración a AccessPolicy de Medplum + Route Guards

## Estado
**Aprobado** — Fase 1 implementada (route guards client-side + middleware).

## Contexto
El análisis arquitectónico (ADR-001) reveló que la autorización en Aion solo existía al momento del login (`allowedRoles`). Una vez autenticado, cualquier rol podía acceder a cualquier ruta dentro de la misma app.

## Decisión
Implementar un sistema de autorización en 3 capas:

### Capa 1: Middleware (Edge)
- Lee la cookie `aion_role` seteada durante el login
- Compara contra `ROUTE_ROLES` (mapa de ruta → roles permitidos)
- Redirige a `/forbidden` si el rol no tiene acceso

### Capa 2: DashboardLayout (Cliente)
- Verifica `user.roles` después de que la sesión se restaura
- Redirige a `/forbidden` si el rol no está en `allowedRoles`
- Usa `useRef` para evitar redirects duplicados

### Capa 3: AccessPolicy (Medplum Server)
- Define permisos CRUD por resourceType FHIR
- Usa `usePatientCompartment: true` para pacientes
- Hace enforcement server-side: el servidor FHIR rechaza operaciones no autorizadas

## Consecuencias

### Positivas
- ✅ Defensa en profundidad: 3 capas independientes
- ✅ El servidor Medplum enforcea los límites incluso si se bypassea el frontend
- ✅ Código muerto eliminado: `medplum-client/src/auth.tsx`, `resolveRedirect()`, `ROLE_ROUTES`
- ✅ Página `/forbidden` con UX consistente
- ✅ Cookies con tiempo de vida limitado (24h)

### Negativas
- ❌ La cookie `aion_role` es modificable por el cliente (pero es defense-in-depth, no la única defensa)
- ❌ El middleware no valida el token JWT — solo lee la cookie de rol
- ❌ Se requiere configurar AccessPolicy manualmente en Medplum Admin Console

## Referencias

- `infra/medplum/access-policies.json`
- `docs/authorization-flow.md`
- `docs/access-policies.md`
