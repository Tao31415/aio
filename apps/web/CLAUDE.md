# Web (Nuxt 4)

This file provides guidance to Claude Code when working in `apps/web/`.

## Project Structure

```
apps/web/
├── app/
│   ├── pages/                    # 页面文件
│   │   ├── index.vue            # 首页
│   │   ├── login.vue            # 登录页
│   │   ├── register.vue         # 注册页
│   │   ├── dashboard/           # 仪表盘页面
│   │   ├── users/               # 用户管理
│   │   ├── settings/            # 设置页面
│   │   ├── profile/            # 个人资料
│   │   ├── messages/           # 消息中心
│   │   └── analytics/          # 数据分析
│   ├── components/              # 组件目录
│   │   ├── common/              # 通用组件
│   │   │   ├── AppHeader.vue    # 头部
│   │   │   ├── AppSidebar.vue   # 侧边栏
│   │   │   ├── AppFooter.vue    # 底部
│   │   │   ├── ToastContainer.vue
│   │   │   ├── AppTabs.vue
│   │   │   └── CommandMenu.vue
│   │   ├── dashboard/          # 仪表盘组件
│   │   │   ├── QuickActions.vue
│   │   │   ├── ChartPie.vue
│   │   │   └── CalendarWidget.vue
│   │   └── AuthShell.vue
│   ├── layouts/                 # 布局文件
│   │   ├── default.vue          # 默认布局
│   │   ├── login.vue            # 登录布局
│   │   └── auth.vue             # 认证布局
│   ├── assets/                  # 静态资源
│   │   └── css/
│   │       └── main.css
│   ├── composables/             # 组合式函数
│   ├── stores/                  # Pinia 状态管理
│   ├── utils/                   # 工具函数
│   └── app.vue                  # 根组件
├── nuxt.config.ts               # Nuxt 配置
└── env.validation.ts            # 环境变量校验
```

## Architecture

### Tech Stack

- **Framework**: Nuxt 4 (Vue 3 + Nitro)
- **UI**: @nuxt/ui v4 (Tailwind CSS)
- **State**: Pinia
- **Auth**: better-auth/client
- **Utils**: @aio/utils (shared package)

### Port

- **Development**: 40000
- **Production**: 4000

### API Integration

Web 通过 `useFetch` 访问 `http://localhost:30000` 的 API 接口：

- Base URL 配置在 `runtimeConfig.public.apiBase`
- API 已在 CORS 中允许 `http://localhost:40000`

### Authentication

使用 better-auth/client，配置在 `nuxt.config.ts` 中通过 `@onmax/nuxt-better-auth` 模块。

### State Management

使用 Pinia + pinia-plugin-persistedstate 持久化：

- 用户状态
- 应用设置
- UI 状态

## Logging

使用 `useLogger` composable 记录客户端日志：

```typescript
const logger = useLogger('auth.global')

// 第一个参数是 metadata/extra data，第二个参数是 message
logger.info(
  {
    path: to.fullPath,
  },
  'Unauthorized access to protected route, redirecting to login'
)

// 日志级别：info | warn | error | debug | trace | fatal
logger.warn({ context: 'Auth' }, 'Session expired')
logger.error({ err }, 'Failed to fetch user data')
```

**注意**：

- 第一个参数必须是对象（metadata），第二个参数是字符串（message）
- 使用 `err` 作为 error 对象的 key 可以被 pino 特殊处理
- Context 命名约定：使用点号分隔，如 `auth.global`、`mqtt.publish`、`api.users`

## Environment Variables

### Required

无

### Optional (with defaults)

| Variable                | Default                  | Description  |
| ----------------------- | ------------------------ | ------------ |
| `NUXT_PUBLIC_API_BASE`  | `http://localhost:30000` | API 基础 URL |
| `NUXT_PUBLIC_LOG_LEVEL` | `debug`                  | 日志级别     |
| `NUXT_PUBLIC_ENV`       | `local`                  | 环境标识     |

## Common Tasks

### Add a new page

1. 在 `app/pages/` 下创建 `.vue` 文件
2. 使用 `@nuxt/ui` 组件构建 UI

### Use Pinia store

```typescript
import { defineStore } from 'pinia'

export const useMyStore = defineStore('my', {
  state: () => ({
    data: [] as string[],
  }),
  actions: {
    async fetchData() {
      const { data } = await useFetch('/api/v1/endpoint')
      this.data = data.value
    },
  },
})
```

### Access API

```typescript
const { data, error } = await useFetch('/api/v1/resource', {
  headers: useAuthHeaders(),
})
```
