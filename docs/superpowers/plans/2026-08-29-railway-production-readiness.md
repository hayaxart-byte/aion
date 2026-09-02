# AION → Railway Production Readiness Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the Aion medical platform for production deployment on Railway, including Medplum FHIR server, PostgreSQL, Redis, and three Next.js applications.

**Architecture:** Monorepo (pnpm + Turborepo) with 3 Next.js apps + 6 shared packages. Medplum FHIR server deployed as a separate Railway service using the official Docker image. PostgreSQL and Redis as Railway-managed services.

**Tech Stack:** Next.js 16.2.7, React 19.2.4, TypeScript 5, Tailwind CSS 4, pnpm 11.6.0, Turborepo 2.9.16, Medplum 5.1.17, PostgreSQL 16, Redis 7, Node.js 22+

## Global Constraints

- Node.js >=22.18.0 <23.0.0 || >=24.2.0 <25.0.0
- pnpm 11.6.0 (packageManager field)
- Next.js 16.2.7 across all apps
- Medplum @medplum/core ^5.1.15
- No secrets in Git
- No localhost in production configs
- All apps must have healthcheck endpoints
- Docker images must be multi-stage and non-root

---

## Architecture Analysis

### Current State

```
LOCAL DEVELOPMENT
│
├── Medplum Server (localhost:8103) — Docker Compose (deleted from repo)
│   ├── PostgreSQL (localhost:5432) — Docker
│   └── Redis (localhost:6379) — Docker
│
├── Admin Panel (localhost:3001) — Next.js dev
├── Doctor Dashboard (localhost:3002) — Next.js dev
└── Patient Portal (localhost:3003) — Next.js dev
```

### Target State (Railway)

```
RAILWAY PROJECT: aion-production
│
├── PostgreSQL (Railway managed)
│   └── Database: medplum
│
├── Redis (Railway managed)
│   └── Cache + sessions
│
├── Medplum Server
│   ├── Image: medplum/medplum-server:latest
│   ├── Port: 8103 (internal)
│   ├── Public: medplum.<your-domain>
│   └── Depends on: PostgreSQL, Redis
│
├── Admin Panel
│   ├── Build: Dockerfile (apps/admin-panel)
│   ├── Port: 3001 (internal)
│   ├── Public: admin.<your-domain>
│   └── Depends on: Medplum Server
│
├── Doctor Dashboard
│   ├── Build: Dockerfile (apps/doctor-dashboard)
│   ├── Port: 3002 (internal)
│   ├── Public: doctor.<your-domain>
│   └── Depends on: Medplum Server
│
└── Patient Portal
    ├── Build: Dockerfile (apps/patient-portal)
    ├── Port: 3003 (internal)
    ├── Public: patient.<your-domain>
    └── Depends on: Medplum Server
```

### Networking Map

```
Browser
   │
   ├──► admin.<domain> ──────► Admin Panel (3001)
   ├──► doctor.<domain> ─────► Doctor Dashboard (3002)
   └──► patient.<domain> ────► Patient Portal (3003)
                                    │
                                    ▼
                             medplum.<domain> ──► Medplum Server (8103)
                                                      │
                                                 ┌────┴────┐
                                                 ▼         ▼
                                           PostgreSQL   Redis
                                          (Railway)   (Railway)
```

---

## Problems Found

| Severity | Problem | File | Impact | Resolution |
|----------|---------|------|--------|------------|
| CRITICAL | No Dockerfiles exist | repo-wide | Cannot deploy to Railway | Create Dockerfiles for each app + Medplum |
| CRITICAL | No railway.json/railway.toml | repo-root | Railway cannot auto-detect config | Create railway configuration |
| CRITICAL | Medplum server config missing | repo-wide | Medplum won't start correctly | Configure via env vars |
| HIGH | No .env.example files | repo-root | New devs can't configure | Create .env.example |
| HIGH | apps/admin-panel/.env.local not gitignored | apps/admin-panel/ | Secrets could be committed | Add .gitignore |
| HIGH | NEXT_PUBLIC_DEBUG=development in all envs | .env*, .env.local | Debug mode in production | Set to production |
| HIGH | Cloudflare tunnel URLs hardcoded | .env, next.config.ts | URLs break in production | Use env vars |
| HIGH | No healthcheck endpoints | all apps | Railway can't detect unhealthy services | Add /health routes |
| MEDIUM | No CI/CD pipeline | repo-wide | No automated testing | Optional: GitHub Actions |
| MEDIUM | Hardcoded credentials in Terraform | infra/terraform/ | Security risk | Use variables |
| MEDIUM | patient-portal missing MEDPLUM_BASE_URL | apps/patient-portal/.env.local | Server-side code falls back to localhost | Add to env |
| MEDIUM | GCP Redis transit encryption disabled | infra/terraform/gcp/redis.tf | Data in transit unencrypted | Enable TLS |
| LOW | @aion/fhir package unused | packages/fhir/ | Dead code | Consider removing |
| LOW | Duplicate URL resolution logic | packages/auth, packages/medplum-client | Maintenance burden | Consolidate |

