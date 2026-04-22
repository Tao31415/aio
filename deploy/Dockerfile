# ===== API Dockerfile =====
FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

FROM base AS install
ENV BUN_INSTALL_REGISTRY='https://registry.npmmirror.com'
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY apps/api/package.json /temp/dev/apps/api/
COPY apps/web/package.json /temp/dev/apps/web/
COPY packages/utils/package.json /temp/dev/packages/utils/
RUN cd /temp/dev && bun install --ignore-scripts --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY apps/api/package.json /temp/prod/apps/api/
COPY apps/web/package.json /temp/prod/apps/web/
COPY packages/utils/package.json /temp/prod/packages/utils/
RUN cd /temp/prod && bun install --ignore-scripts --frozen-lockfile --production

FROM base AS prerelease
WORKDIR /usr/src/app
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=install /temp/dev/apps/api/node_modules ./apps/api/node_modules
COPY --from=install /temp/dev/apps/web/node_modules ./apps/web/node_modules
COPY --from=install /temp/dev/packages/utils/node_modules ./packages/utils/node_modules

COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# RUN bun test
WORKDIR /usr/src/app/packages/utils
RUN bun run build

WORKDIR /usr/src/app/apps/api
RUN bun run build

WORKDIR /usr/src/app/apps/web
RUN bun run build

FROM base AS api
WORKDIR /usr/src/app
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=install /temp/prod/apps/api/node_modules ./apps/api/node_modules
COPY --from=install /temp/prod/packages/utils/node_modules ./packages/utils/node_modules

COPY --from=prerelease /usr/src/app/apps/api/dist ./apps/api/dist
COPY --from=prerelease /usr/src/app/packages/utils/dist ./packages/utils/dist
COPY --from=prerelease /usr/src/app/apps/api/.env.production ./apps/api/.env

WORKDIR /usr/src/app/apps/api
# run the app
EXPOSE 3000/tcp
CMD ["bun", "dist/main.js"]

FROM base AS web
WORKDIR /usr/src/app
# COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=install /temp/prod/apps/web/node_modules ./apps/web/node_modules
# COPY --from=install /temp/prod/packages/utils/node_modules ./packages/utils/node_modules

COPY --from=prerelease /usr/src/app/apps/web/.output ./apps/web/.output
# COPY --from=prerelease /usr/src/app/packages/utils/dist ./packages/utils/dist
COPY --from=prerelease /usr/src/app/apps/web/.env.production ./apps/web/.env

WORKDIR /usr/src/app/apps/web
# run the app
EXPOSE 4000/tcp
CMD ["bun", ".output/server/index.mjs"]
