# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Bun-based monorepo with three workspaces:

- **`apps/api`** — NestJS backend (port 3000 by default)
- **`apps/web`** — Nuxt 4 frontend (port 4000, configured in `nuxt.config.ts`)
- **`packages/utils`** — Shared TypeScript utilities package (`@aio/utils`)

## Common Commands

```bash
# Install dependencies
bun install

# Run all projects concurrently (api on 3000, web on 4000, utils in watch mode)
bun run dev

# Run individual projects
bun run dev:api      # NestJS API on port 3000
bun run dev:web      # Nuxt web on port 4000
bun run dev:utils    # Utils package in watch mode

# Build
bun run build        # Build all (utils + api + web in parallel)
bun run build:utils  # Build @aio/utils package
bun run build:api    # Build NestJS API
bun run build:web    # Build Nuxt Web

# Kill dev servers
bun run kill        # Kill processes on ports 3000/4000

# Clean & Reinstall
bun run cleanAll     # Remove node_modules and build outputs
bun run reinstall    # cleanAll + bun install

# Test
bun run test:api

# Lint/format/check
bun run check        # Type-check all projects
bun run fmt         # Format code
bun run lint        # Lint code
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
- CORS is enabled for `http://localhost:4000` and `http://127.0.0.1:4000`
- Uses `@aio/utils` via workspace dependency
- Listens on port 3000

### Web (Nuxt 4)

- Entry: `apps/web/app/app.vue`
- API base URL configured via `runtimeConfig.public.apiBase` (defaults to `http://localhost:3000`)
- Web port is 4000 (configured in `nuxt.config.ts`)
- Imports and uses `@aio/utils` directly

### Utils Package

- Entry: `packages/utils/src/index.ts`
- Exported as `@aio/utils`
- Build output goes to `dist/` directory

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
mise run kill         # 停止开发服务器

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
```
