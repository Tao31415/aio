<template>
  <header
    class="h-14 border-b bg-card flex items-center justify-between px-4 lg:px-6 shrink-0"
  >
    <!-- 左侧区域 -->
    <div class="flex items-center gap-4">
      <!-- 移动端菜单按钮 -->
      <button
        class="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
        @click="$emit('toggleMobileSidebar')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- 桌面端侧边栏切换 -->
      <button
        class="hidden lg:flex p-2 rounded-md hover:bg-accent transition-colors"
        @click="$emit('toggleSidebar')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      </button>

      <!-- 搜索框 -->
      <div class="hidden sm:flex items-center gap-2">
        <button
          class="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted rounded-md hover:bg-accent transition-colors"
          @click="openCommandMenu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span>搜索...</span>
          <kbd
            class="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground"
          >
            <span class="text-xs">⌘</span>
            K
          </kbd>
        </button>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="flex items-center gap-2">
      <!-- 通知按钮 -->
      <button class="p-2 rounded-md hover:bg-accent transition-colors relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span
          class="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"
        ></span>
      </button>

      <!-- 主题切换 -->
      <button
        class="p-2 rounded-md hover:bg-accent transition-colors"
        @click="toggleTheme"
      >
        <svg
          v-if="uiSettings.isDark"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>

      <!-- 用户菜单 -->
      <div
        class="relative"
        ref="userMenuRef"
      >
        <button
          class="flex items-center gap-2 p-1.5 rounded-md hover:bg-accent transition-colors"
          @click="userMenuOpen = !userMenuOpen"
        >
          <div
            class="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
          >
            <span class="text-primary-foreground text-sm font-medium">
              {{ auth.initials }}
            </span>
          </div>
          <span class="hidden md:inline text-sm font-medium">
            {{ auth.user?.name }}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 hidden md:inline"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- 用户下拉菜单 -->
        <Transition name="fade">
          <div
            v-if="userMenuOpen"
            class="absolute right-0 top-full mt-1 w-56 bg-popover border rounded-md shadow-lg py-1 z-50"
          >
            <div class="px-3 py-2 border-b">
              <p class="text-sm font-medium">{{ auth.user?.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ auth.user?.email }}
              </p>
            </div>
            <div class="py-1">
              <NuxtLink
                to="/profile"
                class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                @click="userMenuOpen = false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                个人资料
              </NuxtLink>
              <NuxtLink
                to="/settings"
                class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                @click="userMenuOpen = false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                系统设置
              </NuxtLink>
            </div>
            <div class="border-t py-1">
              <button
                class="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors w-full"
                @click="handleLogout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                退出登录
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  // 事件定义
  defineEmits<{
    toggleSidebar: []
    toggleMobileSidebar: []
  }>()

  // 状态
  const auth = useAuthStore()
  const uiSettings = useUiSettingsStore()
  const commandMenu = useCommandMenu()
  const router = useRouter()

  // 用户菜单状态
  const userMenuOpen = ref(false)
  const userMenuRef = ref<HTMLElement | null>(null)

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
    userMenuOpen.value = false
    auth.logout()
    await router.push('/login')
  }

  // 点击外部关闭菜单
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  function handleClickOutside(event: MouseEvent) {
    if (
      userMenuRef.value &&
      !userMenuRef.value.contains(event.target as Node)
    ) {
      userMenuOpen.value = false
    }
  }
</script>