---

## Railway Architecture Decision

### Option A: Medplum as Docker Service (SELECTED)

**Why:** Medplum provides an official Docker image (`medplum/medplum-server`). Railway supports Docker image deployment directly. This is the simplest and most maintainable approach.

| Factor | Evaluation |
|--------|------------|
| Compatibilidad | Official image works on Railway |
| Complejidad | Low — just configure env vars |
| Seguridad | Official image maintained by Medplum team |
| Persistencia | PostgreSQL + Redis via Railway managed services |
| Networking | Internal networking between services |
| Escalabilidad | Can scale Medplum independently |
| Coste | Standard Railway pricing |
| Mantenimiento | Updates via image tag |
| Rollback | Easy — roll back to previous image |
| Riesgo | Low — using official supported path |

### Option B: Self-built Medplum Docker Image

**Rejected:** More complex, requires building from source, harder to maintain.

### Option C: Medplum Components Separated

**Rejected:** Medplum server is a single process, not microservices.

---

## Services Definition

| Service | Type | Public | Port | Persistence | Dependencies |
|---------|------|--------|------|-------------|--------------|
| PostgreSQL | Database | No | 5432 | Railway Volume | — |
| Redis | Cache | No | 6379 | — | — |
| Medplum Server | Docker | Yes | 8103 | — | PostgreSQL, Redis |
| Admin Panel | Dockerfile | Yes | 3001 | — | Medplum Server |
| Doctor Dashboard | Dockerfile | Yes | 3002 | — | Medplum Server |
| Patient Portal | Dockerfile | Yes | 3003 | — | Medplum Server |

---

## Environment Variables Matrix

