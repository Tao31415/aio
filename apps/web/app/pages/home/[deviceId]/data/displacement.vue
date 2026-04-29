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

  const startDatetime = ref('')
  const endDatetime = ref('')
  const selectedPoint = ref('all')
  const pointOptions = ref<Array<{ label: string; value: string }>>([])
  const ringNumberToNameMap = ref<Record<string, string>>({})
  const currentDevice = ref<DeviceWithPoints | null>(null)

  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
  })

  const dataList = ref<
    Array<{
      id: number
      index: number
      pointName: string
      time: string
      horizontal: number
      vertical: number
    }>
  >([])

  const monitoringData = ref<TunnelMonitoringData[]>([])
  const isLoading = ref(false)
  const hasSearched = ref(false)

  function formatDateForInput(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  function initDateRange() {
    startDatetime.value = formatDateForInput(sub(new Date(), { hours: 1 }))
    endDatetime.value = formatDateForInput(new Date())
  }

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

      pointOptions.value = [
        { label: '全部', value: 'all' },
        ...points.map((p) => ({ label: p.name, value: p.name })),
      ]
    } catch (e) {
      console.error('Failed to fetch measurement points:', e)
      pointOptions.value = [{ label: '全部', value: 'all' }]
    }
  }

  async function fetchMonitoringData() {
    if (!currentDevice.value?.code) {
      return
    }

    isLoading.value = true
    hasSearched.value = true
    try {
      const queryParams: Record<string, string> = {
        sn: currentDevice.value.code,
        limit: '5000',
      }

      if (selectedPoint.value && selectedPoint.value !== 'all') {
        queryParams.ringNumber = selectedPoint.value
      }

      if (startDatetime.value) {
        queryParams.startTime = new Date(startDatetime.value).toISOString()
      }

      if (endDatetime.value) {
        queryParams.endTime = new Date(endDatetime.value).toISOString()
      }

      const res = await $fetch<{ data: TunnelMonitoringData[] }>(
        `${apiBase}/api/v1/mqtt/tunnel-monitoring`,
        { query: queryParams }
      )

      monitoringData.value = res.data || []
      pagination.value.total = monitoringData.value.length
      pagination.value.page = 1
      updateDataList()
    } catch (e) {
      console.error('Failed to fetch monitoring data:', e)
      monitoringData.value = []
      pagination.value.total = 0
    } finally {
      isLoading.value = false
    }
  }

  function updateDataList() {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    const pageData = monitoringData.value.slice(start, end)

    dataList.value = pageData.map((item, idx) => ({
      id: start + idx,
      index: start + idx + 1,
      pointName:
        ringNumberToNameMap.value[item.ringNumber] || item.ringNumber || '-',
      time: new Date(item.timestamp).toLocaleString('zh-CN'),
      horizontal: item.p9x ?? 0,
      vertical: item.p9y ?? 0,
    }))
  }

  onMounted(async () => {
    initDateRange()
    await fetchMeasurementPoints()
    await fetchMonitoringData()
  })

  function onPageChange(page: number) {
    pagination.value.page = page
    updateDataList()
  }

  const chartOption = computed(() => {
    const displayData = monitoringData.value.slice(0, 100)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['水平位移', '竖直位移'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: displayData.map((d) =>
          new Date(d.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })
        ),
      },
      yAxis: {
        type: 'value',
        name: '位移 (mm)',
        axisLabel: {
          formatter: '{value}',
        },
      },
      series: [
        {
          name: '水平位移',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: displayData.map((d) => d.p9x ?? 0),
          lineStyle: {
            color: '#3b82f6',
            width: 2,
          },
          itemStyle: {
            color: '#3b82f6',
          },
        },
        {
          name: '竖直位移',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: displayData.map((d) => d.p9y ?? 0),
          lineStyle: {
            color: '#f97316',
            width: 2,
          },
          itemStyle: {
            color: '#f97316',
          },
        },
      ],
    }
  })
</script>

