FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/admin-panel/package.json ./apps/admin-panel/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG NEXT_PUBLIC_MEDPLUM_BASE_URL=http://localhost:8103/
ENV NEXT_PUBLIC_MEDPLUM_BASE_URL=$NEXT_PUBLIC_MEDPLUM_BASE_URL
WORKDIR /app
COPY --from=deps /app/ ./
COPY apps/admin-panel/ ./apps/admin-panel/
RUN pnpm --filter @aion/admin-panel build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-panel/public ./apps/admin-panel/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-panel/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-panel/.next/static ./apps/admin-panel/.next/static
USER nextjs
EXPOSE 3001
CMD ["node", "apps/admin-panel/server.js"]