| Variable | Service | Required | Build-time | Runtime | Secret | Source | Production Value |
|----------|---------|----------|------------|---------|--------|--------|------------------|
| `NEXT_PUBLIC_MEDPLUM_BASE_URL` | All Next.js apps | Yes | Yes | Yes | No | Railway domain | `https://medplum.<domain>` |
| `MEDPLUM_BASE_URL` | Doctor Dashboard | Yes | No | Yes | No | Railway domain | `https://medplum.<domain>` |
| `NEXT_PUBLIC_DOCTOR_URL` | All Next.js apps | Yes | Yes | Yes | No | Railway domain | `https://doctor.<domain>` |
| `NEXT_PUBLIC_PATIENT_URL` | All Next.js apps | Yes | Yes | Yes | No | Railway domain | `https://patient.<domain>` |
| `NEXT_PUBLIC_ADMIN_URL` | All Next.js apps | Yes | Yes | Yes | No | Railway domain | `https://admin.<domain>` |
| `NEXT_PUBLIC_DEBUG` | All Next.js apps | No | Yes | Yes | No | Hardcoded | `false` |
| `MEDPLUM_BASE_URL` | Medplum Server | Yes | No | Yes | No | Internal | `http://medplum.railway.internal:8103` |
| `MEDPLUM_PORT` | Medplum Server | Yes | No | Yes | No | Hardcoded | `8103` |
| `MEDPLUM_DATABASE_HOST` | Medplum Server | Yes | No | Yes | Yes | Railway reference | `${{Postgres.DATABASE_HOST}}` |
| `MEDPLUM_DATABASE_PORT` | Medplum Server | Yes | No | Yes | Yes | Railway reference | `${{Postgres.DATABASE_PORT}}` |
| `MEDPLUM_DATABASE_DBNAME` | Medplum Server | Yes | No | Yes | Yes | Railway reference | `${{Postgres.DATABASE_DBNAME}}` |
| `MEDPLUM_DATABASE_USERNAME` | Medplum Server | Yes | No | Yes | Yes | Railway reference | `${{Postgres.DATABASE_USERNAME}}` |
| `MEDPLUM_DATABASE_PASSWORD` | Medplum Server | Yes | No | Yes | Yes | Railway reference | `${{Postgres.DATABASE_PASSWORD}}` |
| `MEDPLUM_DATABASE_SSL_REQUIRE` | Medplum Server | Yes | No | Yes | No | Hardcoded | `true` |
| `MEDPLUM_DATABASE_RUN_MIGRATIONS` | Medplum Server | Yes | No | Yes | No | Hardcoded | `true` |
| `MEDPLUM_REDIS_HOST` | Medplum Server | Yes | No | Yes | Yes | Railway reference | `${{Redis.REDIS_HOST}}` |
| `MEDPLUM_REDIS_PORT` | Medplum Server | Yes | No | Yes | Yes | Railway reference | `${{Redis.REDIS_PORT}}` |
| `MEDPLUM_REDIS_PASSWORD` | Medplum Server | Yes | No | Yes | Yes | Railway reference | `${{Redis.REDIS_PASSWORD}}` |
| `MEDPLUM_REDIS_TLS` | Medplum Server | Yes | No | Yes | No | Hardcoded | `{}` |
| `MEDPLUM_ISSUER` | Medplum Server | Yes | No | Yes | No | Railway domain | `https://medplum.<domain>` |
| `MEDPLUM_JWKS_URL` | Medplum Server | Yes | No | Yes | No | Railway domain | `https://medplum.<domain>/.well-known/jwks.json` |
| `MEDPLUM_AUTHORIZE_URL` | Medplum Server | Yes | No | Yes | No | Railway domain | `https://medplum.<domain>/oauth2/authorize` |
| `MEDPLUM_TOKEN_URL` | Medplum Server | Yes | No | Yes | No | Railway domain | `https://medplum.<domain>/oauth2/token` |
| `MEDPLUM_USER_INFO_URL` | Medplum Server | Yes | No | Yes | No | Railway domain | `https://medplum.<domain>/oauth2/userinfo` |
| `MEDPLUM_APP_BASE_URL` | Medplum Server | Yes | No | Yes | No | Railway domain | `https://admin.<domain>` |
| `MEDPLUM_SUPPORT_EMAIL` | Medplum Server | Yes | No | Yes | No | User config | `support@aion.health` |
| `MEDPLUM_EMAIL_PROVIDER` | Medplum Server | No | No | Yes | No | Hardcoded | `none` |
| `MEDPLUM_REGISTER_ENABLED` | Medplum Server | No | No | Yes | No | Hardcoded | `false` |
| `MEDPLUM_LOG_LEVEL` | Medplum Server | No | No | Yes | No | Hardcoded | `info` |
| `SMTP_HOST` | Doctor Dashboard | No | No | Yes | Yes | User config | SMTP server |
| `SMTP_PORT` | Doctor Dashboard | No | No | Yes | Yes | User config | `587` |
| `SMTP_USER` | Doctor Dashboard | No | No | Yes | Yes | User config | SMTP username |
| `SMTP_PASS` | Doctor Dashboard | No | No | Yes | Yes | User config | SMTP password |
| `SMTP_FROM` | Doctor Dashboard | No | No | Yes | Yes | User config | `noreply@aion.health` |

---

## Implementation Tasks

### Task 1: Create .env.example

**Files:**
- Create: `.env.example`

**Purpose:** Document all required environment variables for new developers.

- [ ] **Step 1: Create root .env.example**

