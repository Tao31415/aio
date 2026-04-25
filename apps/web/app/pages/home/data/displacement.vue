<script setup lang="ts">
  // 子页面

  import { sub } from 'date-fns'

  // 时间范围选择
  const dateRange = ref({
    start: sub(new Date(), { days: 7 }),
    end: new Date(),
  })

  // 点位选择
  const selectedPoint = ref('')
  const pointOptions = [
    { label: '全部点位', value: '' },
    { label: '监测点 A1', value: 'a1' },
    { label: '监测点 A2', value: 'a2' },
    { label: '监测点 B1', value: 'b1' },
  ]

  // 搜索
  const searchQuery = ref('')

  // 分页
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 50,
  })

  // 数据列表
  const dataList = ref([
    {
      id: 1,
      index: 1,
      pointName: '监测点 A1-1',
      time: '2024-03-15 08:00',
      horizontal: 2.5,
      vertical: 1.3,
    },
    {
      id: 2,
      index: 2,
      pointName: '监测点 A1-2',
      time: '2024-03-15 08:00',
      horizontal: -1.2,
      vertical: 3.1,
    },
    {
      id: 3,
      index: 3,
      pointName: '监测点 A1-3',
      time: '2024-03-15 08:00',
      horizontal: 0.8,
      vertical: -2.4,
    },
    {
      id: 4,
      index: 4,
      pointName: '监测点 A1-4',
      time: '2024-03-15 08:00',
      horizontal: 1.5,
      vertical: 0.9,
    },
    {
      id: 5,
      index: 5,
      pointName: '监测点 A1-5',
      time: '2024-03-15 08:00',
      horizontal: -0.3,
      vertical: 1.8,
    },
  ])

  // 折线图配置
  const chartOption = ref({
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
      data: ['08:00', '10:00', '12:00', '14:00', '16:00'],
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
        data: [2.5, 2.8, 3.1, 2.9, 3.2],
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
        data: [1.3, 1.5, 1.8, 1.6, 1.9],
        lineStyle: {
          color: '#f97316',
          width: 2,
        },
        itemStyle: {
          color: '#f97316',
        },
      },
    ],
  })

  function onPageChange(page: number) {
    pagination.value.page = page
  }
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
