<script setup lang="ts">
  definePageMeta({
    layout: 'home',
    middleware: (to) => {
      if (to.path === '/home/data' || to.path === '/home/data/') {
        return navigateTo('/home/data/displacement')
      }
    },
  })

  // 子页面（数据查看容器），有自己嵌套的 NuxtPage

  // 标签页配置
  const tabs = [
    {
      label: '位移数据查看',
      path: '/home/data/displacement',
      icon: 'i-lucide-chart-line',
    },
    { label: '照片查看', path: '/home/data/photo', icon: 'i-lucide-image' },
    { label: '视频查看', path: '/home/data/video', icon: 'i-lucide-video' },
  ]

  const route = useRoute()

  // 判断当前激活的标签
  const activeTab = computed(() => {
    const path = route.path
    if (path.includes('/displacement')) return '/home/data/displacement'
    if (path.includes('/photo')) return '/home/data/photo'
    if (path.includes('/video')) return '/home/data/video'
    return '/home/data/displacement'
  })
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 标签栏 -->
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
              : 'text-muted hover:text-default hover:bg-accented',
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
