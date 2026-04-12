# ===== 依赖阶段 =====
FROM oven/bun:alpine AS deps
WORKDIR /app
ENV BUN_INSTALL_REGISTRY='https://registry.npmmirror.com'
COPY package.json bun.lock ./
RUN bun install --ignore-scripts

# ===== 构建阶段 =====
FROM oven/bun:alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
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
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
