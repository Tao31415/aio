<script setup lang="ts">
  import type { DropdownMenuItem } from '@nuxt/ui'
  import { APP_ROUTE_MAP } from '~/utils/route-config'

  // 事件定义
  defineEmits<{
    toggleSidebar: []
    toggleMobileSidebar: []
  }>()

  // 状态
  const auth = useAuthStore()
  const uiSettings = useUiSettingsStore()
  const commandMenu = useCommandMenu()
  const { signOut } = useAuthActions()
  const router = useRouter()

  const userInitial = computed(() => {
    const displayName =
      auth.user?.username || auth.user?.name || auth.user?.email
    return displayName?.trim().charAt(0).toUpperCase() || 'U'
  })

  // 切换主题
  function toggleTheme() {
    uiSettings.toggleTheme()
  }

  // 打开命令面板
  function openCommandMenu() {
    commandMenu.open()
  }

  // 退出登录
  async function handleLogout() {
    await signOut({ redirectTo: '/login' })
  }

  const userMenuItems = computed<DropdownMenuItem[][]>(() => [
    [
      {
        label: auth.user?.name || '用户',
        description: auth.user?.email,
        disabled: true,
      },
    ],
    [
      {
        label: APP_ROUTE_MAP['/profile']!.title,
        icon: APP_ROUTE_MAP['/profile']!.icon,
        onSelect: () => router.push(APP_ROUTE_MAP['/profile']!.path),
      },
      {
        label: APP_ROUTE_MAP['/settings']!.title,
        icon: APP_ROUTE_MAP['/settings']!.icon,
        onSelect: () => router.push(APP_ROUTE_MAP['/settings']!.path),
      },
    ],
    [
      {
        label: '退出登录',
        icon: 'i-lucide-log-out',
        color: 'error',
        onSelect: handleLogout,
      },
    ],
  ])
</script>

<template>
  <header
    class="h-14 border-b border-border bg-elevated flex items-center justify-between px-4 lg:px-6 shrink-0"
  >
    <!-- 左侧区域 -->
    <div class="flex items-center gap-3">
      <!-- 移动端菜单按钮 -->
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-menu"
        class="lg:hidden"
        @click="$emit('toggleMobileSidebar')"
      />

      <!-- 桌面端侧边栏切换 -->
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-panel-left"
        class="hidden lg:inline-flex"
        @click="$emit('toggleSidebar')"
      />

      <!-- 搜索框 -->
      <div class="hidden sm:flex items-center gap-2">
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-lucide-search"
          class="text-muted hover:text-foreground transition-colors"
          @click="openCommandMenu"
        >
          <span>搜索...</span>
          <kbd
            class="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted"
          >
            <span class="text-xs">⌘</span>
            K
          </kbd>
        </UButton>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="flex items-center gap-1">
      <!-- 通知按钮 -->
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-bell"
        class="relative transition-colors hover:text-foreground"
      >
        <span
          class="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-elevated"
        ></span>
      </UButton>

      <!-- 主题切换 -->
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        :icon="uiSettings.isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
        class="transition-colors hover:text-foreground"
        @click="toggleTheme"
      />

      <!-- 用户菜单 -->
      <UDropdownMenu :items="userMenuItems">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="gap-2 px-1.5 hover:bg-accented transition-colors"
        >
          <div
            class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm"
          >
            <span class="text-primary-foreground text-sm font-medium">
              {{ userInitial }}
            </span>
          </div>
          <span class="hidden md:inline text-sm font-medium text-foreground">
            {{ auth.user?.name }}
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="hidden md:inline size-4 text-muted"
          />
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>