```bash
# AION Platform — Environment Configuration

# Medplum FHIR Server (set to your Medplum instance URL)
NEXT_PUBLIC_MEDPLUM_BASE_URL=http://localhost:8103/
MEDPLUM_BASE_URL=http://localhost:8103/

# Cross-app URLs (for login redirects)
NEXT_PUBLIC_DOCTOR_URL=http://localhost:3002
NEXT_PUBLIC_PATIENT_URL=http://localhost:3003
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001

# Debug mode (set to 'false' in production)
NEXT_PUBLIC_DEBUG=development

# SMTP (for email verification — optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

- [ ] **Step 2: Verify file is correct**

---

### Task 2: Fix .gitignore for admin-panel

**Files:**
- Create: `apps/admin-panel/.gitignore`

**Purpose:** Prevent `.env.local` from being committed.

- [ ] **Step 1: Create apps/admin-panel/.gitignore**

```gitignore
# dependencies
node_modules/

# next.js
.next/
out/

# production
build/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 2: Verify .env.local is now gitignored**

---

### Task 3: Create Healthcheck Endpoints

**Files:**
- Create: `apps/admin-panel/app/api/health/route.ts`
- Create: `apps/doctor-dashboard/app/api/health/route.ts`
- Create: `apps/patient-portal/app/api/health/route.ts`

**Purpose:** Railway needs healthcheck endpoints to detect unhealthy services.

- [ ] **Step 1: Create health endpoint for admin-panel**

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'admin-panel', timestamp: Date.now() });
}
```

- [ ] **Step 2: Create health endpoint for doctor-dashboard**

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'doctor-dashboard', timestamp: Date.now() });
}
```

- [ ] **Step 3: Create health endpoint for patient-portal**

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'patient-portal', timestamp: Date.now() });
}
```

- [ ] **Step 4: Verify all health endpoints return 200**

---

### Task 4: Create Dockerfiles for Next.js Apps

**Files:**
- Create: `apps/admin-panel/Dockerfile`
- Create: `apps/doctor-dashboard/Dockerfile`
- Create: `apps/patient-portal/Dockerfile`
- Create: `apps/admin-panel/.dockerignore`
- Create: `apps/doctor-dashboard/.dockerignore`
- Create: `apps/patient-portal/.dockerignore`

**Purpose:** Each Next.js app needs a Dockerfile for Railway deployment.

- [ ] **Step 1: Create shared Dockerfile pattern for Next.js apps**

All three apps use the same pattern. Create identical Dockerfiles:

```dockerfile
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./

# Copy app package.json
COPY apps/@aion/ ./apps/

# Copy all workspace packages
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/ ./apps/
COPY --from=deps /app/packages/ ./packages/
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/turbo.json ./

# Build the app (replace APP_NAME with actual app name)
RUN pnpm --filter @aion/APP_NAME build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/APP_NAME/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/APP_NAME/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/APP_NAME/.next/static ./apps/APP_NAME/.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/APP_NAME/server.js"]
```

- [ ] **Step 2: Create admin-panel Dockerfile (replace APP_NAME with admin-panel, PORT with 3001)**
- [ ] **Step 3: Create doctor-dashboard Dockerfile (replace APP_NAME with doctor-dashboard, PORT with 3002)**
- [ ] **Step 4: Create patient-portal Dockerfile (replace APP_NAME with patient-portal, PORT with 3003)**
- [ ] **Step 5: Create .dockerignore for each app**

```gitignore
node_modules
.next
.git
.gitignore
*.md
.env*.local
```

- [ ] **Step 6: Update next.config.ts for standalone output**

Each app needs `output: 'standalone'` in next.config.ts for Docker deployment.

---

### Task 5: Configure Next.js for Standalone Output

**Files:**
- Modify: `apps/admin-panel/next.config.ts`
- Modify: `apps/doctor-dashboard/next.config.ts`
- Modify: `apps/patient-portal/next.config.ts`

**Purpose:** Next.js standalone output mode is required for Docker deployments.

- [ ] **Step 1: Update admin-panel next.config.ts**

```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'standalone',
};
export default nextConfig;
```

- [ ] **Step 2: Update doctor-dashboard next.config.ts**

```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'standalone',
};
export default nextConfig;
```

- [ ] **Step 3: Update patient-portal next.config.ts**

```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'standalone',
};
export default nextConfig;
```

- [ ] **Step 4: Verify builds succeed with standalone output**

---

### Task 6: Create Railway Configuration

**Files:**
- Create: `railway.json` (root)

**Purpose:** Railway configuration for the project.

- [ ] **Step 1: Create root railway.json**

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

Note: Each service will override this with its own settings in the Railway dashboard.

---

### Task 7: Update Environment Variables for Production

**Files:**
- Modify: `.env` (root)
- Create: `.env.production.example`

**Purpose:** Remove hardcoded Cloudflare URLs and document production values.

- [ ] **Step 1: Create .env.production.example**

```bash
# Production Environment Variables
# Set these in Railway dashboard

