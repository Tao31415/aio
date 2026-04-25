<script setup lang="ts">
  // 子页面，不需要 layout

  import { sub } from 'date-fns'

  // 预警数据列表
  const warningData = ref([
    {
      id: 1,
      index: 1,
      pointName: '监测点 A1-1',
      time: '2024-03-15 08:00',
      horizontal: 5.2,
      vertical: 3.8,
    },
    {
      id: 2,
      index: 2,
      pointName: '监测点 A1-2',
      time: '2024-03-15 08:00',
      horizontal: 4.1,
      vertical: 2.9,
    },
    {
      id: 3,
      index: 3,
      pointName: '监测点 B1-1',
      time: '2024-03-15 08:00',
      horizontal: 6.3,
      vertical: 4.2,
    },
    {
      id: 4,
      index: 4,
      pointName: '监测点 B2-1',
      time: '2024-03-15 08:00',
      horizontal: 3.5,
      vertical: 5.1,
    },
    {
      id: 5,
      index: 5,
      pointName: '监测点 C1-1',
      time: '2024-03-15 08:00',
      horizontal: 7.2,
      vertical: 6.4,
    },
  ])

  // 饼状图数据
  const pieData = ref([
    { name: '正常', value: 108, color: '#22c55e' },
    { name: '预警', value: 12, color: '#f59e0b' },
    { name: '报警', value: 8, color: '#ef4444' },
  ])

  // 历史预警列表
  const historyData = ref([
    {
      id: 1,
      index: 1,
      pointName: '监测点 A1-1',
      time: '2024-03-15 08:00',
      detail: '水平位移超阈值',
      reason: '连续降雨导致土体含水量增加',
      type: '预警',
    },
    {
      id: 2,
      index: 2,
      pointName: '监测点 A1-2',
      time: '2024-03-14 16:00',
      detail: '竖直位移超阈值',
      reason: '设备周边施工影响',
      type: '报警',
    },
    {
      id: 3,
      index: 3,
      pointName: '监测点 B1-1',
      time: '2024-03-14 08:00',
      detail: '水平位移超阈值',
      reason: '地质条件变化',
      type: '预警',
    },
    {
      id: 4,
      index: 4,
      pointName: '监测点 B2-1',
      time: '2024-03-13 14:00',
      detail: '双重位移超阈值',
      reason: '地震活动影响',
      type: '报警',
    },
    {
      id: 5,
      index: 5,
      pointName: '监测点 C1-1',
      time: '2024-03-12 10:00',
      detail: '水平位移超阈值',
      reason: '长期累积变形',
      type: '预警',
    },
  ])

  // 分页
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 50,
  })

  // 历史预警分页
  const historyPagination = ref({
    page: 1,
    pageSize: 10,
    total: 30,
  })

  // 时间筛选
  const dateRange = ref({
    start: sub(new Date(), { days: 30 }),
    end: new Date(),
  })

  // 计算饼图
  const total = computed(() =>
    pieData.value.reduce((sum, item) => sum + item.value, 0)
  )

  const pieSlices = computed(() => {
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

  function onPageChange(page: number) {
    pagination.value.page = page
  }

  function onHistoryPageChange(page: number) {
    historyPagination.value.page = page
  }
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
