<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">数据分析</h1>
        <p class="text-muted-foreground">查看系统运营数据和统计报表</p>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="timeRange"
          class="h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="7d">最近7天</option>
          <option value="30d">最近30天</option>
          <option value="90d">最近90天</option>
          <option value="1y">最近1年</option>
        </select>
        <button
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          导出报表
        </button>
      </div>
    </div>

    <!-- 关键指标 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="metric in keyMetrics"
        :key="metric.label"
        class="bg-card rounded-xl border p-6"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">{{ metric.label }}</span>
          <span
            :class="[
              'text-xs px-2 py-1 rounded-full',
              metric.trend >= 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            ]"
          >
            {{ metric.trend >= 0 ? '+' : '' }}{{ metric.trend }}%
          </span>
        </div>
        <p class="text-3xl font-bold mt-2">{{ metric.value }}</p>
        <p class="text-sm text-muted-foreground mt-1">
          较上期 {{ metric.comparison }}
        </p>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 访问量趋势 -->
      <div class="bg-card rounded-xl border p-6">
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
        <div class="flex justify-between mt-4 text-xs text-muted-foreground">
          <span>周一</span>
          <span>周二</span>
          <span>周三</span>
          <span>周四</span>
          <span>周五</span>
          <span>周六</span>
          <span>周日</span>
        </div>
      </div>

      <!-- 用户来源 -->
      <div class="bg-card rounded-xl border p-6">
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
            <div class="h-2 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="source.color"
                :style="{ width: `${source.percentage}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 用户活跃度 -->
      <div class="bg-card rounded-xl border p-6">
        <h3 class="font-semibold mb-4">用户活跃度</h3>
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(day, index) in activityData"
            :key="index"
            class="aspect-square rounded-sm transition-colors"
            :class="{
              'bg-muted': day === 0,
              'bg-primary/20': day === 1,
              'bg-primary/40': day === 2,
              'bg-primary/60': day === 3,
              'bg-primary': day === 4,
            }"
            :title="`活跃度: ${day}`"
          />
        </div>
        <div
          class="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground"
        >
          <span>低</span>
          <div class="flex gap-1">
            <div class="w-3 h-3 rounded-sm bg-muted" />
            <div class="w-3 h-3 rounded-sm bg-primary/20" />
            <div class="w-3 h-3 rounded-sm bg-primary/40" />
            <div class="w-3 h-3 rounded-sm bg-primary/60" />
            <div class="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>高</span>
        </div>
      </div>

      <!-- 设备分布 -->
      <div class="bg-card rounded-xl border p-6">
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
                class="text-blue-500"
                :stroke-dasharray="`${deviceData.desktop * 2.51} 251`"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                stroke-width="20"
                class="text-green-500"
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
                class="text-yellow-500"
                :stroke-dasharray="`${deviceData.tablet * 2.51} 251`"
                :stroke-dashoffset="`-${(deviceData.desktop + deviceData.mobile) * 2.51}`"
              />
            </svg>
          </div>
        </div>
        <div class="flex items-center justify-center gap-6 mt-4">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500" />
            <span class="text-sm">桌面 {{ deviceData.desktop }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-green-500" />
            <span class="text-sm">移动 {{ deviceData.mobile }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-yellow-500" />
            <span class="text-sm">平板 {{ deviceData.tablet }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门页面 -->
    <div class="bg-card rounded-xl border p-6">
      <h3 class="font-semibold mb-4">热门页面</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 font-medium">页面</th>
              <th class="text-right py-3 font-medium">访问量</th>
              <th class="text-right py-3 font-medium">独立访客</th>
              <th class="text-right py-3 font-medium">跳出率</th>
              <th class="text-right py-3 font-medium">平均时长</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="page in topPages"
              :key="page.path"
              class="border-b last:border-0"
            >
              <td class="py-3">
                <div class="flex items-center gap-2">
                  <span class="text-primary">{{ page.path }}</span>
                </div>
              </td>
              <td class="text-right py-3">{{ page.views.toLocaleString() }}</td>
              <td class="text-right py-3">
                {{ page.visitors.toLocaleString() }}
              </td>
              <td class="text-right py-3">{{ page.bounceRate }}%</td>
              <td class="text-right py-3">{{ page.avgDuration }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    auth: 'user',
  })

  const timeRange = ref('7d')

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
    { name: '直接访问', percentage: 35, color: 'bg-blue-500' },
    { name: '搜索引擎', percentage: 28, color: 'bg-green-500' },
    { name: '社交媒体', percentage: 22, color: 'bg-yellow-500' },
    { name: '外部链接', percentage: 15, color: 'bg-purple-500' },
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
</script>
