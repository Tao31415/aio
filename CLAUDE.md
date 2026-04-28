# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**项目名称**: AIO - 工业设备监控与数据采集平台

A Bun-based monorepo with three workspaces:

- **`apps/api`** — NestJS backend (port 30000 by default)
- **`apps/web`** — Nuxt 4 frontend (port 40000, configured in `nuxt.config.ts`)
- **`packages/utils`** — Shared TypeScript utilities package (`@aio/utils`)

## Common Commands

```bash
# Install dependencies
bun install

# Run all projects (api on 30000, web on 40000, utils in watch mode)
bun run dev

# Preview production build
bun run preview

# Build all
bun run build        # utils + api + web in parallel

# Run individual projects
bun run dev:api      # NestJS API on port 30000
bun run dev:web      # Nuxt web on port 40000
bun run dev:utils    # Utils package in watch mode

# Kill dev servers
bun run kill        # Kill processes on ports 30000/40000

# Clean & Reinstall
bun run cleanAll     # Remove node_modules and build outputs
bun run reinstall    # cleanAll + bun install

# Test
bun run test:api

# Lint/format/check
bun run check        # Type-check all projects
bun run clean       # Clean build outputs
bun run cleanAll    # Clean + node_modules
```

## Build Outputs

| Project | Output Path            |
| ------- | ---------------------- |
| `api`   | `apps/api/dist/`       |
| `web`   | `apps/web/.output/`    |
| `utils` | `packages/utils/dist/` |

## Architecture

### API (NestJS)

- Entry: `apps/api/src/main.ts`
- CORS and Better Auth `trustedOrigins` share the same browser-origin allowlist from env
- Uses `@aio/utils` via workspace dependency
- Listens on port 30000 locally, 3000 in Docker production

### Web (Nuxt 4)

- Entry: `apps/web/app/app.vue`
- API base URL configured via `runtimeConfig.public.apiBase`
- Web port is 40000 locally, 4000 in Docker production
- Imports and uses `@aio/utils` directly
- **SPA only**: `auth.global.ts` middleware only runs on client (`import.meta.client` is always true in this project)

### Deployment Environments

- **Local development**: API runs on `http://localhost:30000`, Web runs on `http://localhost:40000`, and the browser calls API directly across origins
- **Docker deployment**: API listens on `3000`, Web listens on `4000`, and browser traffic should enter through Nginx on `http://localhost` (or your real domain later)
- **Browser origin rule**: CORS and Better Auth should be configured from the browser-visible origin, not from container service names like `api:3000` or `web:4000`
- **Real domain deployment**: when switching from `localhost` to a real domain, update `apps/api/.env.production` (`CORS_ORIGIN`, `BETTER_AUTH_URL`) and `apps/web/.env.production` (`NUXT_PUBLIC_API_BASE`) together
- **Recommended production review**: also verify `BETTER_AUTH_BASE_PATH`, `PORT`, HTTPS/cookie settings, and whether `api` / `web` host port mappings should remain exposed or only be accessed through Nginx

### Utils Package

- Entry: `packages/utils/src/index.ts`
- Exported as `@aio/utils`
- Build output goes to `dist/` directory

## API Development

API 项目位于 `apps/api/` 目录下，使用 `.env.local` 作为开发环境配置文件。

### Scripts (apps/api/package.json)

```bash
# 开发
bun run dev             # 启动开发服务器 (--watch, 读取 .env.local)
bun run dev:debug        # 启动调试模式 (--debug --watch)
bun run preview          # 预览生产构建 (bun --env-file=.env.local dist/main)

# 构建
bun run build            # NestJS 生产构建 (nest build)

# 数据库
bun run db:migrate       # 运行 Better Auth 数据库迁移
bun run db:secret        # 生成 Better Auth 密钥

# 测试
bun run test             # 运行单元测试 (Jest, 读取 .env.test)
bun run test:watch       # 监听模式运行测试
bun run test:cov         # 运行测试并生成覆盖率报告
bun run test:debug      # 使用 Node inspect-brk 断点调试
bun run test:e2e         # 运行 E2E 测试

# 代码质量
bun run check            # 类型检查 (vp check)
bun run fmt              # 代码格式化 (vp fmt --write)
bun run lint             # Lint 并自动修复 (vp lint --fix)

# 清理
bun run clean            # 删除 dist/ 构建产物
bun run cleanAll         # 删除 node_modules/ 和 dist/
```

