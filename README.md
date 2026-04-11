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
│   ├── api/          # NestJS 后端服务 (端口 3000)
│   └── web/          # Nuxt 4 前端应用 (端口 4000)
├── packages/
│   └── utils/        # 共享工具包 (@aio/utils)
├── deploy/           # Docker 部署配置
└── scripts/          # 辅助脚本
```

### 目录功能说明

| 目录             | 功能                           | 技术栈                        | 端口 |
| ---------------- | ------------------------------ | ----------------------------- | ---- |
| `apps/api`       | RESTful API 服务，提供数据接口 | NestJS + TypeORM + PostgreSQL | 3000 |
| `apps/web`       | 前端 Web 应用，用户界面        | Nuxt 4 (Vue 3)                | 4000 |
| `packages/utils` | 跨项目共享的工具函数           | TypeScript                    | —    |

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

- **API** (NestJS) — 端口 3000
- **Web** (Nuxt) — 端口 4000
- **Utils** — 包构建监听模式

Web 前端通过 `useFetch` 访问 `http://localhost:3000` 的 API 接口。API 已配置 CORS，允许 `http://localhost:4000` 和 `http://127.0.0.1:4000` 跨域请求。

## 命令

在根目录执行以下命令：

| 命令            | 说明               |
| --------------- | ------------------ |
| `bun run dev`   | 启动所有服务热更新 |
| `bun run check` | 类型检查           |
| `bun run fmt`   | 代码格式化         |
| `bun run lint`  | 代码检查           |

单独运行某个服务：

```bash
bun run dev:api      # 仅启动 API (port 3000)
bun run dev:web      # 仅启动 Web (port 4000)
bun run dev:utils    # 仅启动 Utils 构建监听
```

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

## 打包与 Docker

打包与 Docker 部署方案待定。
