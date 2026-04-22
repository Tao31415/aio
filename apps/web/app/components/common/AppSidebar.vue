<template>
  <aside
    :class="[
      'h-full bg-elevated border-r border-default flex flex-col transition-all duration-300',
      collapsed && !isMobile ? 'w-16' : 'w-56',
    ]"
  >
    <!-- Logo 区域 -->
    <div
      class="h-14 border-b border-border flex items-center justify-center px-4 shrink-0"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-2"
      >
        <div
          class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm"
        >
          <span class="text-primary-foreground font-bold text-lg">H</span>
        </div>
        <Transition name="fade">
          <span
            v-if="!collapsed || isMobile"
            class="text-lg font-bold text-foreground whitespace-nowrap"
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
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group',
              isActive(item.path)
                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                : 'hover:bg-accented text-muted hover:text-foreground',
            ]"
            :title="collapsed && !isMobile ? item.title : undefined"
          >
            <UIcon
              :name="item.icon"
              :class="[
                'w-5 h-5 shrink-0 transition-colors duration-150',
                isActive(item.path)
                  ? 'text-primary'
                  : 'text-muted group-hover:text-foreground',
              ]"
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
  import { getSidebarRoutes } from '~/utils/route-config'

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

  const menuBadges: Record<string, string | number> = {
    '/messages': 5,
  }

  const menuItems = computed(() =>
    getSidebarRoutes().map((item) => ({
      title: item.title,
      path: item.path,
      icon: item.icon || 'i-lucide-file',
      badge: menuBadges[item.path],
    }))
  )

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
