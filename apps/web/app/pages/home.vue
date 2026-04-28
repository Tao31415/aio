<script setup lang="ts">
  import { useDeviceStatsStore } from '~/stores/device-stats.store'

  definePageMeta({
    layout: 'home',
  })

  const deviceStatsStore = useDeviceStatsStore()
  const selectedDeviceStore = useSelectedDeviceStore()
  const route = useRoute()

  onMounted(() => {
    deviceStatsStore.fetchDashboardStats()
    deviceStatsStore.startAutoRefresh(30000)
  })

  const stats = computed(() => [
    {
      title: '设备总数',
      value: deviceStatsStore.stats.totalDevices,
      icon: 'i-lucide-server',
      bgColor: 'bg-blue-500',
    },
    {
      title: '在线设备',
      value: deviceStatsStore.stats.onlineDevices,
      icon: 'i-lucide-circle-check',
      bgColor: 'bg-green-500',
    },
    {
      title: '预警设备',
      value: deviceStatsStore.stats.warningDevices,
      icon: 'i-lucide-alert-triangle',
      bgColor: 'bg-yellow-500',
    },
    {
      title: '报警设备',
      value: deviceStatsStore.stats.alarmDevices,
      icon: 'i-lucide-alert-circle',
      bgColor: 'bg-red-500',
    },
  ])

  onUnmounted(() => {
    deviceStatsStore.stopAutoRefresh()
  })
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-default">
      <UAlert
        v-if="deviceStatsStore.error"
        color="error"
        variant="soft"
        title="加载失败"
        :description="deviceStatsStore.error"
        class="mb-4"
        :actions="[
          {
            label: '重试',
            color: 'error',
            variant: 'solid',
            onClick: () => deviceStatsStore.fetchDashboardStats(),
          },
        ]"
      />

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
          <p
            v-if="index === 0"
            class="text-xs text-white/70 mt-1"
          >
            离线设备: {{ deviceStatsStore.stats.offlineDevices }}
          </p>
          <p
            v-if="index === 1"
            class="text-xs text-white/70 mt-1"
          >
            正常设备: {{ deviceStatsStore.stats.normalDevices }}
          </p>
        </div>
      </UPageGrid>
      <div
        v-if="deviceStatsStore.lastRefresh"
        class="text-xs text-gray-500 mt-2 text-center"
      >
        最后更新: {{ deviceStatsStore.lastRefresh.toLocaleTimeString() }}
        <span
          v-if="deviceStatsStore.loading"
          class="ml-2"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="w-3 h-3 animate-spin inline-block"
          />
        </span>
      </div>
      <div
        v-if="!deviceStatsStore.lastRefresh && !deviceStatsStore.error"
        class="text-xs text-gray-500 mt-2 text-center"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-3 h-3 animate-spin inline-block mr-1"
        />
        正在加载数据...
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <NuxtPage />
    </div>
  </div>
</template>
