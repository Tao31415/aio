# API (NestJS)

This file provides guidance to Claude Code when working in `apps/api/`.

## Project Overview

**模块化设计的后端 API**，提供设备监控、数据采集、用户认证等功能。

核心模块：

- **RBAC** — 用户认证与基于角色的权限控制
- **Device** — 设备管理、设备状态监控、设备统计
- **Upload** — 文件上传服务
- **Middleware** — 数据库、Redis、MQTT、Storage 等中间件集成

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
│   │   ├── device/
│   │   │   ├── device.controller.ts       # 设备 CRUD API
│   │   │   ├── device-statistics.controller.ts  # 设备统计 API
│   │   │   ├── device.service.ts          # 设备业务逻辑
│   │   │   ├── device-status.service.ts   # 设备状态服务
│   │   │   ├── device-status.scheduler.ts # 设备状态定时任务
│   │   │   ├── device.module.ts           # Device module
│   │   │   └── entities/                   # Device, DeviceStatus, AlarmRecord 等
│   │   ├── upload/
│   │   │   └── upload.module.ts           # 文件上传模块
│   │   └── log/                           # Pino logger configuration
│   └── common/
│       └── decorators/
│           └── roles.decorator.ts         # @Roles() decorator for RBAC
└── better-auth_migrations/                 # Database migrations
```

## Architecture

### API Design

- **Base URL**: `/api`
- **Versioning**: URI-based (`/v1/xxx`), default version `1`
- **Swagger Docs**: `/api/docs` (cookie auth enabled)
- **Port**: 30000 (local), 3000 (production)
- **CORS**: Allows `http://localhost:40000` and `http://127.0.0.1:40000`

### Device Module

设备模块是核心业务模块，包含以下功能：

| 功能         | 说明                       |
| ------------ | -------------------------- |
| 设备管理     | 设备的增删改查             |
| 设备状态监控 | 定时更新设备在线/离线状态  |
| 设备统计     | 设备数量、在线率等统计数据 |
| 报警记录     | 设备报警信息记录与查询     |

主要 Entity：

- `Device` — 设备基本信息
- `DeviceStatus` — 设备状态记录
- `AlarmRecord` — 报警记录

### Better Auth (Authentication)

Uses `@thallesp/nestjs-better-auth` wrapping `better-auth` with:

| Feature       | Config                                      |
| ------------- | ------------------------------------------- |
| Sessions      | Redis-backed, 7-day expiry, 5-min fresh age |
| Rate Limiting | 100 req / 60s, stored in Redis              |
| Multi-Session | Max 10 sessions per user                    |
| Cookie Cache  | 5-min TTL for reduced DB calls              |
| CORS Origins  | localhost:40000, 127.0.0.1:40000, UI_URL    |

**Auth Base Path**: `/api/v1/auth` (configurable via `BETTER_AUTH_BASE_PATH`)

Auth routes are **whitelist-restricted** — only these routes are accessible, all others return `403`:

```typescript
const authRouteWhitelist = [
  'sign-in',
  'sign-out',
  'get-session',
  'ok', // Health check
  'is-username-available', // Username availability check
  'sign-up/email', // Email registration
  'update-user', // Update user
  'admin', // Admin endpoints
]
```

### RBAC (Roles & Permissions)

Custom access control with three roles defined in `auth.ts`:

