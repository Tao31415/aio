<script setup lang="ts">
  import { h } from 'vue'
  import { APP_ROUTE_MAP } from '~/utils/route-config'

  definePageMeta({
    title: APP_ROUTE_MAP['/analytics']!.title,
    icon: APP_ROUTE_MAP['/analytics']!.icon,
    layout: 'dashboard',
    auth: 'user',
  })

  const timeRange = ref('7d')
  const timeRangeOptions = [
    { label: '最近7天', value: '7d' },
    { label: '最近30天', value: '30d' },
    { label: '最近90天', value: '90d' },
    { label: '最近1年', value: '1y' },
  ]

  // 关键指标
  const keyMetrics = ref([
    { label: '总访问量', value: '124,567', trend: 12.5, comparison: '+14,023' },
    { label: '独立访客', value: '45,678', trend: 8.2, comparison: '+3,456' },
    { label: '页面浏览', value: '234,567', trend: -2.4, comparison: '-5,789' },
    { label: '平均时长', value: '3m 24s', trend: 5.7, comparison: '+11s' },
  ])

  // 访问量数据
  const visitData = ref([
    { value: 65 },
    { value: 78 },
    { value: 56 },
    { value: 89 },
    { value: 92 },
    { value: 45 },
    { value: 38 },
  ])

  // 流量来源
  const trafficSources = ref([
    { name: '直接访问', percentage: 35, colorClass: 'bg-[var(--chart-1)]' },
    { name: '搜索引擎', percentage: 28, colorClass: 'bg-[var(--chart-2)]' },
    { name: '社交媒体', percentage: 22, colorClass: 'bg-[var(--chart-3)]' },
    { name: '外部链接', percentage: 15, colorClass: 'bg-[var(--chart-4)]' },
  ])

  // 活跃度数据（模拟热力图）
  const activityData = ref(
    Array.from({ length: 28 }, () => Math.floor(Math.random() * 5))
  )

  // 设备数据
  const deviceData = ref({
    desktop: 55,
    mobile: 35,
    tablet: 10,
  })

  // 热门页面
  const topPages = ref([
    {
      path: '/dashboard',
      views: 12345,
      visitors: 8234,
      bounceRate: 32,
      avgDuration: '2m 45s',
    },
    {
      path: '/users',
      views: 8765,
      visitors: 5432,
      bounceRate: 28,
      avgDuration: '3m 12s',
    },
    {
      path: '/settings',
      views: 6543,
      visitors: 4321,
      bounceRate: 45,
      avgDuration: '1m 30s',
    },
    {
      path: '/messages',
      views: 5432,
      visitors: 3210,
      bounceRate: 22,
      avgDuration: '4m 05s',
    },
    {
      path: '/analytics',
      views: 4321,
      visitors: 2109,
      bounceRate: 38,
      avgDuration: '2m 18s',
    },
  ])

  const analyticsColumns = [
    {
      accessorKey: 'path',
      header: '页面',
      cell: ({ row }: { row: { original: { path: string } } }) =>
        h('span', { class: 'text-primary font-medium' }, row.original.path),
    },
    {
      accessorKey: 'views',
      header: () => h('div', { class: 'text-right' }, '访问量'),
      cell: ({ row }: { row: { original: { views: number } } }) =>
        h('div', { class: 'text-right' }, row.original.views.toLocaleString()),
    },
    {
      accessorKey: 'visitors',
      header: () => h('div', { class: 'text-right' }, '独立访客'),
      cell: ({ row }: { row: { original: { visitors: number } } }) =>
        h(
          'div',
          { class: 'text-right' },
          row.original.visitors.toLocaleString()
        ),
    },
    {
      accessorKey: 'bounceRate',
      header: () => h('div', { class: 'text-right' }, '跳出率'),
      cell: ({ row }: { row: { original: { bounceRate: number } } }) =>
        h('div', { class: 'text-right' }, `${row.original.bounceRate}%`),
    },
    {
      accessorKey: 'avgDuration',
      header: () => h('div', { class: 'text-right' }, '平均时长'),
      cell: ({ row }: { row: { original: { avgDuration: string } } }) =>
        h('div', { class: 'text-right' }, row.original.avgDuration),
    },
  ]