<template>
  <div class="h-full flex flex-col p-4 gap-4">
    <div
      class="flex items-center flex-wrap gap-4 bg-elevated border border-default rounded-xl p-4"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">测点：</span>
        <USelect
          v-model="selectedPoint"
          :items="pointOptions"
          placeholder="选择测点"
          size="sm"
          class="w-40"
        />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">开始时间：</span>
        <UInput
          v-model="startDatetime"
          type="datetime-local"
          size="sm"
          class="w-48"
        />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">结束时间：</span>
        <UInput
          v-model="endDatetime"
          type="datetime-local"
          size="sm"
          class="w-48"
        />
      </div>

      <UButton
        size="sm"
        icon="i-lucide-search"
        @click="fetchMonitoringData"
      >
        查找
      </UButton>
    </div>

    <div class="flex-1 grid grid-cols-2 gap-4 min-h-0">
      <div
        class="bg-elevated border border-default rounded-xl p-4 flex flex-col"
      >
        <h3 class="font-semibold mb-4">数据列表</h3>
        <div class="flex-1 overflow-auto">
          <div
            v-if="isLoading"
            class="flex items-center justify-center h-full"
          >
            <div class="text-center text-muted">
              <UIcon
                name="i-lucide-loader-2"
                class="w-8 h-8 animate-spin mb-2 mx-auto"
              />
              <p>加载数据中...</p>
            </div>
          </div>

          <div
            v-else-if="!hasSearched"
            class="flex items-center justify-center h-full"
          >
            <div class="text-center text-muted">
              <UIcon
                name="i-lucide-search"
                class="w-12 h-12 mx-auto mb-2 opacity-50"
              />
              <p>点击"查找"按钮查询数据</p>
            </div>
          </div>

          <div
            v-else-if="dataList.length === 0"
            class="flex items-center justify-center h-full"
          >
            <div class="text-center text-muted">
              <UIcon
                name="i-lucide-inbox"
                class="w-12 h-12 mx-auto mb-2 opacity-50"
              />
              <p>暂无数据</p>
            </div>
          </div>

          <table
            v-else
            class="w-full text-sm"
          >
            <thead class="sticky top-0 bg-elevated">
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
                v-for="item in dataList"
                :key="item.id"
                class="border-b border-default/50 hover:bg-muted/5"
              >
                <td class="py-2 px-2">{{ item.index }}</td>
                <td class="py-2 px-2">{{ item.pointName }}</td>
                <td class="py-2 px-2">{{ item.time }}</td>
                <td class="py-2 px-2 text-right">
                  <span
                    :class="
                      item.horizontal > 0 ? 'text-red-500' : 'text-green-500'
                    "
                  >
                    {{ item.horizontal > 0 ? '+' : '' }}{{ item.horizontal }} mm
                  </span>
                </td>
                <td class="py-2 px-2 text-right">
                  <span
                    :class="
                      item.vertical > 0 ? 'text-red-500' : 'text-green-500'
                    "
                  >
                    {{ item.vertical > 0 ? '+' : '' }}{{ item.vertical }} mm
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-if="pagination.total > 0"
          class="mt-4 flex justify-center"
        >
          <UPagination
            v-model:page="pagination.page"
            :page-count="pagination.pageSize"
            :total="pagination.total"
            size="sm"
            @update:page="onPageChange"
          />
        </div>
      </div>

      <div
        class="bg-elevated border border-default rounded-xl p-4 flex flex-col"
      >
        <h3 class="font-semibold mb-4">位移变化曲线</h3>
        <div class="flex-1 min-h-0">
          <VChart
            v-if="monitoringData.length > 0"
            :option="chartOption"
            autoresize
            class="w-full h-full min-h-[250px]"
          />
          <div
            v-else
            class="flex items-center justify-center h-full"
          >
            <div class="text-center text-muted">
              <UIcon
                name="i-lucide-chart-line"
                class="w-12 h-12 mx-auto mb-2 opacity-50"
              />
              <p>暂无数据可展示</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
