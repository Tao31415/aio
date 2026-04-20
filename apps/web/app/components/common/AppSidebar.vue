<template>
  <aside
    :class="[
      'h-full bg-default border-r border-default flex flex-col transition-all duration-300',
      collapsed && !isMobile ? 'w-16' : 'w-56',
    ]"
  >
    <!-- Logo 区域 -->
    <div
      class="h-14 border-b border-default flex items-center justify-center px-4 shrink-0"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-2"
      >
        <div
          class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0"
        >
          <span class="text-primary-foreground font-bold text-lg">H</span>
        </div>
        <Transition name="fade">
          <span
            v-if="!collapsed || isMobile"
            class="text-lg font-bold whitespace-nowrap"
          >
            {{ brandName }}
          </span>
        </Transition>
      </NuxtLink>
    </div>

    <!-- 菜单列表 -->
    <nav class="flex-1 overflow-y-auto py-4 px-2">
      <ul class="space-y-1">
        <li
          v-for="item in menuItems"
          :key="item.path"
        >
          <!-- 菜单项 -->
          <NuxtLink
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accented text-muted hover:text-default',
            ]"
            :title="collapsed && !isMobile ? item.title : undefined"
          >
            <UIcon
              :name="item.icon"
              class="w-5 h-5 shrink-0"
            />
            <Transition name="fade">
              <span
                v-if="!collapsed || isMobile"
                class="whitespace-nowrap"
              >
                {{ item.title }}
              </span>
            </Transition>
            <!-- 徽章 -->
            <Transition name="fade">
              <UBadge
                v-if="item.badge && (!collapsed || isMobile)"
                color="error"
                variant="solid"
                size="xs"
                class="ml-auto"
              >
                {{ item.badge }}
              </UBadge>
            </Transition>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
  // Props
  interface Props {
    collapsed?: boolean
    isMobile?: boolean
  }

  withDefaults(defineProps<Props>(), {
    collapsed: false,
    isMobile: false,
  })

  // Emits
  defineEmits<{
    toggle: []
  }>()

  // 配置
  const config = useRuntimeConfig()
  const brandName = computed(() => config.public.brandName)
  const route = useRoute()

  // 菜单项
  interface MenuItem {
    title: string
    path: string
    icon: string
    badge?: string | number
    permission?: string
  }

  const menuItems: MenuItem[] = [
    { title: '仪表板', path: '/dashboard', icon: 'i-lucide-layout-dashboard' },
    { title: '用户管理', path: '/users', icon: 'i-lucide-users' },
    {
      title: '消息中心',
      path: '/messages',
      icon: 'i-lucide-messages-square',
      badge: 5,
    },
    { title: '数据分析', path: '/analytics', icon: 'i-lucide-chart-column' },
    { title: '个人资料', path: '/profile', icon: 'i-lucide-user-round' },
    { title: '系统设置', path: '/settings', icon: 'i-lucide-settings' },
  ]

  // 判断是否激活
  function isActive(path: string): boolean {
    if (path === '/dashboard') {
      return (
        route.path === '/' ||
        route.path === '/dashboard' ||
        route.path.startsWith('/dashboard/')
      )
    }
    return route.path.startsWith(path)
  }
</script>
