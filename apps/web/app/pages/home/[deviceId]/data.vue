<script setup lang="ts">
  definePageMeta({
    middleware: [
      (to: ReturnType<typeof useRoute>) => {
        if (to.path.endsWith('/data') || to.path.endsWith('/data/')) {
          return navigateTo(
            to.path.replace(/\/data\/?$/, '/data/displacement'),
            { replace: true }
          )
        }
      },
    ],
  })

  const tabs = [
    {
      label: '位移数据查看',
      path: 'displacement',
      icon: 'i-lucide-chart-line',
    },
    { label: '照片查看', path: 'photo', icon: 'i-lucide-image' },
    { label: '视频查看', path: 'video', icon: 'i-lucide-video' },
  ]

  const route = useRoute()

  const activeTab = computed(() => {
    const path = route.path
    if (path.includes('/displacement')) return 'displacement'
    if (path.includes('/photo')) return 'photo'
    if (path.includes('/video')) return 'video'
    return 'displacement'
  })
</script>

<template>
  <div class="h-full flex flex-col">
    <div
      class="h-10 border-b border-default bg-default flex items-center px-4 shrink-0"
    >
      <div class="flex items-center gap-1">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.path"
          :to="`/home/${route.params.deviceId}/data/${tab.path}`"
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

    <div class="flex-1 overflow-auto">
      <NuxtPage />
    </div>
  </div>
</template>
