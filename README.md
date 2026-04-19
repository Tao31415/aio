# AIO

## 环境准备

### 1. 安装 Mise

本项目使用 [Mise](https://mise.jdx.dev) 管理工具版本。进入项目目录后执行：

```bash
mise install
```

Mise 会自动读取 `mise.toml` 并下载对应版本的 `bun` 和 `vp`。

### 2. 安装依赖

```bash
bun install
```

**注意**：必须使用 `bun install`，不可使用 npm、pnpm、yarn 等其他包管理工具。

### 3. 配置环境变量

分别将 `apps/api` 和 `apps/web` 目录下的 `.env.example` 重命名为 `.env.local`：

```bash
mv apps/api/.env.example apps/api/.env.local
mv apps/web/.env.example apps/web/.env.local
```

然后根据本地环境修改 `.env.local` 中的配置。

## 项目结构

```
aio/
├── apps/
│   ├── api/          # NestJS 后端服务 (端口 30000)
│   └── web/          # Nuxt 4 前端应用 (端口 40000)
├── packages/
│   └── utils/        # 共享工具包 (@aio/utils)
├── deploy/           # Docker 部署配置
├── scripts/          # 辅助脚本
├── Makefile         # 部署自动化脚本
├── .bunfig.toml     # Bun 配置（镜像源、链接器）
└── .dockerignore    # Docker 构建排除文件
```

### 目录功能说明

| 目录             | 功能                           | 技术栈                        | 端口  |
| ---------------- | ------------------------------ | ----------------------------- | ----- |
| `apps/api`       | RESTful API 服务，提供数据接口 | NestJS + TypeORM + PostgreSQL | 30000 |
| `apps/web`       | 前端 Web 应用，用户界面        | Nuxt 4 (Vue 3)                | 40000 |
| `packages/utils` | 跨项目共享的工具函数           | TypeScript                    | —     |

### 依赖关系

- `apps/web` → `packages/utils` — Web 直接引用共享工具
- `apps/api` → `packages/utils` — API 直接引用共享工具
- `apps/web` → `apps/api` — Web 通过 HTTP 请求调用 API 接口

## 开发

在项目根目录执行：

```bash
bun run dev
```

这会同时启动三个服务的热更新：

- **API** (NestJS) — 端口 30000
- **Web** (Nuxt) — 端口 40000
- **Utils** — 包构建监听模式

Web 前端通过 `useFetch` 访问 `http://localhost:30000` 的 API 接口。API 已配置 CORS，允许 `http://localhost:40000` 和 `http://127.0.0.1:40000` 跨域请求。

## 命令

在根目录执行以下命令：

| 命令                | 说明                      |
| ------------------- | ------------------------- |
| `bun run dev`       | 启动所有服务热更新        |
| `bun run check`     | 类型检查                  |
| `bun run fmt`       | 代码格式化                |
| `bun run lint`      | 代码检查                  |
| `bun run build`     | 编译所有项目（并行）      |
| `bun run cleanAll`  | 清理所有构建产物和依赖    |
| `bun run reinstall` | 清理后重新安装依赖        |
| `bun run kill`      | 终止 30000/40000 端口进程 |

单独运行某个服务：

```bash
bun run dev:api      # 仅启动 API (port 30000)
bun run dev:web      # 仅启动 Web (port 40000)
bun run dev:utils    # 仅启动 Utils 构建监听
```

## Makefile 命令

项目提供 Makefile 简化常见操作：

```bash
make init                  # 初始化项目（安装 mise/bun/依赖）
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

### 并行构建

`make deploy-build` 会并行构建 API 和 Web Docker 镜像，通过 `-j` 参数控制并行任务数：

```bash
make -j4 deploy-build   # 最多同时运行 4 个任务（推荐）
make -j deploy-build     # 不限制并行任务数
```

**注意**：由于只有 2 个 Docker 构建任务（api 和 web），`-j4` 和 `-j10` 的效果相同，因为瓶颈不在并行任务数，而在 Docker 构建本身的速度。

## 推荐 VSCode 插件

项目已在 `.vscode/extensions.json` 中配置了推荐插件，首次打开时 VSCode 会提示安装：

| 插件                              | 说明                                   |
| --------------------------------- | -------------------------------------- |
| VoidZero.vite-plus-extension-pack | 包含 Oxc、Vue、TypeScript 等开发工具集 |
| cweijan.dbclient-jdbc             | 数据库客户端（支持 PostgreSQL）        |
| humao.rest-client                 | API 接口调试（HTTP 文件）              |
| antfu.iconify                     | 图标搜索                               |
| lokalise.i18n-ally                | 国际化辅助                             |

安装方式：VSCode 左侧 Extensions 面板 → 搜索 "@recommended"

## Lint 与Fmt 原理

项目使用 [VoidZero Oxc](https://oxc.rs/) 作为统一的 Lint 和 Format 引擎，通过 `vp` (vite-plus) 调用。

### Format (代码格式化)

通过 `vp fmt` 执行，基于 Oxc 的格式化配置（定义在 `vite.config.ts` 的 `fmt` 字段）：

- 单引号 `singleQuote: true`
- 无分号 `semi: false`
- 2 空格缩进 `tabWidth: 2`
- 行宽 80 字符 `printWidth: 80`
- Vue 文件 script/style 缩进 `vueIndentScriptAndStyle: true`

VSCode 中配合 `oxc.oxc-vscode` 插件，保存文件时自动格式化（`editor.formatOnSave: true`）。

### Lint (代码检查)

通过 `vp check --fix` 执行，基于 Oxc 的 Lint 规则（定义在 `vite.config.ts` 的 `lint` 字段）：

- **插件链**: oxc + eslint + typescript + vue + import + unicorn + vitest
- **严格程度**:
  - `correctness` → `error`（必定报错）
  - `suspicious` → `warn`（警告）
  - `perf` → `warn`（性能警告）
  - `style/pedantic` → `off`（关闭）

- **类型检查**: 开启 `typeAware: true` 和 `typeCheck: true`，Lint 会进行完整的 TypeScript 类型检查

- **规则示例**:
  - TypeScript 相关：`no-unsafe-assignment`、`no-unsafe-call`、`typescript/await-thenable`
  - 通用：`no-debugger`、`no-unused-vars`、`prefer-const`

### Git Hooks

项目配置了 pre-commit hook（`.vite-hooks/pre-commit`），在 `git commit` 时自动对暂存区文件执行 `vp check --fix`，确保提交的代码符合规范。

## Docker 部署

项目使用 Docker 多阶段构建：

### 构建产物

| 服务  | 构建产物路径        | 运行时入口                      |
| ----- | ------------------- | ------------------------------- |
| `api` | `apps/api/dist/`    | `node dist/main.js`             |
| `web` | `apps/web/.output/` | `node .output/server/index.mjs` |

### 构建与部署

```bash
# 1. 安装 mise（如未安装）
curl https://mise.run/zsh | sh

# 2. 初始化项目
make init

# 3. 编译项目
make build

# 4. 构建 Docker 镜像
make deploy-build

# 5. 部署到 Docker
make deploy-start
# 或者一步完成：make deploy
```

### 环境划分

- **本地开发**: API 使用 `http://localhost:30000`，Web 使用 `http://localhost:40000`，浏览器直接跨域访问 API
- **Docker 部署**: API 容器监听 `3000`，Web 容器监听 `4000`，浏览器应通过 Nginx 入口访问 `http://localhost`

### 生产环境变量约定

Docker 形态下，浏览器看到的入口应是 Nginx，而不是容器内部服务名。因此生产环境变量要按“浏览器真实访问地址”配置：

- `apps/api/.env.production`
  - `CORS_ORIGIN`: 填浏览器实际访问的前端 Origin，例如 `http://localhost` 或 `https://app.example.com`
  - `BETTER_AUTH_URL`: 填 Better Auth 对外可访问地址，通常与 Nginx 公开入口一致，例如 `http://localhost` 或 `https://app.example.com`
- `apps/web/.env.production`
  - `NUXT_PUBLIC_API_BASE`: 填前端在浏览器中实际请求的 API 基础地址，当前 Nginx 方案下通常为 `http://localhost` 或 `https://app.example.com`

如果后续改成真实域名部署，至少要在一次变更中同时更新以下配置：

- `apps/api/.env.production` 中的 `CORS_ORIGIN`
- `apps/api/.env.production` 中的 `BETTER_AUTH_URL`
- `apps/web/.env.production` 中的 `NUXT_PUBLIC_API_BASE`

建议同时复核以下配置项：

- `BETTER_AUTH_BASE_PATH`: 确认仍然与 Nginx 转发路径一致，默认是 `/api/v1/auth`
- `PORT`: API 容器应监听 `3000`，Web 容器应监听 `4000`
- `NUXT_PUBLIC_MOCK`: 生产环境应保持 `false`
- `deploy/.env` 中的 `NGINX_PORT` / `NGINX_SSL_PORT`: 确认对外端口与域名接入方案一致
- `docker-compose.yml` 中 `api` / `web` 的 `ports`: 如果希望只能通过 Nginx 访问，可考虑取消对宿主机的直接暴露

### 域名部署检查清单

切换到真实域名或 HTTPS 前，建议至少检查以下内容：

- Nginx `server_name` 是否已改为真实域名
- `CORS_ORIGIN`、`BETTER_AUTH_URL`、`NUXT_PUBLIC_API_BASE` 是否已同步切换为真实域名
- Better Auth Cookie 与 HTTPS 策略是否满足生产要求
- 前端是否仍然错误指向 `localhost`
- API 和 Web 是否需要继续保留 `3000` / `4000` 的宿主机端口映射

### Docker 服务

项目 docker-compose 包含以下服务：

- **nginx** — 反向代理（端口 80）
- **api** — NestJS API（端口 3000）
- **web** — Nuxt Web（端口 4000）
- **postgres** — PostgreSQL 主数据库（端口 5432）
- **timescale** — TimescaleDB 时序数据库（端口 5433）
- **minio** — 对象存储（端口 9000/9001）
- **mosquitto** — MQTT Broker（端口 1883/1884/8883）
- **dozzle** — Docker 日志查看（端口 8080）

详细配置见 `deploy/` 目录。

### 主要访问路由

Docker 部署完成后，浏览器通常通过 Nginx 入口访问以下路径：

| 路径 | 功能 | 说明 |
| ---- | ---- | ---- |
| `/` | Web 前端入口 | 后台管理界面主入口 |
| `/api/` | API 入口 | 前端请求后端接口的统一前缀 |
| `/docs` | Swagger 文档 | 查看 NestJS API 文档 |
| `/docs/auth/` | Better Auth 文档 | 查看 Better Auth Reference/OpenAPI |
| `/auth` | 认证文档短链 | 会重定向到 `/docs/auth/` |
| `/dozzle/` | 容器日志界面 | 查看 Docker 容器运行日志 |
| `/health` | 网关健康检查 | 返回 Nginx 自身健康状态 |

补充说明：

- `/auth` 不是登录页面，而是认证文档跳转入口
- Better Auth 实际接口仍位于 `/api/v1/auth/*`
- `/health` 只代表 Nginx 可用，不代表 API 和数据库全部健康
- 更完整的路由说明和转发目标见 [deploy/README.md](file:///Users/mac/Dev/Starter/aio/deploy/README.md)
