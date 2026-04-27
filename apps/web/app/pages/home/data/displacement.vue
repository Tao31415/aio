<script setup lang="ts">
  // 子页面

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
  const dateRange = ref({
    start: sub(new Date(), { days: 7 }),
    end: new Date(),
  })

  const selectedPoint = ref('')
  const pointOptions = ref<Array<{ label: string; value: string }>>([
    { label: '全部点位', value: '' },
  ])

  const searchQuery = ref('')

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

  // ==================== API ====================
  async function fetchMonitoringData() {
    if (!selectedDeviceStore.selectedDevice?.code) {
      dataList.value = []
      pagination.value.total = 0
      return
    }

    isLoading.value = true
    try {
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

      // 生成点位选项
      const ringNumbers = [
        ...new Set(
          monitoringData.value.map((d) => d.ringNumber).filter(Boolean)
        ),
      ]
      pointOptions.value = [
        { label: '全部点位', value: '' },
        ...ringNumbers.map((ring) => ({
          label: ring,
          value: ring,
        })),
      ]

      // 更新数据列表
      updateDataList()
    } catch (e) {
      console.error('Failed to fetch monitoring data:', e)
    } finally {
      isLoading.value = false
    }
  }

  function updateDataList() {
    const filtered = monitoringData.value.filter((d) => {
      // 按点位筛选
      if (selectedPoint.value && d.ringNumber !== selectedPoint.value) {
        return false
      }
      // 按搜索查询筛选
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        const matchesRing = d.ringNumber?.toLowerCase().includes(query)
        return matchesRing
      }
      return true
    })

    pagination.value.total = filtered.length

    // 分页处理
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    const pageData = filtered.slice(start, end)

    dataList.value = pageData.map((item, idx) => ({
      id: start + idx,
      index: start + idx + 1,
      pointName: item.ringNumber || '-',
      time: new Date(item.timestamp).toLocaleString('zh-CN'),
      horizontal: item.p9x ?? 0,
      vertical: item.p9y ?? 0,
    }))
  }

  // ==================== Watchers ====================
  watch(
    () => selectedDeviceStore.selectedDevice,
    () => {
      fetchMonitoringData()
    },
    { immediate: true }
  )

  watch([selectedPoint, searchQuery, pagination.page], () => {
    updateDataList()
  })

  function onPageChange(page: number) {
    pagination.value.page = page
  }

  // ==================== Chart Option ====================
  const chartOption = computed(() => ({
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
      data: monitoringData.value
        .slice(0, 20)
        .map((d) =>
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
        data: monitoringData.value.slice(0, 20).map((d) => d.p9x ?? 0),
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
        data: monitoringData.value.slice(0, 20).map((d) => d.p9y ?? 0),
        lineStyle: {
          color: '#f97316',
          width: 2,
        },
        itemStyle: {
          color: '#f97316',
        },
      },
    ],
  }))
</script>

<template>
  <div class="h-full flex flex-col p-4 gap-4">
    <!-- 筛选器 -->
    <div
      class="flex items-center gap-4 bg-elevated border border-default rounded-xl p-4"
    >
      <!-- 时间范围选择 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">时间范围：</span>
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

      <!-- 点位选择 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">点位：</span>
        <USelect
          v-model="selectedPoint"
          :options="pointOptions"
          size="sm"
          class="w-32"
        />
      </div>

      <!-- 搜索框 -->
      <div class="flex-1">
        <UInput
          v-model="searchQuery"
          placeholder="搜索点名..."
          icon="i-lucide-search"
          size="sm"
          class="w-64"
        />
      </div>
    </div>

    <!-- 左侧数据列表 + 右侧折线图 -->
    <div class="flex-1 grid grid-cols-2 gap-4 min-h-0">
      <!-- 左侧数据列表 -->
      <div
        class="bg-elevated border border-default rounded-xl p-4 flex flex-col"
      >
        <h3 class="font-semibold mb-4">数据列表</h3>
        <div class="flex-1 overflow-auto">
          <table class="w-full text-sm">
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

      <!-- 右侧折线图 -->
      <div
        class="bg-elevated border border-default rounded-xl p-4 flex flex-col"
      >
        <h3 class="font-semibold mb-4">位移变化曲线</h3>
        <div class="flex-1 min-h-0">
          <VChart
            :option="chartOption"
            autoresize
            class="w-full h-full min-h-[250px]"
          />
        </div>
      </div>
    </div>
  </div>
</template>
