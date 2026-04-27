<script setup lang="ts">
  // 子页面，不需要 layout

  import { sub } from 'date-fns'

  // ==================== Config & Selected Device Store ====================
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const selectedDeviceStore = useSelectedDeviceStore()

  // ==================== Types ====================
  interface TunnelMonitoringData {
    timestamp: string
    sn: string
    ringNumber: string
    p1x: number | null
    p1y: number | null
    p7x: number | null
    p7y: number | null
    p3x: number | null
    p3y: number | null
    p5x: number | null
    p5y: number | null
    p9x: number | null
    p9y: number | null
    coc: number | null
    hc: number | null
    sd: number | null
  }

  // ==================== State ====================
  const warningData = ref<
    Array<{
      id: number
      index: number
      pointName: string
      time: string
      horizontal: number
      vertical: number
    }>
  >([])

  const pieData = ref([
    { name: '正常', value: 0, color: '#22c55e' },
    { name: '预警', value: 0, color: '#f59e0b' },
    { name: '报警', value: 0, color: '#ef4444' },
  ])

  const historyData = ref<
    Array<{
      id: number
      index: number
      pointName: string
      time: string
      detail: string
      reason: string
      type: string
    }>
  >([])

  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
  })

  const historyPagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
  })

  const dateRange = ref({
    start: sub(new Date(), { days: 30 }),
    end: new Date(),
  })

  const monitoringData = ref<TunnelMonitoringData[]>([])
  const isLoading = ref(false)

  // ==================== API ====================
  async function fetchAlarmData() {
    if (!selectedDeviceStore.selectedDevice?.code) {
      warningData.value = []
      historyData.value = []
      updatePieData()
      return
    }

    isLoading.value = true
    try {
      // 获取监测数据
      const res = await $fetch<{ data: TunnelMonitoringData[] }>(
        `${apiBase}/api/v1/mqtt/tunnel-monitoring`,
        {
          query: {
            sn: selectedDeviceStore.selectedDevice.code,
            limit: 1000,
          },
        }
      )
      monitoringData.value = res.data || []

      // 处理预警数据
      updateWarningData()

      // 更新饼图数据
      updatePieData()
    } catch (e) {
      console.error('Failed to fetch alarm data:', e)
    } finally {
      isLoading.value = false
    }
  }

  function updateWarningData() {
    // 筛选超过阈值的数据作为预警数据
    const threshold = 3.0 // 示例阈值，单位mm
    const filtered = monitoringData.value
      .filter((d) => {
        const horizontal = Math.abs(d.p9x ?? 0)
        const vertical = Math.abs(d.p9y ?? 0)
        return horizontal > threshold || vertical > threshold
      })
      .slice(0, 20)

    warningData.value = filtered.map((item, idx) => ({
      id: idx,
      index: idx + 1,
      pointName: item.ringNumber || '-',
      time: new Date(item.timestamp).toLocaleString('zh-CN'),
      horizontal: item.p9x ?? 0,
      vertical: item.p9y ?? 0,
    }))

    pagination.value.total = warningData.value.length

    // 更新历史数据
    historyData.value = filtered.map((item, idx) => ({
      id: idx,
      index: idx + 1,
      pointName: item.ringNumber || '-',
      time: new Date(item.timestamp).toLocaleString('zh-CN'),
      detail: '水平/垂直位移超阈值',
      reason: '根据实时监测数据判定',
      type:
        Math.abs(item.p9x ?? 0) > 5 || Math.abs(item.p9y ?? 0) > 5
          ? '报警'
          : '预警',
    }))

    historyPagination.value.total = historyData.value.length
  }

  function updatePieData() {
    const total = monitoringData.value.length || 0
    const warningCount = warningData.value.length
    const alarmCount = warningData.value.filter(
      (d) => Math.abs(d.horizontal) > 5 || Math.abs(d.vertical) > 5
    ).length
    const normalCount = Math.max(0, total - warningCount)

    pieData.value = [
      { name: '正常', value: normalCount, color: '#22c55e' },
      { name: '预警', value: warningCount - alarmCount, color: '#f59e0b' },
      { name: '报警', value: alarmCount, color: '#ef4444' },
    ]
  }

  // ==================== Watchers ====================
  watch(
    () => selectedDeviceStore.selectedDevice,
    () => {
      fetchAlarmData()
    },
    { immediate: true }
  )

  function onPageChange(page: number) {
    pagination.value.page = page
  }

  function onHistoryPageChange(page: number) {
    historyPagination.value.page = page
  }

  // ==================== Computed ====================
  const total = computed(() =>
    pieData.value.reduce((sum, item) => sum + item.value, 0)
  )

  const pieSlices = computed(() => {
    if (total.value === 0)
      return pieData.value.map((item) => ({
        ...item,
        percent: 0,
        offset: 0,
      }))

    let cumulative = 0
    return pieData.value.map((item) => {
      const percent = Math.round((item.value / total.value) * 100)
      const slice = {
        ...item,
        percent,
        offset: -cumulative,
      }
      cumulative += percent
      return slice
    })
  })
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- 第一行：预警数据列表 + 饼状图 -->
    <div class="grid grid-cols-3 gap-4">
      <!-- 预警数据列表 -->
      <div class="col-span-2 bg-elevated border border-default rounded-xl p-4">
        <h3 class="font-semibold mb-4">预警数据列表</h3>
        <div class="overflow-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-default">
                <th class="text-left py-2 px-2 text-muted font-medium">序号</th>
                <th class="text-left py-2 px-2 text-muted font-medium">点名</th>
                <th class="text-left py-2 px-2 text-muted font-medium">
                  监测时间
                </th>
                <th class="text-right py-2 px-2 text-muted font-medium">
                  水平位移
                </th>
                <th class="text-right py-2 px-2 text-muted font-medium">
                  竖直位移
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in warningData"
                :key="item.id"
                class="border-b border-default/50 hover:bg-muted/5"
              >
                <td class="py-2 px-2">{{ item.index }}</td>
                <td class="py-2 px-2">{{ item.pointName }}</td>
                <td class="py-2 px-2">{{ item.time }}</td>
                <td class="py-2 px-2 text-right text-red-500 font-medium">
                  +{{ item.horizontal }} mm
                </td>
                <td class="py-2 px-2 text-right text-red-500 font-medium">
                  +{{ item.vertical }} mm
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 分页 -->
        <div class="mt-4 flex justify-center">
          <UPagination
            v-model:page="pagination.page"
            :page-count="pagination.pageSize"
            :total="pagination.total"
            size="sm"
            @update:page="onPageChange"
          />
        </div>
      </div>

      <!-- 饼状图 -->
      <div class="bg-elevated border border-default rounded-xl p-4">
        <h3 class="font-semibold mb-4">预警点位统计</h3>
        <div class="flex flex-col items-center">
          <!-- 饼图 -->
          <div class="relative w-48 h-48">
            <svg
              viewBox="0 0 200 200"
              class="w-full h-full"
            >
              <circle
                v-for="(slice, idx) in pieSlices"
                :key="slice.name"
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                :stroke="slice.color"
                stroke-width="40"
                :stroke-dasharray="`${slice.percent * 4.4} 440`"
                :stroke-dashoffset="slice.offset * 4.4"
                stroke-linecap="round"
              />
              <text
                x="100"
                y="95"
                text-anchor="middle"
                class="text-sm fill-muted"
              >
                设备总数
              </text>
              <text
                x="100"
                y="120"
                text-anchor="middle"
                class="text-2xl font-bold fill-foreground"
              >
                {{ total }}
              </text>
            </svg>
          </div>

          <!-- 图例 -->
          <div class="mt-4 space-y-2 w-full">
            <div
              v-for="slice in pieSlices"
              :key="slice.name"
              class="flex items-center justify-between text-sm"
            >
              <div class="flex items-center gap-2">
                <span
                  class="h-3 w-3 rounded-full"
                  :style="{ background: slice.color }"
                />
                <span class="text-muted">{{ slice.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ slice.value }}</span>
                <span class="text-muted text-xs">({{ slice.percent }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：历史预警列表 -->
    <div class="bg-elevated border border-default rounded-xl p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold">历史预警列表</h3>
        <!-- 时间筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted">筛选时间：</span>
          <UInput
            v-model="dateRange.start"
            type="date"
            size="sm"
            class="w-36"
          />
          <span class="text-muted">至</span>
          <UInput
            v-model="dateRange.end"
            type="date"
            size="sm"
            class="w-36"
          />
        </div>
      </div>

      <div class="overflow-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2 px-2 text-muted font-medium">序号</th>
              <th class="text-left py-2 px-2 text-muted font-medium">点名</th>
              <th class="text-left py-2 px-2 text-muted font-medium">
                监测时间
              </th>
              <th class="text-left py-2 px-2 text-muted font-medium">
                详细信息
              </th>
              <th class="text-left py-2 px-2 text-muted font-medium">原因</th>
              <th class="text-center py-2 px-2 text-muted font-medium">
                预警类型
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in historyData"
              :key="item.id"
              class="border-b border-default/50 hover:bg-muted/5"
            >
              <td class="py-2 px-2">{{ item.index }}</td>
              <td class="py-2 px-2">{{ item.pointName }}</td>
              <td class="py-2 px-2">{{ item.time }}</td>
              <td class="py-2 px-2">{{ item.detail }}</td>
              <td class="py-2 px-2 text-muted">{{ item.reason }}</td>
              <td class="py-2 px-2 text-center">
                <UBadge
                  :color="item.type === '报警' ? 'error' : 'warning'"
                  variant="subtle"
                >
                  {{ item.type }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 分页 -->
      <div class="mt-4 flex justify-center">
        <UPagination
          v-model:page="historyPagination.page"
          :page-count="historyPagination.pageSize"
          :total="historyPagination.total"
          size="sm"
          @update:page="onHistoryPageChange"
        />
      </div>
    </div>
  </div>
</template>
