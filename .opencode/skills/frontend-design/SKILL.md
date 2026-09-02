---
name: frontend-design
description: Use when auditing, improving, or evaluating the frontend architecture, UX, or UI of Medplum-based healthcare SaaS apps (admin-dashboard, patient-portal). Evaluates component architecture, data fetching, state management, routing, accessibility, and clinical UX flows against modern Next.js/React standards and WCAG guidelines. NOT for visual redesigns or pure CSS changes.
---

# Frontend Design — Healthcare SaaS Standards

Use this skill when auditing or improving `admin-dashboard` or `patient-portal` apps in the Medplum monorepo. Focus on structural UX and architecture, not visual decoration.

## Core Principles

1. **Clinical UX over admin metrics** — Prioritize doctor workflow efficiency. Every click saved matters in a clinical setting.
2. **Progressive enhancement** — Core content must render server-side (Next.js RSC). Client JS is for interactivity, not rendering.
3. **Data fetching must be cached** — No raw `useEffect` + `fetch` without a caching layer (SWR, React Query, or Medplum client cache).
4. **Every state must be handled** — Every component must handle: loading, empty, error, and success states. No "infinite spinner" or "blank page" edge cases.
5. **Accessibility is non-negotiable** — WCAG 2.1 AA minimum. Semantic HTML, ARIA landmarks, focus management, keyboard navigation, color contrast.
6. **Spanish-first UX** — All UI text in Spanish. No English leakage. No hardcoded strings without i18n infrastructure.
7. **Auth must be invisible** — Once authenticated, the user should never see the login page again via Back button or stale state. `router.replace()` on all auth redirects.

## Architecture Standards

### Next.js App Router

- Route segments MUST have `loading.tsx` and `error.tsx` boundaries.
- Layouts that require auth (`/dashboard/*`) MUST check session server-side when possible.
- `<Link>` for client navigation, `<a>` for external. Never `<Button asChild><a>` — use `<Link>` or `router.push()`.
- No `'use client'` on pure presentational components (no hooks, state, effects, browser APIs).

### Data Fetching

- Server Components should fetch initial data using `async` components or Server Actions.
- Client-side data fetching MUST use a library (SWR, React Query) or the MedplumClient's built-in caching.
- All `useEffect` data fetches MUST handle: loading/error/empty states, AbortController cleanup, and race conditions.
- Never use `as unknown as Record<string, ...>` — import proper FHIR types from `@medplum/fhirtypes` or `@medplum/core`.

### Auth Flow

- Login success → `router.replace('/dashboard')` (never `push`).
- Auth guard (`DashboardLayout`) must have a `redirected` ref to prevent double-redirects.
- Fallback to `medplum.getProfile()` if React state hasn't committed yet (race condition guard).
- Login page must redirect already-authenticated users via `useEffect`.

### Component Design

- Props-only components with no hooks → server component.
- Error boundaries at every route segment via `error.tsx`.
- Shared types in `types.ts`, shared utilities in `lib/`, not inline in pages.
- Empty states must not appear while loading. Track `loading` separately from `data.length === 0`.

## UX Standards for Clinical Dashboards

1. **Loading** → Use skeleton cards (not spinners) for dashboard data.
2. **Empty** → Informative message with a CTA (e.g., "No hay pacientes hoy. Registre el primer paciente.").
3. **Error** → Contextual message with retry action. Never just `console.error`.
4. **Navigation** → Sidebar (doctor) / Top bar (patient) must persist the active state. `aria-current="page"` on current link.
5. **Back button** → Must never return to login after authentication.
6. **Status badges** → Color + text + icon for colorblind users. Never color-only.
7. **Inline SVGs** → Must have `<title>` or `aria-label` and `role="img"`. Emojis used as icons must have `aria-hidden="true"`.

## Anti-Patterns to Flag

- ❌ `router.push('/login')` in auth guards → use `replace`.
- ❌ `useEffect` + `fetch` without cleanup or loading states.
- ❌ `as any` / `as unknown as Record` — missing proper FHIR types.
- ❌ Inline utility functions in page components (extract to `lib/`).
- ❌ Unnecessary `'use client'` on presentational components.
- ❌ Unused UI components (shadcn Dialog, DropdownMenu, Popover, Calendar) shipped in bundle.
- ❌ `<button><a>` nested elements (invalid HTML).
- ❌ No `loading.tsx` or `error.tsx` in route segments.
- ❌ Hardcoded credentials in source code.
- ❌ Missing `@medplum/core` in `package.json` dependencies.
