# API (NestJS)

This file provides guidance to Claude Code when working in `apps/api/`.

## Project Structure

```
apps/api/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   ├── config/                      # Configuration files
│   │   ├── index.ts                 # Barrel export (db, redis, mqtt, minio, app)
│   │   ├── app.config.ts            # App-level config (NODE_ENV, basePath)
│   │   ├── db.config.ts             # PostgreSQL connection config
│   │   ├── redis.config.ts          # Redis connection config
│   │   ├── mqtt.config.ts           # MQTT broker URL config
│   │   ├── minio.config.ts          # MinIO/S3 storage config
│   │   └── env.validation.ts        # Zod environment variable validation
│   ├── module/
│   │   ├── middleware/
│   │   │   ├── database/            # TypeORM PostgreSQL module
│   │   │   ├── redis/               # Redis client (ioredis) + cache module
│   │   │   ├── mqtt/                # MQTT microservice client
│   │   │   └── storage/             # MinIO/S3 storage service
│   │   ├── rbac/
│   │   │   ├── auth/                # Better Auth + RBAC entities
│   │   │   │   ├── auth.ts          # Better Auth configuration
│   │   │   │   ├── auth.module.ts   # NestJS auth module wrapper
│   │   │   │   └── entities/        # User, Account, Verification entities
│   │   │   └── user/                # User controller (me, public, optional)
│   │   └── log/                     # Pino logger configuration
│   └── common/
│       └── decorators/
│           └── roles.decorator.ts   # @Roles() decorator for RBAC
└── better-auth_migrations/          # Database migrations
```

## Architecture

### API Design

- **Base URL**: `/api`
- **Versioning**: URI-based (`/v1/xxx`), default version `1`
- **Swagger Docs**: `/api/docs` (cookie auth enabled)
- **Port**: 30000 (local), 3000 (production)
- **CORS**: Allows `http://localhost:40000` and `http://127.0.0.1:40000`

### Better Auth (Authentication)

Uses `@thallesp/nestjs-better-auth` wrapping `better-auth` with:

| Feature | Config |
|---------|--------|
| Sessions | Redis-backed, 7-day expiry, 5-min fresh age |
| Rate Limiting | 100 req / 60s, stored in Redis |
| Multi-Session | Max 10 sessions per user |
| Cookie Cache | 5-min TTL for reduced DB calls |
| CORS Origins | localhost:40000, 127.0.0.1:40000, UI_URL |

**Auth Base Path**: `/api/v1/auth` (configurable via `BETTER_AUTH_BASE_PATH`)

Auth routes are **whitelist-restricted** — only `sign-in`, `sign-out`, `get-session` are accessible. All other auth routes return `403`.

### RBAC (Roles & Permissions)

Custom access control with three roles defined in `auth.ts`:

```typescript
// Permissions: project (create, share, update, delete)
const user    = ac.newRole({ project: ['create'] })
const admin   = ac.newRole({ project: ['create', 'update'], ...adminAc.statements })
const myCustomRole = ac.newRole({ project: ['create', 'update', 'delete'], user: ['ban'] })
```

Use `@Roles()` decorator with `UserRole` enum values:

```typescript
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/module/rbac/auth/entities/user.entity'

@Roles(UserRole.ADMIN)
```

### User Entity

Columns: `id`, `name`, `email`, `emailVerified`, `image`, `role` (UserRole enum), `banned`, `banReason`, `banExpires`, `username`, `displayUsername`, `createdAt`, `updatedAt`

Related entities: `Account` (OAuth linking), `Verification` (email verification)

### Middleware Modules

| Module | Token | Purpose |
|--------|-------|---------|
| `DatabaseModule` | - | TypeORM PostgreSQL, auto-loads entities, `synchronize` in non-production |
| `RedisModule` | `REDIS_CLIENT` | Raw ioredis client, exponential backoff retry |
| `CacheModule` | - | `@keyv/redis`, global cache |
| `MqttModule` | `MQTT_SERVICE` | MQTT microservice client |
| `StorageModule` | `MINIO_CLIENT` | MinIO/S3 operations (upload, download, presigned URLs) |

### Logging

Uses `nestjs-pino`:
- **Production**: log level `info`, no transport (structured JSON)
- **Development**: log level `debug`, `pino-pretty` with colors

## Environment Variables

Validated by **Zod** at startup via `env.validation.ts`. Invalid env vars cause immediate startup failure.

### Required

| Variable | Type | Description |
|----------|------|-------------|
| `BETTER_AUTH_SECRET` | `string` (min 1) | Auth secret key. Generate with `bun run db:secret` |

### Optional (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `local` | Environment: `local`, `development`, `production`, `test` |
| `PORT` | `30000` | Server port (1-65535) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `DB_NAME` | `aio` | PostgreSQL database name |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | — | Redis password (optional) |
| `MINIO_ENDPOINT` | `localhost:9000` | MinIO endpoint |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO secret key |
| `MINIO_BUCKET` | `default` | MinIO bucket name |
| `MQTT_BROKER_URL` | `mqtt://localhost:1883` | MQTT broker URL |
| `CORS_ORIGIN` | `http://localhost:40000` | CORS allowed origin |
| `BETTER_AUTH_URL` | `http://localhost:30000` | Better Auth base URL |
| `BETTER_AUTH_BASE_PATH` | `/api/v1/auth` | Auth routes base path |
| `UI_URL` | `http://localhost:40000` | Frontend URL for redirects |

### Environment Files

| File | Used By | Purpose |
|------|---------|---------|
| `.env.local` | `dev`, `dev:debug`, `preview` scripts | Local development |
| `.env.test` | `test*` scripts | Unit and E2E tests |
| `.env.production` | Docker / CI-CD | Production runtime |

## Scripts

```bash
# Development
bun run dev          # Start with --watch, reads .env.local
bun run dev:debug    # Start with --debug --watch
bun run preview      # Preview production build

# Build
bun run build        # nest build → dist/

# Database
bun run db:migrate   # Run Better Auth migrations
bun run db:secret    # Generate Better Auth secret

# Test
bun run test         # Jest, reads .env.test
bun run test:watch   # Jest watch mode
bun run test:cov     # Jest with coverage
bun run test:e2e     # E2E tests

# Code quality
bun run check        # Type-check all (vp check)
bun run fmt          # Format code (vp fmt --write)
bun run lint         # Lint + auto-fix (vp lint --fix)

# Cleanup
bun run clean        # Remove dist/
bun run cleanAll     # Remove node_modules/ + dist/
```

## Common Tasks

### Add a new protected route

```typescript
import { Session } from '@thallesp/nestjs-better-auth'
import { UserSession } from '@thallesp/nestjs-better-auth'

@Get('resource')
getResource(@Session() session: UserSession) {
  return { userId: session.user.id }
}
```

### Use role-based access control

```typescript
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/module/rbac/auth/entities/user.entity'

@Roles(UserRole.ADMIN)
someAdminRoute() { ... }
```

### Add a new middleware module

1. Create `src/module/middleware/<name>/<name>.module.ts`
2. Implement the module class decorated with `@Global()` if it should be app-wide
3. Add to imports in `app.module.ts`

### Configure open routes

Modify `authRouteWhitelist` in `auth.module.ts`:

```typescript
const authRouteWhitelist = ['sign-in', 'sign-out', 'get-session', 'sign-up']
```

### Access Redis in a service

```typescript
import { Inject } from '@nestjs/common'
import { Redis } from 'ioredis'

@Inject(REDIS_CLIENT)
private readonly redis: Redis
```
