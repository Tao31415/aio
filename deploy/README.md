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

## MinIO

- API 地址: `http://localhost:9000`
- Console 地址: `http://localhost:9001`
- 默认用户/密码: `minioadmin` / `minioadmin`

## Mosquitto

MQTT broker 支持三种协议：

- MQTT over TCP: 端口 1883
- MQTT over WebSocket: 端口 1884
- MQTTS (TLS): 端口 8883

生产环境请修改 `mosquitto/config/mosquitto.conf` 中的 `allow_anonymous false` 并配置用户名密码。

## SSL 证书

生产环境请将证书放入 `nginx/ssl/` 目录，并取消 `nginx/conf.d/default.conf` 中 HTTPS server 块的注释。
