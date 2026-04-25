# AIO 项目深度分析报告

> 生成时间: 2026-04-25
> 分析范围: apps/api (NestJS) + apps/web (Nuxt 4) + packages/utils

---

## 一、安全问题（Critical）

### API 层

| # | 问题 | 文件位置 | 严重性 |
|---|------|----------|--------|
| S1 | **MQTT HTTP 控制器全部公开** — `@AllowAnonymous()` 注解允许无认证访问敏感隧道监控数据 | `src/module/middleware/mqtt/mqtt-http.controller.ts:13` | P0 |
| S2 | **Seed 端点无保护** — 创建默认 admin 账密，无认证即可触发 | `src/module/middleware/seed/seed.controller.ts:4` | P0 |
| S3 | **SQL 注入风险** — LIKE 查询直接拼接 `topic` 参数 | `src/module/middleware/mqtt/mqtt-message.service.ts:42` | P0 |
| S4 | **CORS 允许 null origin** — 服务端请求 origin 为 undefined 时自动放行所有来源 | `src/main.ts:59-68` | P1 |
| S5 | **Auth 路由白名单未生效** — 限制逻辑被注释掉，形同虚设 | `src/module/rbac/auth/auth.module.ts:62-69` | P1 |
| S6 | **无查询 limit 限制** — 可导致内存耗尽 DoS | `src/module/middleware/mqtt/mqtt-http.controller.ts` | P1 |

### Web 层

| # | 问题 | 文件位置 | 严重性 |
|---|------|----------|--------|
| S7 | **用户消息内容无 XSS 防护** — `{{ message.content }}` 未转义直接渲染 | `app/pages/messages/index.vue` | P0 |
| S8 | **内联 GA 脚本无 nonce/CSP** | `nuxt.config.ts:127-129` | P1 |
| S9 | **Vite proxy secure 选项写死** — 应根据环境切换而非写死 false | `nuxt.config.ts:102` | P1 |
| S10 | **demoUsername/demoPassword 暴露** — 需确保仅 dev 环境暴露 | runtimeConfig | P1 |
| S11 | **删除账户功能未完成** — TODO 注释等待实现 | `app/pages/settings/security.vue:109-110` | P2 |

---

## 二、架构问题

### 技术选型

| # | 问题 | 说明 | 优先级 |
|---|------|------|--------|
| A1 | **Pinia + persistedstate + Map 不兼容** | `pageCache.ts` 使用 `new Map()` 作为 state，pinia-plugin-persistedstate 无法正确序列化，刷新页面后状态丢失 | P1 |
| A2 | **i18n 被注释但代码有 localePath 引用** | `nuxt.config.ts` 注释掉了 i18n 模块，但 login page 仍在用 `localePath` | P2 |
| A3 | **双图表库并存** | 同时使用 `nuxt-echarts` 和 `@unovis/vue`，增加 bundle 体积 | P3 |
| A4 | **SSR 禁用但有 ssr 代码假设** | SPA 模式下部分逻辑可能错误地依赖服务端执行 | P2 |

### 模块边界

| # | 问题 | 说明 | 优先级 |
|---|------|------|--------|
| A5 | **MQTT 服务与 HTTP 控制器紧耦合** | `MqttHttpController` 直接依赖 `MqttService`，违反依赖倒置原则 | P1 |
| A6 | **RBAC 与 Auth 模块边界模糊** | auth.module 同时包含 JWT 策略和 RBAC 逻辑 | P2 |
| A7 | **缺少 Health Check 端点** | 无法探测 API 存活状态，CI/CD 无法做存活检测 | P2 |

---

## 三、代码质量问题

### 一致性问题

| # | 问题 | 位置 |
|---|------|------|
| C1 | **Logger 使用混乱** — 部分用 NestJS `Logger`，部分用 `PinoLogger`，应统一为 PinoLogger | 多个 service 文件 |
| C2 | **类型导入风格不统一** — 有的用 `import type`，有的用普通 import | 全局 |
| C3 | **Tab interface 的 closable 语义不一致** — `undefined` 被当作可关闭，但逻辑不清晰 | `tabs.ts` + `AppTabs.vue` |
| C4 | **页面组件风格不统一** — 有的用 `<script setup>` + composition API，有的用 Options API | `pageCache.ts` vs 其他 store |
| C5 | **Dashboard 的 isNotificationsSlideoverOpen 重复访问** | `dashboard.vue:105, 122` |

### 代码重复

| # | 重复内容 | 位置 |
|---|----------|------|
| C6 | **密码验证逻辑** | `app/pages/users/index.vue` + `app/pages/settings/security.vue` |
| C7 | **主题切换逻辑** | 多个组件重复 |
| C8 | **Tab 关闭逻辑** | `AppTabs.vue` + `tabs store` 双重实现 |

