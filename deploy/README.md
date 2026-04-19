# Deploy

Docker 部署配置目录。

## 构建产物

| 服务    | 构建产物路径           | 运行时入口                      |
| ------- | ---------------------- | ------------------------------- |
| `api`   | `apps/api/dist/`       | `node dist/main.js`             |
| `web`   | `apps/web/.output/`    | `node .output/server/index.mjs` |
| `utils` | `packages/utils/dist/` | 被 api/web 引用，无需独立运行   |

## 服务架构

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (端口 80)  │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼─────┐             ┌─────▼─────┐
        │   Web     │             │   API     │
        │  (Nuxt)   │             │ (NestJS)  │
        │ :3000     │             │  :3000    │
        └─────┬─────┘             └─────┬─────┘
              │                         │
              │                  ┌──────┴──────┐
              │                  │             │
        ┌─────▼─────┐      ┌────▼────┐  ┌────▼─────┐
        │ TimescaleDB│      │PostgreSQL│  │   MinIO  │
        │  :5432     │      │  :5432   │  │  :9000   │
        └───────────┘      └──────────┘  └──────────┘
                                           ┌────▼─────┐
                                           │ Mosquitto │
                                           │  :1883   │
                                           └──────────┘
```

## 环境变量

复制 `.env.example` 为 `.env` 并修改：

```bash
cp deploy/.env.example deploy/.env
```

主要配置项：

| 变量                  | 说明                       | 默认值        |
| --------------------- | -------------------------- | ------------- |
| `DB_USER`             | PostgreSQL 用户名          | postgres      |
| `DB_PASSWORD`         | PostgreSQL 密码            | postgres      |
| `DB_NAME`             | PostgreSQL 数据库名        | aio           |
| `DB_PORT`             | PostgreSQL 端口            | 5432          |
| `TS_DB_*`             | TimescaleDB 时序数据库配置 | 同 PostgreSQL |
| `MINIO_ROOT_USER`     | MinIO 管理用户             | minioadmin    |
| `MINIO_ROOT_PASSWORD` | MinIO 管理密码             | minioadmin    |
| `MOSQUITTO_PORT`      | MQTT 端口                  | 1883          |
| `API_PORT`            | API 外部端口               | 3000          |
| `NGINX_PORT`          | HTTP 端口                  | 80            |
| `DOZZLE_PORT`         | Dozzle 日志端口            | 8080          |

## 构建

在项目根目录执行：

```bash
bun run build          # 构建所有项目 (utils + api + web)
bun run build:api      # 仅构建 API
bun run build:web      # 仅构建 Web
```

## 启动

```bash
# 启动所有服务 (后台运行)
docker compose -f deploy/docker-compose.yml up -d

# 查看日志
docker compose -f deploy/docker-compose.yml logs -f

# 停止所有服务
docker compose -f deploy/docker-compose.yml down

# 清空 Docker 构建缓存
docker builder prune -af
```

## 端口映射

| 服务      | 内部端口       | 外部端口       | 说明                 |
| --------- | -------------- | -------------- | -------------------- |
| nginx     | 80             | 80             | HTTP 反向代理        |
| api       | 3000           | 3000           | REST API             |
| postgres  | 5432           | 5432           | 主数据库             |
| timescale | 5432           | 5433           | 时序数据库           |
| minio     | 9000/9001      | 9000/9001      | 对象存储/API+Console |
| mosquitto | 1883/1884/8883 | 1883/1884/8883 | MQTT Broker          |
| dozzle    | 8080           | 8080           | Docker 日志查看      |

## Nginx 路由

浏览器访问 Docker 部署时，推荐统一从 Nginx 入口进入，例如 `http://localhost`。当前 `deploy/nginx/conf.d/default.conf` 中的主要路由如下：

| 路径 | 功能 | 转发目标 | 说明 |
| ---- | ---- | -------- | ---- |
| `/` | Web 前端首页和 SPA 路由 | `web:4000` | 前端页面、静态资源、客户端路由都经由此入口 |
| `/api/` | API 请求入口 | `api:3000` | 所有后端接口与 Better Auth 接口都从这里进入 |
| `/docs` | Swagger 文档 | `api/api/docs` | 查看 NestJS API 文档 |
| `/docs/auth/` | Better Auth OpenAPI / Reference | `api/api/v1/auth/reference` | 查看 Better Auth 路由参考文档 |
| `/auth` | Better Auth 文档短链 | 301 到 `/docs/auth/` | 便于快速跳转到认证文档 |
| `/auth/` | Better Auth 文档短链 | 301 到 `/docs/auth/` | 与 `/auth` 保持一致 |
| `/dozzle/` | Docker 日志查看 | `dozzle:8080` | 查看容器运行日志，支持流式输出 |
| `/dozzle` | Dozzle 短链 | 301 到 `/dozzle/` | 统一补齐末尾斜杠 |
| `/health` | Nginx 健康检查 | Nginx 本地返回 | 返回 `healthy`，用于快速确认网关可用 |

### 路由使用说明

- `/` 是用户访问后台管理系统的主入口
- `/api/` 是前端调用后端的统一入口，浏览器不应直接使用容器内部地址如 `http://api:3000`
- `/docs` 适合联调 REST API
- `/docs/auth/` 适合查看 Better Auth 路由、参数和返回结构
- `/auth` 只是文档跳转入口，不是登录页面，也不是实际认证 API 前缀
- `/dozzle/` 面向运维和调试场景，不建议在公网无保护暴露
- `/health` 只代表 Nginx 网关存活，不代表 API、数据库、Redis 等依赖全部正常

### 实际访问示例

```text
http://localhost/              # Web 前端
http://localhost/api/v1/users  # API 示例
http://localhost/docs          # Swagger 文档
http://localhost/docs/auth/    # Better Auth 文档
http://localhost/dozzle/       # 容器日志
http://localhost/health        # 网关健康检查
```

### 认证相关说明

- Better Auth 的真实接口路径仍然是 `/api/v1/auth/*`
- 前端在 Docker 环境下应通过 `NUXT_PUBLIC_API_BASE=http://localhost` 访问认证接口
- API 侧 `BETTER_AUTH_URL` 应与浏览器实际访问入口一致，例如 `http://localhost` 或未来的真实域名
- 如果切换到真实域名，必须同步修改 `CORS_ORIGIN`、`BETTER_AUTH_URL` 和 `NUXT_PUBLIC_API_BASE`

## MinIO

- API 地址: `http://localhost:9000`
- Console 地址: `http://localhost:9001`
- 默认用户/密码: `minioadmin` / `minioadmin`

## Dozzle

实时查看所有 Docker 容器日志的 Web 界面：

- 地址: `http://localhost:8080`
- 无需配置，直接连接 Docker Socket
- 支持搜索、过滤、下载日志

## Mosquitto

MQTT broker 支持三种协议：

- MQTT over TCP: 端口 1883
- MQTT over WebSocket: 端口 1884
- MQTTS (TLS): 端口 8883

生产环境请修改 `mosquitto/config/mosquitto.conf` 中的 `allow_anonymous false` 并配置用户名密码。

## SSL 证书

生产环境请将证书放入 `nginx/ssl/` 目录，并取消 `nginx/conf.d/default.conf` 中 HTTPS server 块的注释。