# Medplum FHIR Server
NEXT_PUBLIC_MEDPLUM_BASE_URL=https://medplum.your-domain.com
MEDPLUM_BASE_URL=https://medplum.your-domain.com

# Cross-app URLs
NEXT_PUBLIC_DOCTOR_URL=https://doctor.your-domain.com
NEXT_PUBLIC_PATIENT_URL=https://patient.your-domain.com
NEXT_PUBLIC_ADMIN_URL=https://admin.your-domain.com

# Debug (set to 'false' in production)
NEXT_PUBLIC_DEBUG=false

# SMTP (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@your-domain.com
```

- [ ] **Step 2: Verify .env.production.example is complete**

---

### Task 8: Clean Up Hardcoded URLs

**Files:**
- Modify: `apps/doctor-dashboard/next.config.ts`

**Purpose:** Remove Cloudflare tunnel URLs from config.

- [ ] **Step 1: Remove allowedDevOrigins from doctor-dashboard next.config.ts**

The `allowedDevOrigins` should only be used in development. Remove it for production.

```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'standalone',
};
export default nextConfig;
```

- [ ] **Step 2: Verify no hardcoded URLs remain in configs**

---

### Task 9: Create Docker Compose for Local Production Testing

**Files:**
- Create: `docker-compose.production.yml`

**Purpose:** Allow testing the full stack locally before deploying to Railway.

- [ ] **Step 1: Create docker-compose.production.yml**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: medplum
      POSTGRES_USER: medplum
      POSTGRES_PASSWORD: medplum
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  medplum:
    image: medplum/medplum-server:latest
    environment:
      NODE_ENV: production
      MEDPLUM_PORT: 8103
      MEDPLUM_BASE_URL: http://localhost:8103
      MEDPLUM_DATABASE_HOST: postgres
      MEDPLUM_DATABASE_PORT: 5432
      MEDPLUM_DATABASE_DBNAME: medplum
      MEDPLUM_DATABASE_USERNAME: medplum
      MEDPLUM_DATABASE_PASSWORD: medplum
      MEDPLUM_DATABASE_SSL_REQUIRE: "false"
      MEDPLUM_DATABASE_RUN_MIGRATIONS: "true"
      MEDPLUM_REDIS_HOST: redis
      MEDPLUM_REDIS_PORT: 6379
      MEDPLUM_EMAIL_PROVIDER: none
      MEDPLUM_REGISTER_ENABLED: "true"
      MEDPLUM_LOG_LEVEL: info
    ports:
      - "8103:8103"
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
```

- [ ] **Step 2: Verify docker-compose.production.yml works**

---

### Task 10: Validate All Changes

**Files:** None (validation only)

**Purpose:** Ensure all changes work correctly.

- [ ] **Step 1: Run pnpm install**

```bash
pnpm install
```

- [ ] **Step 2: Run pnpm lint**

```bash
pnpm lint
```

- [ ] **Step 3: Run pnpm build**

```bash
pnpm build
```

- [ ] **Step 4: Test Docker build for one app**

```bash
cd apps/doctor-dashboard
docker build -t aion-doctor-dashboard .
```

- [ ] **Step 5: Test health endpoints**

```bash
# Start the app locally
pnpm --filter @aion/doctor-dashboard dev

# Test health endpoint
curl http://localhost:3002/api/health
```

- [ ] **Step 6: Verify git status**

```bash
git status
git diff
```

---

## Railway Deployment Runbook

### Step 1: Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init aion-production
```

### Step 2: Add PostgreSQL

```bash
# Add PostgreSQL service
railway add postgresql

# Note the connection details from Railway dashboard
```

### Step 3: Add Redis

```bash
# Add Redis service
railway add redis

# Note the connection details from Railway dashboard
```

### Step 4: Deploy Medplum Server

```bash
# Add Medplum service (using Docker image)
railway add --image medplum/medplum-server medplum

