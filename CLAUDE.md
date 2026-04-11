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
bun run build:api
bun run build:web

# Test
bun run test:api

# Lint/format
bun run check        # Type-check all projects
```

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

- **vp** (voidplate/vite-plus) — used for running scripts, building, and type-checking
- **Bun** — package manager
- **mise.toml** — specifies `bun` and `vp` as tools
