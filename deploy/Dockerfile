# ===== 依赖阶段 =====
FROM oven/bun:alpine AS deps
WORKDIR /app
ENV BUN_INSTALL_REGISTRY='https://registry.npmmirror.com'
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/utils/package.json ./packages/utils/
RUN bun install --ignore-scripts

# ===== 构建阶段 =====
FROM oven/bun:alpine AS builder
WORKDIR /app
ENV BUN_INSTALL_REGISTRY='https://registry.npmmirror.com'
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
RUN bun install --ignore-scripts
RUN bun run build

# ===== API 运行时 =====
FROM node:22-alpine AS api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/.env.production .env
EXPOSE 3000
CMD ["node", "dist/main.js"]

# ===== Web 运行时 =====
FROM node:22-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.output ./.output
COPY --from=builder /app/apps/web/.env.production .env
EXPOSE 4000
CMD ["node", ".output/server/index.mjs"]
