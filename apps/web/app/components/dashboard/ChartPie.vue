<script setup lang="ts">
  interface PieSlice {
    name: string
    value: number
    percent: number
    color: string
  }

  const props = defineProps<{
    data?: Array<{ name: string; value: number }>
    loading?: boolean
  }>()

  // Default mock data matching Next.js implementation
  const defaultData = [
    { name: '广告', value: 380 },
    { name: '自然流量', value: 260 },
    { name: '邮件', value: 180 },
    { name: '社交', value: 180 },
  ]

  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#06b6d4']

  const slices = computed<PieSlice[]>(() => {
    const data = props.data || defaultData
    const total = data.reduce((sum, item) => sum + item.value, 0)

    return data.map((item, idx) => ({
      name: item.name,
      value: item.value,
      percent: Math.round((item.value / total) * 100),
      color: colors[idx % colors.length],
    }))
  })

  const total = computed(() => {
    const data = props.data || defaultData
    return data.reduce((sum, item) => sum + item.value, 0)
  })

  // ECharts pie chart option
  const chartOption = computed(() => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: false,
          },
        },
        labelLine: {
          show: false,
        },
        data: slices.value.map((slice) => ({
          name: slice.name,
          value: slice.value,
          itemStyle: {
            color: slice.color,
          },
        })),
      },
    ],
  }))
</script>

<template>
  <div
    class="bg-elevated border border-default rounded-xl p-6 space-y-4 h-full flex flex-col"
  >
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">渠道占比</h3>
      <span class="text-xs text-muted">实时</span>
    </div>

    <!-- Pie Chart -->
    <div
      class="flex-1 flex items-center justify-center relative"
      style="min-height: 200px"
    >
      <VChart
        :option="chartOption"
        autoresize
        class="w-full h-full max-w-[200px] max-h-[200px]"
      />
    </div>

    <!-- Legend -->
    <div class="grid grid-cols-2 gap-3 text-sm">
      <div
        v-for="slice in slices"
        :key="slice.name"
        class="flex items-center gap-2"
      >
        <span
          class="h-2 w-2 rounded-full shrink-0"
          :style="{ background: slice.color }"
        />
        <span class="text-muted truncate">{{ slice.name }}</span>
        <span class="ml-auto font-medium">{{ slice.percent }}%</span>
      </div>
    </div>
  </div>
</template>