```typescript
// Permissions: project (create, share, update, delete)
const user = ac.newRole({ project: ['create'] })
const admin = ac.newRole({
  project: ['create', 'update'],
  ...adminAc.statements,
})
const myCustomRole = ac.newRole({
  project: ['create', 'update', 'delete'],
  user: ['ban'],
})
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

### UserController Routes (`/users`)

| Route             | Method | Auth     | Description             |
| ----------------- | ------ | -------- | ----------------------- |
| `/users/me`       | GET    | Required | Returns current session |
| `/users/public`   | GET    | None     | Public route            |
| `/users/optional` | GET    | Optional | Returns auth status     |

### Middleware Modules

| Module           | Token          | Purpose                                                                  |
| ---------------- | -------------- | ------------------------------------------------------------------------ |
| `DatabaseModule` | -              | TypeORM PostgreSQL, auto-loads entities, `synchronize` in non-production |
| `RedisModule`    | `REDIS_CLIENT` | Raw ioredis client, exponential backoff retry                            |
| `CacheModule`    | -              | `@keyv/redis`, global cache                                              |
| `MqttModule`     | `MQTT_SERVICE` | MQTT microservice client + HTTP REST controller                          |
| `StorageModule`  | `MINIO_CLIENT` | MinIO/S3 operations (currently disabled/commented out)                   |

### MQTT Dual-Mode Architecture

`MqttModule` operates in two modes simultaneously:

1. **NestJS Microservice** — EventPattern handlers via `@nestjs/microservices`
2. **HTTP REST Controller** (`MqttHttpController`):

| Route            | Method | Description                                    |
| ---------------- | ------ | ---------------------------------------------- |
| `/mqtt/publish`  | POST   | Publish MQTT message to a topic                |
| `/mqtt/messages` | GET    | Query historical messages (topic + time range) |

Messages are persisted to PostgreSQL via `MqttMessageEntity`.

### Path Aliases

Available for imports throughout the codebase:

| Alias         | Maps to                              |
| ------------- | ------------------------------------ |
| `@src/*`      | `./src/*`                            |
| `@auth/*`     | `./src/module/rbac/auth/*`           |
| `@database/*` | `./src/module/middleware/database/*` |
| `@log/*`      | `./src/module/log/*`                 |
| `@mqtt/*`     | `./src/module/middleware/mqtt/*`     |
| `@redis/*`    | `./src/module/middleware/redis/*`    |
| `@storage/*`  | `./src/module/middleware/storage/*`  |
| `@user/*`     | `./src/module/rbac/user/*`           |

### Security Configuration

**CORS** (`main.ts`):

```typescript
app.enableCors({
  origin: [
    'http://localhost:40000',
    'http://127.0.0.1:40000',
    'http://web:4000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Cookie'],
})
```

**Secure Cookies**:

- Only enabled in production (`useSecureCookies: isProduction`)
- Cookie prefix: `aio`
- IPv6 subnet limiting: `/64`

**Rate Limiting**:

- 100 requests per 60-second window
- Stored in Redis via `secondary-storage`
- Supports `x-forwarded-for` and `x-real-ip` headers

**Body Parser Limits**:

- JSON: 10mb
- URL-encoded: 10mb

### Logging

Uses `nestjs-pino`:

- **Production**: log level `info`, no transport (structured JSON)
- **Development**: log level `debug`, `pino-pretty` with colors

### Logger Injection (Pino)

**直接注入 `PinoLogger` 并手动设置 context**（推荐方式）：

```typescript
import { PinoLogger } from 'nestjs-pino'

@Injectable()
export class MyService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(MyService.name)
    // 使用方式：
    this.logger.info('message') // info 级别
    this.logger.error('message') // error 级别
    this.logger.warn('message') // warn 级别
    this.logger.debug('message') // debug 级别

    // 创建带 context 的子 logger
    const childLogger = this.logger.child({ context: 'MyService' })
  }
}
```

**注意**：

- 直接注入 `PinoLogger`，不要使用 `@InjectPinoLogger` 装饰器（v4 有模块依赖问题）
- 必须在构造函数中调用 `this.logger.setContext(Class.name)` 设置上下文
- pino 没有 `log()` 方法，使用 `info()` 替代
- 推荐使用 `.child()` 创建带 context 的 logger 方便追踪

## Environment Variables

Validated by **Zod** at startup via `env.validation.ts`. Invalid env vars cause immediate startup failure.

### Required (no defaults — startup fails if missing)

| Variable             | Type              | Description                                        |
| -------------------- | ----------------- | -------------------------------------------------- |
| `DB_HOST`            | `string`          | PostgreSQL host                                    |
| `DB_PORT`            | `number`          | PostgreSQL port                                    |
| `DB_USER`            | `string`          | PostgreSQL username                                |
| `DB_PASSWORD`        | `string`          | PostgreSQL password                                |
| `DB_NAME`            | `string`          | PostgreSQL database name                           |
| `REDIS_HOST`         | `string`          | Redis host                                         |
| `REDIS_PORT`         | `number`          | Redis port                                         |
| `REDIS_PASSWORD`     | `string`          | Redis password                                     |
| `MINIO_ENDPOINT`     | `string`          | MinIO endpoint (host:port format)                  |
| `MQTT_BROKER_URL`    | `string`          | MQTT broker URL                                    |
| `BETTER_AUTH_SECRET` | `string` (min 32) | Auth secret key. Generate with `bun run db:secret` |

### Optional (has defaults)

| Variable                | Default                  | Description                                               |
| ----------------------- | ------------------------ | --------------------------------------------------------- |
| `NODE_ENV`              | `local`                  | Environment: `local`, `development`, `production`, `test` |
| `PORT`                  | `30000`                  | Server port (1-65535)                                     |
| `MINIO_ACCESS_KEY`      | `minioadmin`             | MinIO access key                                          |
| `MINIO_SECRET_KEY`      | `minioadmin`             | MinIO secret key                                          |
| `MINIO_BUCKET`          | `default`                | MinIO bucket name                                         |
| `CORS_ORIGIN`           | `http://localhost:40000` | CORS allowed origin                                       |
| `BETTER_AUTH_URL`       | `http://localhost:30000` | Better Auth base URL                                      |
| `BETTER_AUTH_BASE_PATH` | `/api/v1/auth`           | Auth routes base path                                     |

### Environment Files

| File              | Used By                               | Purpose            |
| ----------------- | ------------------------------------- | ------------------ |
| `.env.local`      | `dev`, `dev:debug`, `preview` scripts | Local development  |
| `.env.test`       | `test*` scripts                       | Unit and E2E tests |
| `.env.production` | Docker / CI-CD                        | Production runtime |

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

### Admin 用户创建说明

Better Auth 的 `admin.createUser` 要求 `email` 字段，但实际业务中不需要使用 email。

**创建 admin 用户的方式**：

1. **通过 seed 接口**：调用 `POST /api/v1/seed` 会自动创建一个 admin 用户（`admin@example.com`）
2. **手动创建用户**：注册用户后，需要手动通过数据库将 `role` 字段设置为 `'admin'`，因为 Better Auth 不支持通过注册接口创建 admin 用户

### Add a new middleware module

1. Create `src/module/middleware/<name>/<name>.module.ts`
2. Implement the module class decorated with `@Global()` if it should be app-wide
3. Add to imports in `app.module.ts`

### Add a new entity

**必须显式 import 到对应 module**，否则 TypeORM 无法自动加载 entity（测试环境下 `synchronize: true` 不会自动创建表）：

```typescript
// 1. 创建 entity 文件
// src/module/middleware/mqtt/entities/my-entity.entity.ts
@Entity('my_table')
export class MyEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string
}

// 2. 在 module 中显式 import
@Module({
  imports: [TypeOrmModule.forFeature([MyEntity])],
  // ...
})
export class MqttModule {}
```

**注意**：即使使用 glob pattern 匹配 entities，entity 文件也必须被显式 import 到某个 module 的 `forFeature()` 中，TypeORM 才能正确识别。

### Configure open routes

Modify `authRouteWhitelist` in `auth.module.ts` (whitelist-restricted — only listed routes are accessible):

```typescript
const authRouteWhitelist = [
  'sign-in',
  'sign-out',
  'get-session',
  'ok',
  'is-username-available',
  'sign-up/email',
  'update-user',
  'admin',
]
```

### Access Redis in a service

```typescript
import { Inject } from '@nestjs/common'
import { Redis } from 'ioredis'

@Inject(REDIS_CLIENT)
private readonly redis: Redis
```
