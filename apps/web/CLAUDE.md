# Web (Nuxt 4)

This file provides guidance to Claude Code when working in `apps/web/`.

## Project Overview

**Nuxt 4 前端应用**，为工业设备监控与数据采集平台提供 Web 界面。

主要功能：
- **设备管理** — 设备列表、详情查看、设备状态监控
- **数据查看** — 位移数据、图片、视频等传感器数据可视化
- **报警记录** — 设备报警信息查看与管理
- **用户认证** — 邮箱注册登录、社交登录

## Project Structure

```
apps/web/
├── app/
│   ├── pages/
│   │   ├── index.vue              # 首页（重定向到 /home）
│   │   ├── home.vue              # 首页布局（包含设备列表侧边栏）
│   │   ├── home/
│   │   │   ├── index.vue         # 首页（设备卡片概览）
│   │   │   └── [deviceId]/
│   │   │       ├── index.vue     # 设备详情首页
│   │   │       ├── basic.vue      # 设备基本信息
│   │   │       ├── alarm.vue      # 设备报警记录
│   │   │       └── data.vue      # 设备数据查看
│   │   ├── device/
│   │   │   └── index.vue         # 设备管理页面
│   │   ├── login/
│   │   │   └── index.vue         # 登录页
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── messages/
│   │   ├── settings/
│   │   └── analytics/
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppSidebar.vue
│   │   │   ├── AppFooter.vue
│   │   │   ├── AppTabs.vue
│   │   │   └── CommandMenu.vue
│   │   ├── dashboard/
│   │   ├── home/
│   │   └── AuthShell.vue
│   ├── layouts/
│   │   ├── default.vue            # 默认布局
│   │   ├── login.vue              # 登录布局（空布局）
│   │   ├── auth.vue               # 认证布局
│   │   ├── home.vue               # 首页布局（左侧设备列表）
│   │   └── dashboard.vue          # 仪表盘布局
│   ├── assets/
│   │   └── css/
│   │       └── main.css
│   ├── composables/               # 组合式函数
│   ├── stores/                    # Pinia 状态管理
│   ├── utils/                     # 工具函数
│   └── app.vue                    # 根组件
├── nuxt.config.ts                 # Nuxt 配置
└── env.validation.ts              # 环境变量校验
```

## Architecture

### Tech Stack

- **Framework**: Nuxt 4 (Vue 3 + Nitro)
- **UI**: @nuxt/ui v4 (Tailwind CSS)
- **State**: Pinia + pinia-plugin-persistedstate
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

## Toast Notifications

使用 Nuxt UI 的 `useToast` 显示操作反馈：

```typescript
const toast = useToast()

// 显示成功提示
toast.add({
  title: '操作成功',
  color: 'success',
  icon: 'i-lucide-check-circle',
  duration: 3000,
})

// 显示错误提示
toast.add({
  title: '操作失败',
  description: '请稍后重试',
  color: 'error',
  icon: 'i-lucide-alert-circle',
  duration: 5000,
})

// 清除所有 toast
toast.clear()
```

**方法**：`add()`、`update()`、`remove()`、`clear()`

**注意**：

- `<UToast />` 组件已在 `app.vue` 中全局注册，无需手动添加
- `title` 为必填，`description` 和 `icon` 可选
- `duration` 默认 5000ms，设为 0 则不自动关闭

## Environment Variables

### Required

无

### Optional (with defaults)

| Variable                | Default                  | Description  |
| ----------------------- | ------------------------ | ------------ |
| `NUXT_PUBLIC_API_BASE`  | `http://localhost:30000` | API 基础 URL |
| `NUXT_PUBLIC_LOG_LEVEL` | `debug`                  | 日志级别     |
| `NUXT_PUBLIC_ENV`       | `local`                  | 环境标识     |

## Better Auth API 响应处理

详细规范见 [`rules.md`](./rules.md)，包含完整的 API 返回值结构表和代码示例。

核心原则：

- 直接解构：`const { data, error } = await client.admin.method()`
- 先检查 error，再检查 data 存在性
- 不同 API 返回结构不同：`listUsers` 返回 `{ users: [], total }`，`createUser` 返回 `{ user: User }` 等

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

## 开发规范

### 表单 autocomplete

为防止浏览器自动填充表单数据，表单输入框需要添加 `autocomplete` 属性：

| 字段类型                 | autocomplete 值 | 说明                 |
| ------------------------ | --------------- | -------------------- |
| 不需要自动填充的文本输入 | `off`           | 如用户名、昵称等     |
| 密码/新密码字段          | `new-password`  | 提示浏览器这是新密码 |

示例：

```vue
<UInput
  v-model="formData.username"
  type="text"
  placeholder="请输入用户名"
  autocomplete="off"
/>
<UInput
  v-model="formData.password"
  type="password"
  placeholder="请输入密码"
  autocomplete="new-password"
/>
```
