# Better Auth Admin Client 使用规范

## 核心原则

1. **直接解构**：使用 `const { data, error } = await client.admin.method()` 直接解构
2. **先检查 error**：API 可能返回 `{ data: null, error: {...} }`
3. **检查 data 存在性**：部分 API 在失败时返回 `data: null`
4. **验证返回值结构**：不同 API 的 `data` 结构不同，需分别处理

## API 返回值结构表

| 方法              | data 结构                          | 成功判断        | 说明                                |
| ----------------- | ---------------------------------- | --------------- | ----------------------------------- |
| `listUsers`       | `{ users: User[], total: number }` | 检查 `error`    | 需访问 `data.users` 和 `data.total` |
| `getUser`         | `User` (直接对象)                  | `data !== null` | 失败时 `data: null`                 |
| `createUser`      | `{ user: User }`                   | `data?.user`    | 需访问 `data.user`                  |
| `updateUser`      | `{ user: User }`                   | `data?.user`    | 需访问 `data.user`                  |
| `setRole`         | `{ user: User }`                   | `data?.user`    | 需访问 `data.user`                  |
| `banUser`         | `{ user: User }`                   | `data?.user`    | 需访问 `data.user`                  |
| `unbanUser`       | `{ user: User }`                   | `data?.user`    | 需访问 `data.user`                  |
| `removeUser`      | `{ success: boolean }`             | `data?.success` | 删除操作结果                        |
| `setUserPassword` | `{ status: boolean }`              | `data?.status`  | 密码设置结果                        |

## 标准代码模式

### 列表查询 (listUsers)

```typescript
const { data, error } = await client.admin.listUsers({ query })

if (error) {
  logger.error({ err: error }, 'Failed to list users')
  return { users: [], total: 0 }
}

const users = userListToUserProfileList(data.users)
const total = data.total
return { users, total }
```

### 单对象查询 (getUser)

```typescript
const { data, error } = await client.admin.getUser(params)

if (error) {
  logger.error({ err: error, userId }, 'Failed to get user')
  return null
}

if (!data) {
  logger.warn({ userId }, 'User not found')
  return null
}

return safeUserWithRoleToUserProfile(data)
```

### 创建用户 (createUser)

```typescript
const { data, error } = await client.admin.createUser(params)

if (error) {
  logger.error({ err: error, username }, 'Failed to create user')
  return null
}

if (!data?.user) {
  logger.error({ username }, 'Failed to create user: invalid data')
  return null
}

return safeUserWithRoleToUserProfile(data.user)
```

### 更新用户 (updateUser)

```typescript
const { data, error } = await client.admin.updateUser(params)

if (error) {
  logger.error({ err: error, userId }, 'Failed to update user')
  return null
}

if (!data?.user) {
  logger.error({ userId }, 'Failed to update user: invalid data')
  return null
}

return safeUserWithRoleToUserProfile(data.user)
```

### 设置用户角色 (setRole)

```typescript
const { data, error } = await client.admin.setRole(params)

if (error) {
  logger.error({ err: error, userId }, 'Failed to set user role')
  return false
}

if (!data?.user) {
  logger.error({ userId }, 'Failed to set user role: unknown error')
  return false
}

logger.info({ userId, role }, 'User role set successfully')
return true
```

### 封禁用户 (banUser)

```typescript
const { data, error } = await client.admin.banUser(params)

if (error) {
  logger.error({ err: error, userId }, 'Failed to ban user')
  return false
}

if (!data?.user) {
  logger.error({ userId }, 'Failed to ban user: unknown error')
  return false
}

logger.info({ userId, banReason }, 'User banned successfully')
return true
```

### 解封用户 (unbanUser)

```typescript
const { data, error } = await client.admin.unbanUser(params)

if (error) {
  logger.error({ err: error, userId }, 'Failed to unban user')
  return false
}

if (!data?.user) {
  logger.error({ userId }, 'Failed to unban user: unknown error')
  return false
}

logger.info({ userId }, 'User unbanned successfully')
return true
```

### 删除用户 (removeUser)

```typescript
const { data, error } = await client.admin.removeUser(params)

if (error) {
  logger.error({ err: error, userId }, 'Failed to delete user')
  return false
}

if (!data?.success) {
  logger.error({ userId }, 'Failed to delete user: unknown error')
  return false
}

logger.info({ userId }, 'User deleted successfully')
return true
```

### 设置密码 (setUserPassword)

```typescript
const { data, error } = await client.admin.setUserPassword(params)

if (error) {
  logger.error({ err: error, userId }, 'Failed to set user password')
  return false
}

if (!data?.status) {
  logger.error({ userId }, 'Failed to set user password: unknown error')
  return false
}

logger.info({ userId }, 'User password set successfully')
return true
```

## 关键区别：直接对象 vs 包装对象

| 类型     | API 方法                                        | data 结构              | 访问方式                   |
| -------- | ----------------------------------------------- | ---------------------- | -------------------------- |
| 直接对象 | `getUser`, `updateUser`                         | `User`                 | `data` 直接使用            |
| 包装对象 | `createUser`, `setRole`, `banUser`, `unbanUser` | `{ user: User }`       | `data.user`                |
| 列表     | `listUsers`                                     | `{ users: [], total }` | `data.users`, `data.total` |
| 布尔标志 | `removeUser`                                    | `{ success: boolean }` | `data.success`             |
| 布尔标志 | `setUserPassword`                               | `{ status: boolean }`  | `data.status`              |

