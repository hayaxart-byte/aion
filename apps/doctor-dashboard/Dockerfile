FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/doctor-dashboard/package.json ./apps/doctor-dashboard/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/ ./
COPY apps/doctor-dashboard/ ./apps/doctor-dashboard/
RUN pnpm --filter @aion/doctor-dashboard build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/doctor-dashboard/public ./apps/doctor-dashboard/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/doctor-dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/doctor-dashboard/.next/static ./apps/doctor-dashboard/.next/static
USER nextjs
EXPOSE 3002
CMD ["node", "apps/doctor-dashboard/server.js"]
