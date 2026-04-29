<script setup lang="ts">
  import { sub } from 'date-fns'

  definePageMeta({
    keepAlive: true,
  })

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const route = useRoute()

  const deviceId = computed(() => route.params.deviceId as string)

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

  interface MeasurementPoint {
    id: string
    name: string
    ringNumber?: string | null
  }

  interface DeviceWithPoints {
    id: string
    name: string
    code: string
    project: string | null
    measurementPoints: MeasurementPoint[]
  }

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

  const warningDataAll = ref<typeof warningData.value>([])

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

  const historyDataAll = ref<typeof historyData.value>([])

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
  const ringNumberToNameMap = ref<Record<string, string>>({})
  const currentDevice = ref<DeviceWithPoints | null>(null)

  async function fetchMeasurementPoints() {
    if (!deviceId.value) return
    try {
      const device = await $fetch<DeviceWithPoints>(
        `${apiBase}/api/v1/device/${deviceId.value}`
      )
      currentDevice.value = device
      const points = device.measurementPoints || []

      const newMap: Record<string, string> = {}
      points.forEach((p) => {
        if (p.ringNumber) {
          newMap[p.ringNumber] = p.name
        }
      })
      ringNumberToNameMap.value = newMap
    } catch (e) {
      console.error('Failed to fetch measurement points:', e)
    }
  }

  async function fetchAlarmData() {
    if (!currentDevice.value?.code) {
      warningData.value = []
      historyData.value = []
      updatePieData()
      return
    }

    isLoading.value = true
    try {
      const res = await $fetch<{ data: TunnelMonitoringData[] }>(
        `${apiBase}/api/v1/mqtt/tunnel-monitoring`,
        {
          query: {
            sn: currentDevice.value.code,
            limit: 1000,
          },
        }
      )
      monitoringData.value = res.data || []

      updateWarningData()
      updatePieData()
    } catch (e) {
      console.error('Failed to fetch alarm data:', e)
    } finally {
      isLoading.value = false
    }
  }

  function updateWarningData() {
    const threshold = 3.0
    const filtered = monitoringData.value.filter((d) => {
      const horizontal = Math.abs(d.p9x ?? 0)
      const vertical = Math.abs(d.p9y ?? 0)
      return horizontal > threshold || vertical > threshold
    })

    warningDataAll.value = filtered.map((item, idx) => ({
      id: idx,
      index: idx + 1,
      pointName:
        ringNumberToNameMap.value[item.ringNumber] || item.ringNumber || '-',
      time: new Date(item.timestamp).toLocaleString('zh-CN'),
      horizontal: item.p9x ?? 0,
      vertical: item.p9y ?? 0,
    }))

    pagination.value.total = warningDataAll.value.length

    historyDataAll.value = filtered.map((item, idx) => ({
      id: idx,
      index: idx + 1,
      pointName:
        ringNumberToNameMap.value[item.ringNumber] || item.ringNumber || '-',
      time: new Date(item.timestamp).toLocaleString('zh-CN'),
      detail: '水平/垂直位移超阈值',
      reason: '根据实时监测数据判定',
      type:
        Math.abs(item.p9x ?? 0) > 5 || Math.abs(item.p9y ?? 0) > 5
          ? '报警'
          : '预警',
    }))

    historyPagination.value.total = historyDataAll.value.length
  }

  const paginatedWarningData = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return warningDataAll.value.slice(start, end).map((item, idx) => ({
      ...item,
      index: start + idx + 1,
    }))
  })

  const paginatedHistoryData = computed(() => {
    const start =
      (historyPagination.value.page - 1) * historyPagination.value.pageSize
    const end = start + historyPagination.value.pageSize
    return historyDataAll.value.slice(start, end).map((item, idx) => ({
      ...item,
      index: start + idx + 1,
    }))
  })

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

  watch(
    deviceId,
    async () => {
      pagination.value.page = 1
      historyPagination.value.page = 1
      await fetchMeasurementPoints()
      fetchAlarmData()
    },
    { immediate: true }
  )

  watch(
    [() => pagination.value.page, () => historyPagination.value.page],
    () => {
      updatePieData()
    }
  )

  function onPageChange(page: number) {
    pagination.value.page = page
  }

  function onHistoryPageChange(page: number) {
    historyPagination.value.page = page
  }

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
    <div class="grid grid-cols-3 gap-4">
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
                v-for="item in paginatedWarningData"
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

      <div class="bg-elevated border border-default rounded-xl p-4">
        <h3 class="font-semibold mb-4">预警点位统计</h3>
        <div class="flex flex-col items-center">
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

    <div class="bg-elevated border border-default rounded-xl p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold">历史预警列表</h3>
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
              v-for="item in paginatedHistoryData"
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
