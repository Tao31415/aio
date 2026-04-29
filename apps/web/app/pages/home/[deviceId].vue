<script setup lang="ts">
  definePageMeta({
    layout: 'home',
    keepAlive: true,
  })

  const route = useRoute()
  const selectedDeviceStore = useSelectedDeviceStore()

  const deviceId = computed(() => route.params.deviceId as string)

  watch(
    deviceId,
    (newId) => {
      if (newId) {
        selectedDeviceStore.setSelectedDeviceById(newId)
      }
    },
    { immediate: true }
  )

  const tabs = computed(() => [
    {
      label: '设备信息',
      path: `/home/${deviceId.value}/basic`,
      icon: 'i-lucide-info',
    },
    {
      label: '数据查看',
      path: `/home/${deviceId.value}/data/displacement`,
      icon: 'i-lucide-chart-line',
    },
    {
      label: '数据预警',
      path: `/home/${deviceId.value}/alarm`,
      icon: 'i-lucide-bell',
    },
  ])

  const activeTab = computed(() => {
    const path = route.path
    if (path.includes('/basic')) return `/home/${deviceId.value}/basic`
    if (path.includes('/data'))
      return `/home/${deviceId.value}/data/displacement`
    if (path.includes('/alarm')) return `/home/${deviceId.value}/alarm`
    return `/home/${deviceId.value}/basic`
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
    <div class="flex-1 overflow-auto">
      <NuxtPage />
    </div>
  </div>
</template>
