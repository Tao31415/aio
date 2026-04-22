<template>
  <div
    class="bg-elevated border border-border rounded-xl p-5 space-y-4 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200"
  >
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-foreground">渠道占比</h3>
      <span class="text-xs text-muted">实时</span>
    </div>

    <!-- Pie Chart -->
    <div
      class="flex-1 flex items-center justify-center relative"
      style="min-height: 200px"
    >
      <svg
        viewBox="0 0 200 200"
        class="w-full h-full max-w-[200px] max-h-[200px]"
      >
        <circle
          v-for="(slice, idx) in slices"
          :key="slice.name"
          cx="100"
          cy="100"
          r="70"
          fill="transparent"
          :stroke="slice.color"
          stroke-width="30"
          :stroke-dasharray="`${slice.percent * 4.4} 440`"
          :stroke-dashoffset="offsets[idx] * 4.4"
          stroke-linecap="round"
          class="transition-all duration-300"
        />
        <text
          x="100"
          y="95"
          text-anchor="middle"
          class="text-sm fill-muted"
        >
          总转化
        </text>
        <text
          x="100"
          y="115"
          text-anchor="middle"
          class="text-2xl font-bold fill-foreground"
        >
          {{ total }}
        </text>
      </svg>
    </div>

    <!-- Legend -->
    <div class="grid grid-cols-2 gap-3 text-sm">
      <div
        v-for="slice in slices"
        :key="slice.name"
        class="flex items-center gap-2"
      >
        <span
          class="h-2.5 w-2.5 rounded-full shrink-0 transition-transform hover:scale-110"
          :style="{ background: slice.color }"
        />
        <span class="text-muted truncate">{{ slice.name }}</span>
        <span class="ml-auto font-medium text-foreground">
          {{ slice.percent }}%
        </span>
      </div>
    </div>
  </div>
</template>

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

  // 使用 CSS 变量以支持暗色模式
  const colors = [
    'rgb(var(--color-sky-500) / 1)',
    'rgb(var(--color-emerald-500) / 1)',
    'rgb(var(--color-amber-500) / 1)',
    'rgb(var(--color-violet-500) / 1)',
  ]

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

  const offsets = computed(() => {
    let cumulative = 0
    return slices.value.map((slice) => {
      const offset = cumulative
      cumulative += slice.percent
      return -offset // Negative for counter-clockwise rotation
    })
  })

  const total = computed(() => {
    const data = props.data || defaultData
    return data.reduce((sum, item) => sum + item.value, 0)
  })
</script>
