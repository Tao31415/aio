FROM oven/bun:alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# API
FROM runner AS api
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/.env.production .env
EXPOSE 3000
CMD ["bun", "--env-file=.env", "dist/main.js"]

# Web
FROM runner AS web
COPY --from=builder /app/apps/web/.output ./output
COPY --from=builder /app/apps/web/.env.production .env
EXPOSE 3001
CMD ["bun", "--env-file=.env", ".output/server/index.mjs"]
