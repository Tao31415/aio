# Nuxt UI 色彩方案分析文档

> 基于 `dashboard` 项目分析，可复用于其他 Nuxt UI 项目

---

## 1. main.css 定义的色彩

### 1.1 文件位置
```
app/assets/css/main.css
```

### 1.2 内容

```css
@import "tailwindcss" theme(static);
@import "@nuxt/ui";

@theme static {
  --font-sans: 'Public Sans', sans-serif;

  /* ========== 核心：自定义品牌绿色调色板 ========== */
  --color-green-50:  #EFFDF5;
  --color-green-100: #D9FBE8;
  --color-green-200: #B3F5D1;
  --color-green-300: #75EDAE;
  --color-green-400: #00DC82;
  --color-green-500: #00C16A;
  --color-green-600: #00A155;
  --color-green-700: #007F45;
  --color-green-800: #016538;
  --color-green-900: #0A5331;
  --color-green-950: #052E16;
}
```

### 1.3 作用机制

`@theme static` 是 **Tailwind CSS v4** 的语法，将这些变量注册为 Tailwind 原子类：

| CSS 变量 | 生成的 Tailwind 类 | 含义 |
|---|---|---|
| `--color-green-50` | `green-50` | 最浅绿（背景） |
| `--color-green-400` | `green-400` | 浅绿（暗色模式主色） |
| `--color-green-500` | `green-500` | 亮绿（亮色模式主色） |
| `--color-green-600` | `green-600` | 深绿（暗色模式强调） |
| `--color-green-950` | `green-950` | 最深绿（背景） |

### 1.4 受影响的组件

所有使用 `green` 色的 Nuxt UI 组件均受影响，包括：

- 按钮：`color="primary"` / `variant="solid"` 的按钮背景
- 侧边栏激活项：`text-primary` / `bg-primary/10` 高亮
- 表格选中行：`border-primary bg-primary/10`
- 图表数据：`--vis-tooltip-*` 使用语义色
- 徽章、标签、通知数字等所有以 primary 为主色的元素

---

## 2. app.config.ts 全局色彩设定

### 2.1 文件位置
```
app/app.config.ts
```

### 2.2 内容

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',   // ← 决定 primary 语义色使用 green 色板
      neutral: 'zinc'    // ← 决定中性色使用 zinc 色板
    }
  }
})
```

### 2.3 作用机制

`app.config.ts` 是**运行时配置**，定义后 Nuxt UI 会：

1. 将 `primary` 色映射到绿色色板（`--color-green-*`）
2. 将 `neutral` 色映射到锌灰色板（`--color-zinc-*`，Nuxt UI 内置）
3. 生成全局语义 CSS 变量：

```css
/* 亮色模式（默认） */
:root {
  --ui-primary: var(--ui-color-primary-500);   /* green-500 */
}

/* 暗色模式 */
.dark {
  --ui-primary: var(--ui-color-primary-400);   /* green-400 */
}
```

> **关键规则**：暗色模式自动使用 `*-400`，亮色模式使用 `*-500`。无需手动为两种模式分别定义。

### 2.4 受影响的组件

所有使用语义色的 Nuxt UI 组件：

| 语义类 | 受影响示例 |
|---|---|
| `text-primary` | 按钮文字、激活菜单项文字 |
| `bg-primary/10` | 选中行背景、徽章背景 |
| `ring-primary/25` | 统计卡片环形图标背景 |
| `border-primary` | 表格选中行左边框 |
| `text-muted` / `text-dimmed` | 次要文字、辅助说明 |
| `text-highlighted` | 重要文字（姓名、金额） |
| `bg-elevated` | 浮层、弹窗、卡片提升背景 |

---

## 3. Dark / Light 模式切换机制

### 3.1 核心依赖

| 依赖 | 作用 |
|---|---|
| `@vueuse/core` | 提供 `useColorMode()` 响应式组合函数 |
| `@nuxt/ui` | 自动在 `<html>` 元素上添加 `.dark` / `.light` 类 |

### 3.2 实现方式

**切换入口** — `UserMenu.vue`（用户下拉菜单 → Appearance）：

```typescript
// app/components/UserMenu.vue
const colorMode = useColorMode()

// 切换到暗色模式
colorMode.preference = 'dark'

// 切换到亮色模式
colorMode.preference = 'light'
```

**html 元素类名变化**：

```
<!-- 亮色模式 -->
<html class="light">

