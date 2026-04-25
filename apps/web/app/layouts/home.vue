<script setup lang="ts">
  import type { DropdownMenuItem } from '@nuxt/ui'

  // 模拟设备列表数据
  const deviceList = ref([
    { id: 1, name: '监测点 A1', status: 'online' },
    { id: 2, name: '监测点 A2', status: 'online' },
    { id: 3, name: '监测点 B1', status: 'warning' },
    { id: 4, name: '监测点 B2', status: 'alarm' },
    { id: 5, name: '监测点 C1', status: 'offline' },
  ])

  const route = useRoute()
  const auth = useAuthStore()
  const { signOut } = useAuth()

  // 判断是否选中
  function isActive(id: number): boolean {
    return route.path.includes(`/home/device/${id}`)
  }

  // 状态图标和颜色
  function getStatusIcon(status: string): string {
    switch (status) {
      case 'online':
        return 'i-lucide-circle-check'
      case 'warning':
        return 'i-lucide-alert-triangle'
      case 'alarm':
        return 'i-lucide-alert-circle'
      default:
        return 'i-lucide-circle-dot'
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'online':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'alarm':
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  // 用户菜单
  const userMenuItems = computed<DropdownMenuItem[][]>(() => [
    [
      {
        label: '仪表盘',
        icon: 'i-lucide-layout-dashboard',
        to: '/dashboard',
      },
    ],
    [
      {
        label: '退出登录',
        icon: 'i-lucide-log-out',
        color: 'error',
        onSelect(e) {
          e.preventDefault()
          signOut({
            redirectTo: '/login',
          })
        },
      },
    ],
  ])

  // 配置
  const config = useRuntimeConfig()
  const brandName = computed(() => config.public.brandName)
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- 网站 Title -->
    <div
      class="bg-primary text-white px-6 py-4 shrink-0 flex items-center justify-between"
    >
      <h1 class="text-2xl font-bold">
        {{ brandName }}
      </h1>
      <div class="flex items-center gap-2">
        <!-- 用户菜单 -->
        <UDropdownMenu :items="userMenuItems">
          <UButton
            color="white"
            variant="ghost"
            size="sm"
            class="gap-2 hover:bg-white/20 active:bg-white/30"
          >
            <span class="text-white text-sm font-medium">
              {{ auth.user?.name }}
            </span>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 text-white/70"
            />
          </UButton>
        </UDropdownMenu>
      </div>
    </div>

    <!-- 左侧设备列表导航栏 + 右侧内容区域 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧设备列表导航栏 -->
      <aside class="w-64 border-r border-default flex flex-col shrink-0">
        <!-- 设备列表标题 -->
        <div class="px-4 py-3 border-b border-default">
          <h3 class="text-base font-medium text-muted">设备列表</h3>
        </div>

        <!-- 设备列表 -->
        <nav class="flex-1 overflow-y-auto py-2">
          <ul class="space-y-0.5 px-2">
            <li
              v-for="device in deviceList"
              :key="device.id"
            >
              <NuxtLink
                :to="`/home/device/${device.id}`"
                :class="[
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  isActive(device.id)
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                ]"
              >
                <UIcon
                  :name="getStatusIcon(device.status)"
                  :class="[
                    'w-4 h-4 shrink-0',
                    isActive(device.id) ? '' : getStatusColor(device.status),
                  ]"
                />
                <span class="truncate">{{ device.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- 右侧内容区域 -->
      <main class="flex-1 overflow-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>