</script>
<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">数据分析</h1>
        <p class="text-muted">查看系统运营数据和统计报表</p>
      </div>
      <div class="flex items-center gap-2">
        <USelect
          v-model="timeRange"
          :items="timeRangeOptions"
          value-key="value"
          class="w-36"
        />
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-download"
        >
          导出报表
        </UButton>
      </div>
    </div>

    <!-- 关键指标 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard
        v-for="metric in keyMetrics"
        :key="metric.label"
        :ui="{ body: 'p-6' }"
        class="shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted">{{ metric.label }}</span>
          <UBadge
            :color="metric.trend >= 0 ? 'success' : 'error'"
            variant="soft"
          >
            {{ metric.trend >= 0 ? '+' : '' }}{{ metric.trend }}%
          </UBadge>
        </div>
        <p class="text-3xl font-bold mt-2 text-foreground">
          {{ metric.value }}
        </p>
        <p class="text-sm text-muted mt-1">较上期 {{ metric.comparison }}</p>
      </UCard>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 访问量趋势 -->
      <UCard
        :ui="{ body: 'p-6' }"
        class="shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <h3 class="font-semibold mb-4">访问量趋势</h3>
        <div class="h-64 flex items-end justify-between gap-1">
          <div
            v-for="(bar, index) in visitData"
            :key="index"
            class="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40 relative group"
            :style="{ height: `${bar.value}%` }"
          >
            <div
              class="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
            >
              {{ bar.value }}
            </div>
          </div>
        </div>
        <div class="flex justify-between mt-4 text-xs text-muted">
          <span>周一</span>
          <span>周二</span>
          <span>周三</span>
          <span>周四</span>
          <span>周五</span>
          <span>周六</span>
          <span>周日</span>
        </div>
      </UCard>

      <!-- 用户来源 -->
      <UCard
        :ui="{ body: 'p-6' }"
        class="shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <h3 class="font-semibold mb-4">用户来源</h3>
        <div class="space-y-4">
          <div
            v-for="source in trafficSources"
            :key="source.name"
            class="space-y-2"
          >
            <div class="flex items-center justify-between text-sm">
              <span>{{ source.name }}</span>
              <span class="font-medium">{{ source.percentage }}%</span>
            </div>
            <div class="h-2 bg-accented rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="source.colorClass"
                :style="{ width: `${source.percentage}%` }"
              />
            </div>
          </div>
        </div>
      </UCard>

      <!-- 用户活跃度 -->
      <UCard
        :ui="{ body: 'p-6' }"
        class="shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <h3 class="font-semibold mb-4">用户活跃度</h3>
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(day, index) in activityData"
            :key="index"
            class="aspect-square rounded-sm transition-colors"
            :class="{
              'bg-accented': day === 0,
              'bg-primary/20': day === 1,
              'bg-primary/40': day === 2,
              'bg-primary/60': day === 3,
              'bg-primary': day === 4,
            }"
            :title="`活跃度: ${day}`"
          />
        </div>
        <div
          class="flex items-center justify-end gap-2 mt-4 text-xs text-muted"
        >
          <span>低</span>
          <div class="flex gap-1">
            <div class="w-3 h-3 rounded-sm bg-accented" />
            <div class="w-3 h-3 rounded-sm bg-primary/20" />
            <div class="w-3 h-3 rounded-sm bg-primary/40" />
            <div class="w-3 h-3 rounded-sm bg-primary/60" />
            <div class="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>高</span>
        </div>
      </UCard>

      <!-- 设备分布 -->
      <UCard
        :ui="{ body: 'p-6' }"
        class="shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <h3 class="font-semibold mb-4">设备分布</h3>
        <div class="flex items-center justify-center h-48">
          <div class="relative w-40 h-40">
            <!-- 简易饼图 -->
            <svg
              viewBox="0 0 100 100"
              class="transform -rotate-90"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                stroke-width="20"
                class="text-[var(--chart-1)]"
                :stroke-dasharray="`${deviceData.desktop * 2.51} 251`"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                stroke-width="20"
                class="text-[var(--chart-2)]"
                :stroke-dasharray="`${deviceData.mobile * 2.51} 251`"
                :stroke-dashoffset="`-${deviceData.desktop * 2.51}`"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                stroke-width="20"
                class="text-[var(--chart-3)]"
                :stroke-dasharray="`${deviceData.tablet * 2.51} 251`"
                :stroke-dashoffset="`-${(deviceData.desktop + deviceData.mobile) * 2.51}`"
              />
            </svg>
          </div>
        </div>
        <div class="flex items-center justify-center gap-6 mt-4">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[var(--chart-1)]" />
            <span class="text-sm">桌面 {{ deviceData.desktop }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[var(--chart-2)]" />
            <span class="text-sm">移动 {{ deviceData.mobile }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[var(--chart-3)]" />
            <span class="text-sm">平板 {{ deviceData.tablet }}%</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 热门页面 -->
    <UCard
      :ui="{ body: 'p-6' }"
      class="shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <h3 class="font-semibold mb-4">热门页面</h3>
      <div class="overflow-x-auto">
        <UTable
          :data="topPages"
          :columns="analyticsColumns"
          class="w-full"
        />
      </div>
    </UCard>
  </div>
</template>