## 错误处理原则

1. **error 优先检查**：任何 API 调用都应首先检查 `error`
2. **data 存在性检查**：部分 API 失败时返回 `data: null`
3. **业务逻辑检查**：对于返回 `success`/`status` 的操作，需验证值为 `true`
4. **统一返回模式**：
   - 查询类：`null` 表示失败或不存在
   - 操作类：`boolean` 表示成功与否
   - 列表类：返回空数组和 0 总数

## 日志规范

使用 `useLogger` 记录日志，遵循以下模式：

```typescript
const logger = useLogger('auth.admin')

// 参数日志使用 debug 级别
logger.debug({ params }, 'method params')

// 错误日志包含错误对象
logger.error({ err: error, userId }, 'Failed to method')

// 成功日志包含关键信息
logger.info({ userId }, 'Method succeeded')
```

**注意**：

- 第一个参数必须是对象（metadata），第二个参数是字符串（message）
- 使用 `err` 作为 error 对象的 key 会被 pino 特殊处理
- Context 命名约定：使用点号分隔，如 `auth.admin`、`api.users`

## NuxtPage 嵌套路由使用规范

### 核心概念

Nuxt 文件路由自动创建嵌套关系：

- `pages/parent.vue` → 路由 `/parent`
- `pages/parent/child.vue` → 路由 `/parent/child`（**自动成为 `/parent` 的嵌套子路由**）

### 规则 1：父页面包含 `<NuxtPage />`

父页面组件使用 `<NuxtPage />` 来渲染子页面内容：

```vue
<!-- pages/home.vue -->
<template>
  <div>
    <h1>父页面</h1>
    <NuxtPage />
  </div>
</template>
```

### 规则 2：子页面不需要 layout

子页面不需要指定 `layout`，它们被渲染在父页面的 `<NuxtPage />` 中：

```vue
<!-- pages/home/device.vue -->
<script setup lang="ts">
  // 不需要 definePageMeta({ layout: 'xxx' })
  // 直接写子页面内容
</script>
```

### 规则 3：文件结构决定嵌套关系

Nuxt 文件路由自动创建嵌套：

```bash
pages/
├── home.vue              # /home - 父页面
├── home/
│   ├── device.vue       # /home/device - 子页面
│   ├── data.vue         # /home/data - 子页面（也可以是父页面）
│   └── data/
│       ├── displacement.vue  # /home/data/displacement
│       └── photo.vue        # /home/data/photo
```

### 规则 4：父页面可使用 middleware 重定向

当访问父路由时，如果需要默认显示某个子页面内容，可以添加 middleware 重定向：

```typescript
definePageMeta({
  middleware: (to) => {
    if (to.path === '/home' || to.path === '/home/') {
      return navigateTo('/home/device')
    }
  },
})
```

### 规则 5：多层嵌套

可以有多层嵌套，每层父组件都有自己的 `<NuxtPage />`：

```
访问 /home/data/displacement → home.vue → NuxtPage → data.vue → NuxtPage → displacement.vue
```

渲染顺序：

1. `pages/home.vue` 渲染（父布局 + `<NuxtPage />`）
2. `<NuxtPage />` 渲染 `pages/home/data.vue`
3. `pages/home/data.vue` 渲染（标签栏 + `<NuxtPage />`）
4. `<NuxtPage />` 渲染 `pages/home/data/displacement.vue`

### 规则 6：子页面的内容区域

子页面只负责自己的内容，不需要包含父页面的公共部分（如统计卡片、标签栏等）。

### 正确示例

```bash
pages/
├── home.vue              # /home - 父页面：layout + 统计卡片 + 标签栏 + NuxtPage
├── home/
│   ├── device.vue       # /home/device - 设备详情内容
│   ├── data.vue         # /home/data - 数据容器：layout + 数据标签栏 + NuxtPage
│   ├── data/
│   │   ├── displacement.vue  # 位移数据内容
│   │   └── photo.vue        # 照片查看内容
│   └── alarm.vue       # /home/alarm - 报警内容
```

```vue
<!-- pages/home.vue -->
<script setup lang="ts">
  definePageMeta({
    layout: 'home',
    middleware: (to) => {
      if (to.path === '/home' || to.path === '/home/') {
        return navigateTo('/home/device')
      }
    },
  })
</script>
<template>
  <div class="h-full flex flex-col">
    <!-- 统计卡片 -->
    <div>...</div>
    <!-- 标签栏 -->
    <div>...</div>
    <!-- 子页面内容区域 -->
    <NuxtPage />
  </div>
</template>
```

```vue
<!-- pages/home/device.vue -->
<script setup lang="ts">
  // 子页面，不需要 layout，不需要 middleware
</script>
<template>
  <!-- 只写设备详情内容 -->
</template>
```

### 错误示例

```vue
<!-- 错误：子页面不应该指定 layout -->
<script setup lang="ts">
  definePageMeta({
    layout: 'home', // 错误！子页面不需要 layout
  })
</script>

<!-- 错误：子页面不需要 NuxtPage -->
<template>
  <div>
    <h1>子页面</h1>
    <NuxtPage />
    <!-- 错误！子页面不需要 NuxtPage -->
  </div>
</template>
```
