<script setup lang="ts">
  // 子页面

  // 设备基本信息 - 二桥中学坐标
  const deviceInfo = ref({
    name: '监测点 A1',
    code: 'A1-2024-001',
    project: '山区滑坡监测项目',
    longitude: 114.27,
    latitude: 30.57,
    elevation: 123.5,
    x: 100.5,
    y: 200.3,
    z: 50.2,
  })

  // ==================== 地图功能 ====================

  type MapLevel = 'china' | 'province' | 'city' | 'district'

  const currentMapLevel = ref<MapLevel>('china')
  const currentMapCode = ref('100000')
  const mapHistory = ref<Array<{ level: MapLevel; code: string }>>([])
  const isMapLoading = ref(false)
  const mapError = ref<string | null>(null)

  // 地图实例
  let chartInstance: any = null

  const GEOJSON_CDN = 'https://geo.datav.aliyun.com/areas_v3/bound'

  const centerMap: Record<string, [number, number]> = {
    '420000': [114.32, 30.58],
    '420100': [114.31, 30.52],
    '420105': [114.27, 30.57],
  }

  const zoomMap: Record<MapLevel, number> = {
    china: 5,
    province: 7,
    city: 9,
    district: 11,
  }

  // 图表容器 ref
  const chartContainer = ref<HTMLDivElement>()

  // 创建图表
  async function initChart() {
    if (!chartContainer.value) return

    // 动态导入 echarts 完整包
    const echarts = await import('echarts')

    // 加载中国地图
    const chinaRes = await fetch(`${GEOJSON_CDN}/100000_full.json`)
    const chinaGeoJSON = await chinaRes.json()
    // 使用 code 作为 map 名称
    echarts.registerMap('100000', chinaGeoJSON)

    chartInstance = echarts.init(chartContainer.value)

    // 绑定点击事件
    chartInstance.on('click', handleClick)

    updateChart()
  }

  // 更新图表
  function updateChart() {
    if (!chartInstance) return

    const center = centerMap[currentMapCode.value] || [114.27, 30.57]
    const zoom = zoomMap[currentMapLevel.value] || 5

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.value) {
            return `${params.name}<br/>经度: ${params.value[0]?.toFixed(4)}<br/>纬度: ${params.value[1]?.toFixed(4)}`
          }
          return params.name
        },
      },
      geo: {
        map: currentMapCode.value,
        roam: true,
        center: center,
        zoom: zoom,
        itemStyle: {
          borderColor: '#ccc',
          borderWidth: 1,
          areaColor: '#f5f5f5',
        },
        emphasis: {
          itemStyle: {
            areaColor: '#e0e0e0',
          },
        },
      },
      series: [
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          symbolSize: 12,
          data: [
            { name: '二桥中学', value: [114.27, 30.57, 100] },
          ],
          label: {
            show: true,
            formatter: '{b}',
            position: 'right',
            fontSize: 11,
          },
          itemStyle: {
            color: '#ef4444',
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(239, 68, 68, 0.5)',
          },
          emphasis: {
            scale: 1.5,
          },
        },
      ],
    }

    chartInstance.setOption(option, { notMerge: true })
  }

  // 切换地图
  async function switchToMap(level: MapLevel, code: string) {
    if (level === currentMapLevel.value && code === currentMapCode.value) return

    isMapLoading.value = true
    mapError.value = null

    try {
      // 保存历史
      mapHistory.value.push({
        level: currentMapLevel.value,
        code: currentMapCode.value,
      })

      // 加载新地图
      const echarts = await import('echarts')

      const res = await fetch(`${GEOJSON_CDN}/${code}_full.json`)
      if (!res.ok) throw new Error('加载地图失败')
      const geoJSON = await res.json()

      // 使用 code 作为 map 名称，保持一致
      echarts.registerMap(code, geoJSON)

      // 更新状态
      currentMapLevel.value = level
      currentMapCode.value = code

      // 更新图表
      updateChart()
    } catch (error) {
      console.error('切换地图失败:', error)
      mapError.value = '地图加载失败'
      mapHistory.value.pop()
    } finally {
      isMapLoading.value = false
    }
  }

  // 返回
  async function goBack() {
    if (mapHistory.value.length === 0) return
    const prev = mapHistory.value.pop()!
    await switchToMap(prev.level, prev.code)
  }

  // 点击地图区域
  function handleClick(params: any) {
    if (!params.properties?.adcode) return

    const adcode = params.properties.adcode.toString()
    const level = currentMapLevel.value

    if (level === 'china') {
      switchToMap('province', adcode)
    } else if (level === 'province') {
      switchToMap('city', adcode)
    } else if (level === 'city') {
      switchToMap('district', adcode)
    }
  }

  onMounted(() => {
    initChart()
  })

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.dispose()
    }
  })

  // 分页数据列表
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 50,
  })

  const dataList = ref([
    { id: 1, target: '靶标 T1', pointName: '监测点 A1-1', time: '2024-03-15 08:00', horizontal: 2.5, vertical: 1.3 },
    { id: 2, target: '靶标 T2', pointName: '监测点 A1-2', time: '2024-03-15 08:00', horizontal: -1.2, vertical: 3.1 },
    { id: 3, target: '靶标 T3', pointName: '监测点 A1-3', time: '2024-03-15 08:00', horizontal: 0.8, vertical: -2.4 },
    { id: 4, target: '靶标 T4', pointName: '监测点 A1-4', time: '2024-03-15 08:00', horizontal: 1.5, vertical: 0.9 },
    { id: 5, target: '靶标 T5', pointName: '监测点 A1-5', time: '2024-03-15 08:00', horizontal: -0.3, vertical: 1.8 },
  ])

  const photos = ref([
    { id: 1, url: 'https://picsum.photos/400/300?random=1', time: '2024-03-15 08:00' },
    { id: 2, url: 'https://picsum.photos/400/300?random=2', time: '2024-03-14 08:00' },
    { id: 3, url: 'https://picsum.photos/400/300?random=3', time: '2024-03-13 08:00' },
    { id: 4, url: 'https://picsum.photos/400/300?random=4', time: '2024-03-12 08:00' },
  ])

  function onPageChange(page: number) {
    pagination.value.page = page
  }
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- 第一行：设备基本信息 + 地图 -->
    <div class="grid grid-cols-2 gap-4">
      <!-- 设备基本信息 -->
      <div class="bg-elevated border border-default rounded-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">设备基本信息</h3>
          <div class="flex items-center gap-2">
            <UButton color="primary" variant="soft" size="sm" icon="i-lucide-edit">编辑</UButton>
            <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-link">测点列表</UButton>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div><span class="text-muted">设备名称：</span><span class="font-medium">{{ deviceInfo.name }}</span></div>
          <div><span class="text-muted">设备编号：</span><span class="font-medium">{{ deviceInfo.code }}</span></div>
          <div><span class="text-muted">工程信息：</span><span class="font-medium">{{ deviceInfo.project }}</span></div>
          <div><span class="text-muted">经度：</span><span class="font-medium">{{ deviceInfo.longitude }}</span></div>
          <div><span class="text-muted">纬度：</span><span class="font-medium">{{ deviceInfo.latitude }}</span></div>
          <div><span class="text-muted">高程：</span><span class="font-medium">{{ deviceInfo.elevation }} m</span></div>
          <div><span class="text-muted">X 值：</span><span class="font-medium">{{ deviceInfo.x }} mm</span></div>
          <div><span class="text-muted">Y 值：</span><span class="font-medium">{{ deviceInfo.y }} mm</span></div>
          <div><span class="text-muted">Z 值：</span><span class="font-medium">{{ deviceInfo.z }} mm</span></div>
        </div>
      </div>

      <!-- 地图 -->
      <div class="bg-elevated border border-default rounded-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">设备位置</h3>
          <div class="flex items-center gap-2">
            <UButton v-if="mapHistory.length > 0" size="xs" variant="ghost" icon="i-lucide-arrow-left" @click="goBack">返回</UButton>
            <UIcon v-if="isMapLoading" name="i-lucide-loader-2" class="w-4 h-4 animate-spin text-muted" />
          </div>
        </div>

        <p class="text-xs text-muted mb-2">
          <span v-if="currentMapLevel === 'china'">点击省份进入查看</span>
          <span v-else-if="currentMapLevel === 'province'">点击城市进入查看</span>
          <span v-else-if="currentMapLevel === 'city'">点击区县进入查看</span>
          <span v-else>当前为最详细级别</span>
        </p>

        <!-- 图表容器 -->
        <div class="aspect-video rounded-lg overflow-hidden relative bg-muted/10">
          <div v-if="isMapLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-muted/80">
            <div class="text-center">
              <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mb-2 mx-auto text-muted" />
              <p class="text-sm text-muted">加载地图中...</p>
            </div>
          </div>
          <div v-else-if="mapError" class="absolute inset-0 z-10 flex items-center justify-center bg-muted/80">
            <div class="text-center text-error">
              <UIcon name="i-lucide-alert-circle" class="w-8 h-8 mb-2 mx-auto" />
              <p class="text-sm">{{ mapError }}</p>
            </div>
          </div>
          <div ref="chartContainer" class="w-full h-full" />
        </div>
      </div>
    </div>

    <!-- 第二行：照片 + 数据列表 -->
    <div class="grid grid-cols-2 gap-4">
      <!-- 照片 -->
      <div class="bg-elevated border border-default rounded-xl p-4">
        <h3 class="font-semibold mb-4">设备照片</h3>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="photo in photos" :key="photo.id" class="aspect-video bg-muted/20 rounded-lg overflow-hidden">
            <img :src="photo.url" :alt="`设备照片 ${photo.id}`" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- 数据列表 -->
      <div class="bg-elevated border border-default rounded-xl p-4">
        <h3 class="font-semibold mb-4">监测数据</h3>
        <div class="overflow-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-default">
                <th class="text-left py-2 px-2 text-muted font-medium">靶标</th>
                <th class="text-left py-2 px-2 text-muted font-medium">点名</th>
                <th class="text-left py-2 px-2 text-muted font-medium">监测时间</th>
                <th class="text-right py-2 px-2 text-muted font-medium">水平位移</th>
                <th class="text-right py-2 px-2 text-muted font-medium">竖直位移</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in dataList" :key="item.id" class="border-b border-default/50 hover:bg-muted/5">
                <td class="py-2 px-2">{{ item.target }}</td>
                <td class="py-2 px-2">{{ item.pointName }}</td>
                <td class="py-2 px-2">{{ item.time }}</td>
                <td class="py-2 px-2 text-right">
                  <span :class="item.horizontal > 0 ? 'text-red-500' : 'text-green-500'">
                    {{ item.horizontal > 0 ? '+' : '' }}{{ item.horizontal }} mm
                  </span>
                </td>
                <td class="py-2 px-2 text-right">
                  <span :class="item.vertical > 0 ? 'text-red-500' : 'text-green-500'">
                    {{ item.vertical > 0 ? '+' : '' }}{{ item.vertical }} mm
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex justify-center">
          <UPagination v-model:page="pagination.page" :page-count="pagination.pageSize" :total="pagination.total" size="sm" @update:page="onPageChange" />
        </div>
      </div>
    </div>
  </div>
</template>
