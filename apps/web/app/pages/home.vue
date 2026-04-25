<script setup lang="ts">
  definePageMeta({
    layout: 'home',
    middleware: (to: { path: string }) => {
      if (to.path === '/home' || to.path === '/home/') {
        return navigateTo('/home/device')
      }
    },
  })

  // 注意：此页面作为父级路由组件，渲染统计卡片、标签栏和 NuxtPage

  // 统计数据
  const stats = ref([
    {
      title: '设备总数',
      value: 128,
      icon: 'i-lucide-server',
      bgColor: 'bg-blue-500',
    },
    {
      title: '在线设备',
      value: 108,
      icon: 'i-lucide-circle-check',
      bgColor: 'bg-green-500',
    },
    {
      title: '预警设备',
      value: 12,
      icon: 'i-lucide-alert-triangle',
      bgColor: 'bg-yellow-500',
    },
    {
      title: '报警设备',
      value: 8,
      icon: 'i-lucide-alert-circle',
      bgColor: 'bg-red-500',
    },
  ])

  // 标签页配置
  const tabs = [
    { label: '设备信息', path: '/home/device', icon: 'i-lucide-info' },
    { label: '数据查看', path: '/home/data', icon: 'i-lucide-chart-line' },
    { label: '数据预警', path: '/home/alarm', icon: 'i-lucide-bell' },
  ]

  const route = useRoute()

  // 判断当前激活的标签
  const activeTab = computed(() => {
    const path = route.path
    if (path.startsWith('/home/device')) return '/home/device'
    if (path.startsWith('/home/data')) return '/home/data'
    if (path.startsWith('/home/alarm')) return '/home/alarm'
    return '/home/device'
  })
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 统计卡片区域 -->
    <div class="p-4 border-b border-default">
      <UPageGrid class="lg:grid-cols-4 gap-4">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          :class="[stat.bgColor, 'rounded-lg p-4 text-white']"
        >
          <p class="text-sm uppercase text-white mb-2 font-medium">
            {{ stat.title }}
          </p>
          <div class="flex items-center gap-2">
            <UIcon
              :name="stat.icon"
              class="w-6 h-6"
            />
            <span class="text-xl font-bold">
              {{ stat.value }}
            </span>
          </div>
        </div>
      </UPageGrid>
    </div>

    <!-- 固定标签栏 -->
    <div
      class="h-10 border-b border-default bg-default flex items-center px-4 shrink-0"
    >
      <div class="flex items-center gap-1">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          :class="[
            'flex items-center gap-2 px-4 h-8 text-sm rounded-md transition-colors',
            activeTab === tab.path
              ? 'bg-primary text-white font-medium'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
          ]"
        >
          <UIcon
            :name="tab.icon"
            class="w-4 h-4"
          />
          <span>{{ tab.label }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- 子页面内容区域 -->
    <div class="flex-1 overflow-auto">
      <NuxtPage />
    </div>
  </div>
</template>