<!-- 暗色模式 -->
<html class="dark">
```

**meta 主题色同步** — `app.vue`：

```typescript
// app/app.vue
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')
// ↑ 设置 <meta name="theme-color"> 与当前模式匹配
```

### 3.3 色彩定义配置文件

Nuxt UI 自动根据 `app.config.ts` 的 `primary` / `neutral` 名称，读取对应 `--color-{name}-{shade}` 变量，无需额外配置文件。

---

## 4. 整体风格切换（useTheme 多风格方案）

### 4.1 当前项目状态

当前项目**没有使用多风格（multi-theme）方案**，仅支持：

- 🌙 **Dark** 模式：`--ui-color-primary-400`
- ☀️ **Light** 模式：`--ui-color-primary-500`

但 `UserMenu.vue` 已内置了 **Primary 色彩切换器**（可在运行时切换 primary 色）和 **Appearance 切换**（dark / light）。

### 4.2 风格定义位置

风格相关的颜色定义在以下位置：

| 文件 | 作用 |
|---|---|
| `main.css` → `@theme static` | 注册 Tailwind 原子色板（如 `green-*`） |
| `app.config.ts` → `ui.colors` | 运行时指定 primary / neutral 使用哪个色板 |
| Nuxt UI 内置 | 生成 `--ui-primary-*` 语义变量供全项目使用 |

### 4.3 如何增加新风格

#### 步骤 1：在 main.css 中定义新色板

```css
/* main.css */
@theme static {
  --color-blue-50:  #eff6ff;
  --color-blue-100:  #dbeafe;
  --color-blue-200:  #bfdbfe;
  --color-blue-300:  #93c5fd;
  --color-blue-400:  #60a5fa;
  --color-blue-500:  #3b82f6;  /* ← Light 模式主色 */
  --color-blue-600:  #2563eb;
  --color-blue-700:  #1d4ed8;
  --color-blue-800:  #1e40af;
  --color-blue-900:  #1e3a8a;
  --color-blue-950:  #172554;

  /* 如果需要区分风格，可定义风格变量 */
  --color-sapphire-500: #0ea5e9; /* 深蓝风格 */
}
```

> **注意**：Nuxt UI 要求每个色板必须包含 50~950 共 11 个色阶。

#### 步骤 2：在 app.config.ts 中引用

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',    // 切换为蓝色主色
      neutral: 'zinc'
    }
  }
})
```

#### 步骤 3：在组件中动态切换（运行时）

在 `UserMenu.vue` 中已实现了运行时切换：

```typescript
// 切换 primary 色（运行时生效，无需刷新）
appConfig.ui.colors.primary = 'blue'

// 切换 neutral 色
appConfig.ui.colors.neutral = 'slate'
```

### 4.4 多风格方案设计（建议实现）

如果需要同时支持多种"主题风格"（例如"企业蓝"、"科技绿"、"暖色橙"）：

```
styles/
├── themes/
│   ├── green.theme.css    # 定义 --color-green-* + 特殊变量
│   ├── blue.theme.css     # 定义 --color-blue-*  + 特殊变量
│   └── amber.theme.css    # 定义 --color-amber-* + 特殊变量
├── main.css               # @import theme() + @theme static
└── app.config.ts          # ui.colors 定义当前激活的主题色
```

切换时只需改变 `app.config.ts` 中的 `primary` / `neutral` 名称，所有使用语义类的组件自动跟随变化。

### 4.5 颜色如何作用到组件

Nuxt UI 组件使用**语义类**而非硬编码颜色：

```vue
<!-- ✅ 正确：使用语义类，自动响应 dark/light/primary 变化 -->
<UButton color="primary">Submit</UButton>
<span class="text-highlighted">Username</span>
<div class="bg-elevated">Card</div>

<!-- ⚠️ 避免：硬编码具体色值 -->
<UButton class="bg-green-500">Submit</UButton>
<span class="text-gray-700">Username</span>
```

**语义类 → CSS 变量映射**（由 Nuxt UI 生成）：

```
text-primary  → color: var(--ui-primary)
bg-primary/10 → background: color-mix(in srgb, var(--ui-primary) 10%, transparent)
border-default → border-color: var(--ui-border)
text-muted     → color: var(--ui-text-muted)
text-highlighted → color: var(--ui-text-highlighted)
```

### 4.6 修改特定组件的风格颜色

#### 方式 A：修改 app.config.ts 全局配置（推荐）

影响所有使用该色的组件：

```typescript
// app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'violet',   // 全部组件的 primary 变为紫罗兰色
      neutral: 'stone'
    }
  }
})
```

#### 方式 B：组件级别 ui prop（局部覆盖）

```vue
<!-- 仅影响这个按钮 -->
<UButton color="error" variant="solid">Delete</UButton>

<!-- 仅影响这个表格 -->
<UTable :ui="{ td: 'text-muted', th: 'text-dimmed' }" />
```

#### 方式 C：组件 style variable（精准修改）