### 环境变量

- **开发环境**: `.env.local` (被 `dev`/`dev:debug` 脚本读取)
- **测试环境**: `.env.test` (被 `test*` 脚本读取)
- **生产环境**: 通过 Docker 或 CI/CD 在运行时注入

.env.example 中定义了所有可用的环境变量，包含必填项校验（通过 Zod）。

### Docker Production Notes

- `apps/api/.env.production`: `CORS_ORIGIN` must list browser-visible origins, and `BETTER_AUTH_URL` must match the public API origin used by the browser
- `apps/web/.env.production`: `NUXT_PUBLIC_API_BASE` must point to the same public entry, usually Nginx such as `http://localhost` or `https://app.example.com`
- If you introduce a real domain, update all three values in the same change to avoid mismatched CORS, Better Auth redirects, or browser requests going to `localhost`

## Tooling

- **mise** — task orchestrator (推荐)
- **vp** (voidplate/vite-plus) — scripts, building, type-checking
- **Bun** — package manager
- **mise.toml** — pinned tool versions + task definitions
- **Makefile** — 独立于 mise，完全等价的功能

## Mise Tasks

**mise 和 Makefile 完全独立，可单独使用。**

```bash
# 初始化
mise run init         # 初始化项目（安装依赖 + 配置环境变量）

# 开发
mise run dev          # 启动所有项目 (api + web + utils watch)
mise run dev:api      # 启动 API only
mise run dev:web      # 启动 Web only
mise run kill         # 停止开发服务器 (默认 30000/40000，支持额外端口)

# 代码质量
mise run check        # 类型检查
mise run fix          # 自动修复类型问题

# 清理与重装
mise run clean        # 清理构建产物
mise run reinstall    # 清理并重新安装依赖

# 构建
mise run build        # 编译项目

# Docker 镜像构建
mise run deploy-build       # 并行构建 Docker 镜像（api + web）
mise run deploy-build-api   # 构建 API Docker 镜像
mise run deploy-build-web   # 构建 Web Docker 镜像
mise run deploy-pull        # 下载 Docker 镜像

# Docker 部署
mise run deploy            # 部署到 Docker (build + start)
mise run deploy-start      # 启动 Docker 服务（不重建）
mise run deploy-stop       # 停止 Docker 容器
mise run deploy-restart    # 重启 Docker 容器
mise run deploy-down       # 删除 Docker 容器
mise run deploy-prune     # 清空 Docker 构建缓存

# 动态任务 (执行 bun run <task>)
mise run ex preview       # 相当于 bun run preview
mise run ex test:api      # 相当于 bun run test:api
mise run ex check --fix   # 相当于 bun run check --fix
```

## Makefile

Makefile 与 mise 完全独立，功能对等：

```bash
make init                  # 初始化项目
make build                 # 编译项目
make dev                   # 启动开发环境
make check                 # 类型检查
make fix                   # 自动修复类型问题
make kill                  # 停止开发服务器
make clean                 # 清理构建产物
make reinstall             # 清理并重新安装依赖

make deploy                # 部署到 Docker (build + start)
make deploy-build          # 并行构建 Docker 镜像
make deploy-build-api      # 构建 API Docker 镜像
make deploy-build-web      # 构建 Web Docker 镜像
make deploy-pull           # 下载 Docker 镜像
make deploy-start          # 启动 Docker 服务
make deploy-stop           # 停止 Docker 容器
make deploy-restart        # 重启 Docker 容器
make deploy-down           # 删除 Docker 容器
make deploy-prune          # 清空 Docker 构建缓存

make ex preview           # 相当于 bun run preview
make ex test:api          # 相当于 bun run test:api
make ex check --fix
```
