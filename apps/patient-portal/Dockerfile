FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/patient-portal/package.json ./apps/patient-portal/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/ ./
COPY apps/patient-portal/ ./apps/patient-portal/
RUN pnpm --filter @aion/patient-portal build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3003
ENV HOSTNAME="0.0.0.0"
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/patient-portal/public ./apps/patient-portal/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/patient-portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/patient-portal/.next/static ./apps/patient-portal/.next/static
USER nextjs
EXPOSE 3003
CMD ["node", "apps/patient-portal/server.js"]
