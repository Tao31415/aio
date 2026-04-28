<script setup lang="ts">
  import type { DropdownMenuItem } from '@nuxt/ui'

  interface Device {
    id: string
    name: string
    code: string
    project: string | null
    status?: 'online' | 'warning' | 'alarm' | 'offline'
  }

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const deviceList = ref<Device[]>([])
  const isLoading = ref(false)

  const selectedDeviceStore = useSelectedDeviceStore()

  async function fetchDevices() {
    isLoading.value = true
    selectedDeviceStore.setLoading(true)
    try {
      const data = await $fetch<Device[]>(`${apiBase}/api/v1/device`)
      deviceList.value = data || []
      selectedDeviceStore.setDeviceList(data || [])
    } catch (e) {
      console.error('Failed to fetch devices:', e)
    } finally {
      isLoading.value = false
      selectedDeviceStore.setLoading(false)
    }
  }

  fetchDevices()

  const route = useRoute()
  const auth = useAuthStore()
  const { signOut } = useAuth()

  function isActive(id: string): boolean {
    return route.params.deviceId === id
  }

  watch(
    () => route.params.deviceId as string | undefined,
    (newDeviceId) => {
      if (newDeviceId) {
        selectedDeviceStore.setSelectedDeviceById(newDeviceId)
      }
    },
    { immediate: true }
  )

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
          <!-- 加载状态 -->
          <div
            v-if="isLoading"
            class="px-3 py-8 text-center text-muted"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="w-6 h-6 mx-auto mb-2 animate-spin"
            />
            <p class="text-sm">加载中...</p>
          </div>

          <!-- 空状态 -->
          <div
            v-else-if="deviceList.length === 0"
            class="px-3 py-8 text-center text-muted"
          >
            <UIcon
              name="i-lucide-hard-drive"
              class="w-8 h-8 mx-auto mb-2 opacity-50"
            />
            <p class="text-sm">暂无设备</p>
          </div>

          <!-- 设备列表 -->
          <ul
            v-else
            class="space-y-0.5 px-2"
          >
            <li
              v-for="device in deviceList"
              :key="device.id"
            >
              <NuxtLink
                :to="`/home/${device.id}/basic`"
                :class="[
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  isActive(device.id)
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                ]"
                @click="selectedDeviceStore.setSelectedDevice(device)"
              >
                <UIcon
                  :name="getStatusIcon(device.status || '')"
                  :class="[
                    'w-4 h-4 shrink-0',
                    isActive(device.id)
                      ? ''
                      : getStatusColor(device.status || ''),
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