```vue
<template>
  <div class="[--my-primary:var(--color-amber-500)]">
    <span class="text-[--my-primary]">Custom Amber Text</span>
  </div>
</template>
```

---

## 5. 补充：Nuxt UI 色彩系统进阶配置

### 5.1 可用的内置色板

在 `app.config.ts` 中可指定 `primary` / `neutral` 为以下任意名称：

| 色板名 | 特点 |
|---|---|
| `slate` / `gray` / `zinc` / `neutral` / `stone` | 中性灰系列 |
| `red` / `orange` / `amber` / `yellow` / `lime` | 暖色系列 |
| `green` / `emerald` / `teal` / `cyan` | 冷/自然色系列 |
| `sky` / `blue` / `indigo` / `violet` / `purple` | 蓝紫色系 |
| `fuchsia` / `pink` / `rose` | 品红色系 |

### 5.2 完整的语义色彩体系

```css
/* 亮色模式 */
:root {
  /* 主要/成功/警告/错误语义色 */
  --ui-primary: var(--ui-color-primary-500);
  --ui-success: var(--ui-color-success-500);
  --ui-warning: var(--ui-color-warning-500);
  --ui-error: var(--ui-color-error-500);
  --ui-info: var(--ui-color-info-500);

  /* 文本色阶 */
  --ui-text-dimmed: var(--ui-color-neutral-400);
  --ui-text-muted: var(--ui-color-neutral-500);
  --ui-text-toned: var(--ui-color-neutral-600);
  --ui-text: var(--ui-color-neutral-700);
  --ui-text-highlighted: var(--ui-color-neutral-900);
  --ui-text-inverted: white;

  /* 背景色阶 */
  --ui-bg: var(--ui-color-neutral-50);       /* 页面背景 */
  --ui-bg-elevated: var(--ui-color-neutral-0); /* 卡片/浮层背景 */
}

/* 暗色模式 */
.dark {
  --ui-primary: var(--ui-color-primary-400);
  --ui-text-dimmed: var(--ui-color-neutral-500);
  --ui-text-muted: var(--ui-color-neutral-400);
  --ui-text-toned: var(--ui-color-neutral-300);
  --ui-text: var(--ui-color-neutral-200);
  --ui-text-highlighted: white;
  --ui-text-inverted: var(--ui-color-neutral-900);
  --ui-bg: #1b1718;                          /* ← 自定义暗色背景 */
  --ui-bg-elevated: var(--ui-color-neutral-900);
}
```

### 5.3 自定义暗色模式背景色

在 `main.css` 中覆盖 `--ui-bg`：

```css
/* main.css */
@import "tailwindcss" theme(static);
@import "@nuxt/ui";

:root {
  /* 可选：自定义亮色背景 */
}

.dark {
  --ui-bg: #1b1718;  /* ← 项目自定义暗色背景色 */
}
```

### 5.4 使用 `useColorMode()` 组合函数

```typescript
// composables/useCustomTheme.ts
export const useCustomTheme = () => {
  const colorMode = useColorMode()
  const appConfig = useAppConfig()

  const setTheme = (primary: string, neutral: string) => {
    appConfig.ui.colors.primary = primary
    appConfig.ui.colors.neutral = neutral
  }

  const setAppearance = (mode: 'light' | 'dark') => {
    colorMode.preference = mode
  }

  return {
    isDark: computed(() => colorMode.value === 'dark'),
    currentPrimary: computed(() => appConfig.ui.colors.primary),
    currentNeutral: computed(() => appConfig.ui.colors.neutral),
    setTheme,
    setAppearance
  }
}
```

---

## 6. 快速复用到其他项目

### 6.1 最小化配置清单

**步骤 1：** 安装依赖
```bash
npm install @nuxt/ui @vueuse/nuxt
```

**步骤 2：** `nuxt.config.ts`
```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
})
```

**步骤 3：** `assets/css/main.css`
```css
@import "tailwindcss" theme(static);
@import "@nuxt/ui";

@theme static {
  --font-sans: 'Your Font', sans-serif;

  /* 你的品牌色，从 50 到 950 */
  --color-yourbrand-50:  #f0fdf4;
  /* ... 完整 11 个色阶 ... */
  --color-yourbrand-950: #052e16;
}
```

**步骤 4：** `app.config.ts`
```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'yourbrand',
      neutral: 'zinc'
    }
  }
})
```

**步骤 5：** 在 `app.vue` 或布局组件中引入切换 UI
```vue
<UApp>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <NotificationsSlideover />
  <UColorModeSwitch />  <!-- 或在侧边栏集成 -->
</UApp>
```

> **核心原则**：始终使用语义类（`text-primary`、`bg-elevated` 等）编写组件，颜色会自动跟随 `app.config.ts` 中的配置变化。
