<template>
  <aside
    :class="[
      'h-full bg-card border-r flex flex-col transition-all duration-300',
      collapsed && !isMobile ? 'w-16' : 'w-56',
    ]"
  >
    <!-- Logo 区域 -->
    <div class="h-14 border-b flex items-center justify-center px-4 shrink-0">
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
                : 'hover:bg-accent text-muted-foreground hover:text-foreground',
            ]"
            :title="collapsed && !isMobile ? item.title : undefined"
          >
            <component
              :is="item.icon"
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
              <span
                v-if="item.badge && (!collapsed || isMobile)"
                class="ml-auto text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full"
              >
                {{ item.badge }}
              </span>
            </Transition>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- 底部区域 -->
    <div class="border-t p-4 shrink-0">
      <Transition name="fade">
        <div
          v-if="!collapsed || isMobile"
          class="text-xs text-muted-foreground text-center"
        >
          <p>&copy; {{ new Date().getFullYear() }} {{ brandName }}</p>
          <p class="mt-1">v1.0.0</p>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { h } from 'vue'

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
    icon: { render: () => ReturnType<typeof h> }
    badge?: string | number
    permission?: string
  }

  // SVG 图标组件
  const DashboardIcon = {
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
          }),
        ]
      )
    },
  }

  const UsersIcon = {
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
          }),
        ]
      )
    },
  }

  const MessagesIcon = {
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
          }),
        ]
      )
    },
  }

  const AnalyticsIcon = {
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
          }),
        ]
      )
    },
  }

  const SettingsIcon = {
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
          }),
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
          }),
        ]
      )
    },
  }

  const ProfileIcon = {
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
          }),
        ]
      )
    },
  }

  const menuItems: MenuItem[] = [
    { title: '仪表板', path: '/dashboard', icon: DashboardIcon },
    { title: '用户管理', path: '/users', icon: UsersIcon },
    { title: '消息中心', path: '/messages', icon: MessagesIcon, badge: 5 },
    { title: '数据分析', path: '/analytics', icon: AnalyticsIcon },
    { title: '个人资料', path: '/profile', icon: ProfileIcon },
    { title: '系统设置', path: '/settings', icon: SettingsIcon },
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