### 硬编码 / Magic Number

| # | 代码 | 位置 |
|---|------|------|
| C9 | `SD_THRESHOLD = 10.0`, `COC_THRESHOLD = 5.0` — 应提取到环境变量 | `tunnel-monitoring.service.ts` |
| C10 | `Math.random()` 生成 MQTT clientId — 重连会丢失订阅状态 | `mqtt.service.ts:55` |
| C11 | `avgP1x !== null` 但未处理 NaN — AVG() 无数据时返回 NaN | `tunnel-monitoring.service.ts:321-327` |
| C12 | Email 自动生成 `crypto.randomUUID()@aio.com` — 无法收取验证邮件 | `useAuthAdmin.ts:141` |

### 潜在 Bug

| # | 问题 | 位置 |
|---|------|------|
| C13 | **errorTimer setTimeout 未清理** — 组件卸载时 timer 仍在运行，可能导致内存泄漏 | `auth.store.ts:74-84` |
| C14 | **pageCache Map 不支持持久化** — 刷新页面后状态丢失 | `pageCache.ts` |
| C15 | **delete account 功能未实现** — TODO 注释存在 | `security.vue:109-110` |

---

## 四、功能模块问题

### 固定标签功能

| # | 问题 | 说明 | 优先级 |
|---|------|------|--------|
| F1 | **固定标签只在 store 层保护** — 没有 route guard，可通过编程方式绕过关闭固定标签 | P1 |
| F2 | **无 tab 数量限制** — 无限打开标签页会导致内存问题 | P2 |
| F3 | **重复路径检查缺失** — 快速连续点击可能产生重复 tab | P2 |
| F4 | **`/api/notifications` 可能返回空数据** — 端点可能不存在或未实现 | P2 |

### 遗留代码（Dead Code）

| 文件 | 状态 |
|------|------|
| `app/components/common/AppSidebar.vue` | 已废弃但未删除（被 Nuxt UI 组件替代） |
| `app/components/common/AppHeader.vue` | 已废弃但未删除 |
| `app/components/common/UserMenu.vue` | 可能未使用 |
| `app/pages/settings/notifications.vue` | 会话记录要删除但仍在 |

---

## 五、修复优先级

```
P0（立即修复 — 安全相关）:
├─ S1: 移除 mqtt-http.controller.ts 的 @AllowAnonymous()
├─ S2: 为 seed.controller.ts 添加认证或禁用
├─ S3: 修复 mqtt-message.service.ts 的 SQL 注入
└─ S7: 为 messages/index.vue 添加 XSS 防护

P1（一周内）:
├─ S4: 修复 CORS null origin 问题
├─ S5: 启用 auth.module.ts 白名单限制
├─ A1: 将 pageCache.ts 的 Map 改为 plain object
├─ F1: 为固定标签添加 route guard
└─ 删除 AppSidebar.vue, AppHeader.vue, UserMenu.vue

P2（迭代内）:
├─ S6: 添加查询 limit 限制
├─ A2: 移除 localePath 或启用 i18n
├─ A7: 添加 /health 端点
├─ C6: 提取密码验证为共享工具函数
├─ C11: 修复 NaN 处理
└─ 完成删除账户功能

P3（规划中）:
├─ C1: 统一 logger 为 PinoLogger
├─ A3: 评估是否需要双图表库
├─ C9: 提取 magic number 到配置文件
├─ C13: 清理 errorTimer
└─ 添加请求日志中间件 / correlation ID
```

---

## 六、文件清单（需重点关注）

| 文件 | 问题数 |
|------|--------|
| `apps/api/src/module/middleware/mqtt/mqtt-http.controller.ts` | S1, S6 |
| `apps/api/src/module/middleware/mqtt/mqtt-message.service.ts` | S3 |
| `apps/api/src/module/middleware/seed/seed.controller.ts` | S2 |
| `apps/api/src/main.ts` | S4 |
| `apps/api/src/module/rbac/auth/auth.module.ts` | S5 |
| `apps/web/app/pages/messages/index.vue` | S7 |
| `apps/web/nuxt.config.ts` | S8, S9 |
| `apps/web/app/pages/settings/security.vue` | S11, C15 |
| `apps/web/app/stores/pageCache.ts` | A1, C14 |
| `apps/web/app/stores/auth.store.ts` | C13 |
| `apps/web/app/composables/auth/useAuthAdmin.ts` | C12 |
| `apps/api/src/module/middleware/mqtt/tunnel-monitoring.service.ts` | C9, C11 |
| `apps/api/src/module/middleware/mqtt/mqtt.service.ts` | C10 |