# Set environment variables in Railway dashboard:
# MEDPLUM_PORT=8103
# MEDPLUM_DATABASE_HOST=${{Postgres.DATABASE_HOST}}
# MEDPLUM_DATABASE_PORT=${{Postgres.DATABASE_PORT}}
# MEDPLUM_DATABASE_DBNAME=${{Postgres.DATABASE_DBNAME}}
# MEDPLUM_DATABASE_USERNAME=${{Postgres.DATABASE_USERNAME}}
# MEDPLUM_DATABASE_PASSWORD=${{Postgres.DATABASE_PASSWORD}}
# MEDPLUM_DATABASE_SSL_REQUIRE=true
# MEDPLUM_DATABASE_RUN_MIGRATIONS=true
# MEDPLUM_REDIS_HOST=${{Redis.REDIS_HOST}}
# MEDPLUM_REDIS_PORT=${{Redis.REDIS_PORT}}
# MEDPLUM_REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
# MEDPLUM_REDIS_TLS={}
# MEDPLUM_BASE_URL=https://medplum.your-domain.com
# MEDPLUM_ISSUER=https://medplum.your-domain.com
# MEDPLUM_JWKS_URL=https://medplum.your-domain.com/.well-known/jwks.json
# MEDPLUM_AUTHORIZE_URL=https://medplum.your-domain.com/oauth2/authorize
# MEDPLUM_TOKEN_URL=https://medplum.your-domain.com/oauth2/token
# MEDPLUM_USER_INFO_URL=https://medplum.your-domain.com/oauth2/userinfo
# MEDPLUM_APP_BASE_URL=https://admin.your-domain.com
# MEDPLUM_SUPPORT_EMAIL=support@your-domain.com
# MEDPLUM_EMAIL_PROVIDER=none
# MEDPLUM_REGISTER_ENABLED=false
# MEDPLUM_LOG_LEVEL=info

# Deploy
railway up
```

### Step 5: Deploy Admin Panel

```bash
# Add admin panel service
railway add --name admin-panel

# Set root directory to apps/admin-panel in Railway dashboard
# Set environment variables:
# NEXT_PUBLIC_MEDPLUM_BASE_URL=https://medplum.your-domain.com
# MEDPLUM_BASE_URL=https://medplum.your-domain.com
# NEXT_PUBLIC_DOCTOR_URL=https://doctor.your-domain.com
# NEXT_PUBLIC_PATIENT_URL=https://patient.your-domain.com
# NEXT_PUBLIC_ADMIN_URL=https://admin.your-domain.com
# NEXT_PUBLIC_DEBUG=false

# Deploy
railway up
```

### Step 6: Deploy Doctor Dashboard

```bash
# Add doctor dashboard service
railway add --name doctor-dashboard

# Set root directory to apps/doctor-dashboard in Railway dashboard
# Set environment variables:
# NEXT_PUBLIC_MEDPLUM_BASE_URL=https://medplum.your-domain.com
# MEDPLUM_BASE_URL=https://medplum.your-domain.com
# NEXT_PUBLIC_DOCTOR_URL=https://doctor.your-domain.com
# NEXT_PUBLIC_PATIENT_URL=https://patient.your-domain.com
# NEXT_PUBLIC_ADMIN_URL=https://admin.your-domain.com
# NEXT_PUBLIC_DEBUG=false

# Deploy
railway up
```

### Step 7: Deploy Patient Portal

```bash
# Add patient portal service
railway add --name patient-portal

# Set root directory to apps/patient-portal in Railway dashboard
# Set environment variables:
# NEXT_PUBLIC_MEDPLUM_BASE_URL=https://medplum.your-domain.com
# NEXT_PUBLIC_DOCTOR_URL=https://doctor.your-domain.com
# NEXT_PUBLIC_PATIENT_URL=https://patient.your-domain.com
# NEXT_PUBLIC_ADMIN_URL=https://admin.your-domain.com
# NEXT_PUBLIC_DEBUG=false

# Deploy
railway up
```

### Step 8: Configure Domains

In Railway dashboard, for each service:
1. Go to Settings → Networking
2. Generate a public domain or configure custom domain
3. Note the URLs for cross-app environment variables

### Step 9: Configure Healthchecks

In Railway dashboard, for each service:
1. Go to Settings → Deploy
2. Set Healthcheck Path to `/api/health`
3. Set Healthcheck Timeout to 300 seconds

### Step 10: Apply Access Policies

After Medplum is running, apply the access policies:

```bash
# Get Medplum access token
TOKEN=$(curl -X POST https://medplum.your-domain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin"}' | jq -r '.accessToken')

# Apply doctor policy
curl -X POST https://medplum.your-domain.com/fhir/R4/AccessPolicy \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @infra/medplum/access-policies.json
```

### Step 11: Verify Production

```bash
# Test Medplum
curl https://medplum.your-domain.com/fhir/R4/metadata

# Test Admin Panel
curl https://admin.your-domain.com/api/health

# Test Doctor Dashboard
curl https://doctor.your-domain.com/api/health

# Test Patient Portal
curl https://patient.your-domain.com/api/health
```

---

## Production Checklist

```text
[ ] Secrets configured in Railway
[ ] PostgreSQL configured and running
[ ] Redis configured and running
[ ] Medplum server deployed and healthy
[ ] Admin panel deployed and healthy
[ ] Doctor dashboard deployed and healthy
[ ] Patient portal deployed and healthy
[ ] Custom domains configured
[ ] Healthchecks configured
[ ] CORS validated
[ ] OAuth validated
[ ] Access policies applied
[ ] Logs reviewed
[ ] Backups configured (Railway managed)
[ ] NEXT_PUBLIC_DEBUG=false
[ ] No localhost in production configs
[ ] No secrets in Git
[ ] All Docker images non-root
[ ] All health endpoints responding
```

---

## Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Medplum Docker image updates may break compatibility | Medium | Pin specific version tag |
| Railway managed PostgreSQL may have different config than local | Medium | Test thoroughly |
| CORS configuration between services | Medium | Configure in Medplum |
| Rate limiting in production | Low | Configure in Medplum |
| Storage for FHIR binaries | Medium | Use Railway Volumes or S3 |

---

## Human Decisions Required

### Decision 1: Domain Strategy

**Problem:** Each service needs a public domain on Railway.

**Options:**
A. Use Railway auto-generated domains (`aion-admin.up.railway.app`)
B. Configure custom domains (`admin.aion.health`)

**Recommendation:** Option B for production, Option A for staging.

**Action needed:** User must decide domain strategy and configure DNS.

### Decision 2: Storage Strategy

**Problem:** Medplum needs storage for Binary resources and DocumentReferences.

**Options:**
A. Railway Volumes (simple, limited)
B. S3-compatible storage (scalable, recommended)
C. Use Medplum's built-in file storage

**Recommendation:** Option C for initial deployment, migrate to B when needed.

**Action needed:** User must decide storage strategy.

### Decision 3: Email Provider

**Problem:** Doctor dashboard uses Nodemailer for email verification.

**Options:**
A. Configure SMTP (Gmail, SendGrid, etc.)
B. Use Medplum's email system
C. Disable email verification for now

**Recommendation:** Option C for initial deployment, configure later.

**Action needed:** User must decide email strategy.

---

## Context7 Research

### Technology: Railway
- **Documentation consulted:** Railway Docker deployment, monorepo support, services, variables, volumes, healthchecks
- **Key findings:**
  - Railway supports Docker image deployment directly
  - Monorepos use root directory setting per service
  - Reference variables: `${{Service.VARIABLE}}`
  - Volumes follow service region
  - Healthchecks configurable per service

### Technology: Medplum
- **Documentation consulted:** Self-hosting, Docker container, environment variables, configuration
- **Key findings:**
  - Official Docker image: `medplum/medplum-server`
  - Configuration via environment variables with `MEDPLUM_` prefix
  - Requires PostgreSQL and Redis
  - Database migrations run automatically with `MEDPLUM_DATABASE_RUN_MIGRATIONS=true`
  - OAuth endpoints configurable via env vars

### Decisions validated via documentation:
- Medplum Docker image deployment on Railway ✓
- Environment variable configuration for Medplum ✓
- Next.js standalone output for Docker ✓
- Railway monorepo deployment strategy ✓
