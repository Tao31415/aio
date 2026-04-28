<script setup lang="ts">
  const route = useRoute()
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  interface MeasurementPoint {
    id: string
    deviceId: string
    index: number
    name: string
    coordX: number | null
    coordY: number | null
    coordZ: number | null
    ringNumber: string | null
    size: string | null
    warningThresholdHorizontal: number | null
    warningThresholdVertical: number | null
    alarmThresholdHorizontal: number | null
    alarmThresholdVertical: number | null
    createdAt: string
    updatedAt: string
  }

  interface DevicePhoto {
    id: string
    deviceId: string
    objectName: string
    displayTime: string | null
    createdAt: string
  }

  interface Device {
    id: string
    name: string
    code: string
    project: string | null
    longitude: number | null
    latitude: number | null
    elevation: number | null
    coordX: number | null
    coordY: number | null
    coordZ: number | null
    measurementPoints: MeasurementPoint[]
    devicePhotos: DevicePhoto[]
    createdAt: string
    updatedAt: string
  }

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

  const deviceId = computed(() => route.params.deviceId as string)
  const device = ref<Device | null>(null)
  const isLoadingDevice = ref(false)
  const deviceError = ref<string | null>(null)
  const monitoringData = ref<TunnelMonitoringData[]>([])
  const isLoadingData = ref(false)
  const dataError = ref<string | null>(null)

  async function fetchDevice() {
    if (!deviceId.value) return
    isLoadingDevice.value = true
    deviceError.value = null
    try {
      const data = await $fetch<Device>(
        `${apiBase}/api/v1/device/${deviceId.value}`
      )
      device.value = data
    } catch (e) {
      console.error('获取设备信息失败:', e)
      deviceError.value = '无法获取设备信息，请检查设备是否存在'
      device.value = null
    } finally {
      isLoadingDevice.value = false
    }
  }

  async function fetchMonitoringData() {
    if (!device.value?.code) return
    isLoadingData.value = true
    dataError.value = null
    try {
      const res = await $fetch<{ data: TunnelMonitoringData[] }>(
        `${apiBase}/api/v1/mqtt/tunnel-monitoring`,
        {
          query: {
            sn: device.value.code,
            limit: 100,
          },
        }
      )
      monitoringData.value = res.data || []
      pagination.value.page = 1
    } catch (e) {
      console.error('获取监测数据失败:', e)
      dataError.value = '无法获取监测数据'
      monitoringData.value = []
    } finally {
      isLoadingData.value = false
    }
  }

  type MapLevel = 'china' | 'province' | 'city' | 'district'

  const currentMapLevel = ref<MapLevel>('china')
  const currentMapCode = ref('100000')
  const mapHistory = ref<Array<{ level: MapLevel; code: string }>>([])
  const isMapLoading = ref(false)
  const mapError = ref<string | null>(null)

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

  const chartContainer = ref<HTMLDivElement>()

  async function initChart() {
    if (!chartContainer.value) return

    const echarts = await import('echarts')

    const chinaRes = await fetch(`${GEOJSON_CDN}/100000_full.json`)
    const chinaGeoJSON = await chinaRes.json()
    echarts.registerMap('100000', chinaGeoJSON)

    chartInstance = echarts.init(chartContainer.value)
    chartInstance.on('click', handleClick)
    updateChart()
  }

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
          data: [{ name: '二桥中学', value: [114.27, 30.57, 100] }],
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

  async function switchToMap(level: MapLevel, code: string) {
    if (level === currentMapLevel.value && code === currentMapCode.value) return

    isMapLoading.value = true
    mapError.value = null

    try {
      mapHistory.value.push({
        level: currentMapLevel.value,
        code: currentMapCode.value,
      })

      const echarts = await import('echarts')

      const res = await fetch(`${GEOJSON_CDN}/${code}_full.json`)
      if (!res.ok) throw new Error('加载地图失败')
      const geoJSON = await res.json()

      echarts.registerMap(code, geoJSON)

      currentMapLevel.value = level
      currentMapCode.value = code

      updateChart()
    } catch (error) {
      console.error('切换地图失败:', error)
      mapError.value = '地图加载失败'
      mapHistory.value.pop()
    } finally {
      isMapLoading.value = false
    }
  }

  async function goBack() {
    if (mapHistory.value.length === 0) return
    const prev = mapHistory.value.pop()!
    await switchToMap(prev.level, prev.code)
  }

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
    if (deviceId.value) {
      fetchDevice()
    }
  })

  watch(deviceId, (newId) => {
    if (newId) {
      fetchDevice()
    }
  })

  watch(device, (newDevice) => {
    if (newDevice?.code) {
      fetchMonitoringData()
    }
  })

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.dispose()
    }
  })

  const pagination = ref({
    page: 1,
    pageSize: 10,
  })

  const total = computed(() => monitoringData.value.length)

  const dataList = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return monitoringData.value.slice(start, end).map((item, idx) => ({
      id: start + idx,
      target: item.ringNumber || `环号 ${start + idx + 1}`,
      pointName:
        device.value?.measurementPoints?.find(
          (p) => p.ringNumber === item.ringNumber
        )?.name || '-',
      time: new Date(item.timestamp).toLocaleString('zh-CN'),
      horizontal: Number(item.p9x) || 0,
      vertical: Number(item.p9y) || 0,
    }))
  })

  const photos = computed(() => {
    return device.value?.devicePhotos || []
  })

  const selectedPhoto = ref<(typeof photos.value)[0] | null>(null)
  const isFullscreen = ref(false)
  const currentPhotoIndex = ref(0)

  function openPhotoViewer(photo: (typeof photos.value)[0]) {
    const index = photos.value.findIndex((p) => p.id === photo.id)
    if (index !== -1) {
      currentPhotoIndex.value = index
      selectedPhoto.value = photo
      isFullscreen.value = true
    }
  }

  function closePhotoViewer() {
    isFullscreen.value = false
    selectedPhoto.value = null
  }

  function prevPhoto() {
    if (currentPhotoIndex.value > 0) {
      currentPhotoIndex.value--
      selectedPhoto.value = photos.value[currentPhotoIndex.value]
    }
  }

  function nextPhoto() {
    if (currentPhotoIndex.value < photos.value.length - 1) {
      currentPhotoIndex.value++
      selectedPhoto.value = photos.value[currentPhotoIndex.value]
    }
  }

  function handlePhotoKeydown(e: KeyboardEvent) {
    if (!isFullscreen.value) return
    if (e.key === 'Escape') closePhotoViewer()
    if (e.key === 'ArrowLeft') prevPhoto()
    if (e.key === 'ArrowRight') nextPhoto()
  }

  function onPageChange(page: number) {
    pagination.value.page = page
  }

  onMounted(() => {
    window.addEventListener('keydown', handlePhotoKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handlePhotoKeydown)
  })
</script>

<template>
  <div class="p-4 space-y-4">
    <div
      v-if="!deviceId"
      class="flex items-center justify-center h-96"
    >
      <div class="text-center text-muted">
        <UIcon
          name="i-lucide-hard-drive"
          class="w-16 h-16 mx-auto mb-4 opacity-50"
        />
        <p class="text-xl mb-2">请从设备管理页面选择一个设备</p>
        <UButton
          to="/device"
          color="primary"
        >
          前往设备管理
        </UButton>
      </div>
    </div>

    <div
      v-else-if="isLoadingDevice"
      class="flex items-center justify-center h-96"
    >
      <div class="text-center text-muted">
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin mb-2 mx-auto"
        />
        <p>加载设备信息中...</p>
      </div>
    </div>

    <div
      v-else-if="deviceError"
      class="flex items-center justify-center h-96"
    >
      <div class="text-center text-error">
        <UIcon
          name="i-lucide-alert-circle"
          class="w-12 h-12 mx-auto mb-4 opacity-50"
        />
        <p class="text-xl mb-2">加载失败</p>
        <p class="text-base text-muted mb-4">{{ deviceError }}</p>
        <UButton
          color="error"
          variant="soft"
          @click="fetchDevice"
        >
          重试
        </UButton>
      </div>
    </div>

    <template v-else-if="device">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-elevated border border-default rounded-xl p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">设备基本信息</h3>
            <div class="flex items-center gap-2">
              <UButton
                :to="`/device?highlight=${device.id}`"
                color="neutral"
                variant="soft"
                size="sm"
                icon="i-lucide-link"
              >
                设备管理
              </UButton>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-base">
            <div>
              <span class="text-muted">设备名称：</span>
              <span class="font-medium">{{ device.name }}</span>
            </div>
            <div>
              <span class="text-muted">设备编号：</span>
              <span class="font-medium">{{ device.code }}</span>
            </div>
            <div>
              <span class="text-muted">工程信息：</span>
              <span class="font-medium">{{ device.project || '-' }}</span>
            </div>
            <div>
              <span class="text-muted">经度：</span>
              <span class="font-medium">{{ device.longitude ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted">纬度：</span>
              <span class="font-medium">{{ device.latitude ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted">高程：</span>
              <span class="font-medium">{{ device.elevation ?? '-' }} m</span>
            </div>
            <div>
              <span class="text-muted">X 坐标：</span>
              <span class="font-medium">{{ device.coordX ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted">Y 坐标：</span>
              <span class="font-medium">{{ device.coordY ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted">Z 坐标：</span>
              <span class="font-medium">{{ device.coordZ ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted">测点数量：</span>
              <span class="font-medium">
                {{ device.measurementPoints?.length || 0 }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-elevated border border-default rounded-xl p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">设备位置</h3>
            <div class="flex items-center gap-2">
              <UButton
                v-if="mapHistory.length > 0"
                size="xs"
                variant="ghost"
                icon="i-lucide-arrow-left"
                @click="goBack"
              >
                返回
              </UButton>
              <UIcon
                v-if="isMapLoading"
                name="i-lucide-loader-2"
                class="w-4 h-4 animate-spin text-muted"
              />
            </div>
          </div>

          <p class="text-sm text-muted mb-2">
            <span v-if="currentMapLevel === 'china'">点击省份进入查看</span>
            <span v-else-if="currentMapLevel === 'province'">
              点击城市进入查看
            </span>
            <span v-else-if="currentMapLevel === 'city'">点击区县进入查看</span>
            <span v-else>当前为最详细级别</span>
          </p>

          <div
            class="aspect-video rounded-lg overflow-hidden relative bg-muted/10"
          >
            <div
              v-if="isMapLoading"
              class="absolute inset-0 z-10 flex items-center justify-center bg-muted/80"
            >
              <div class="text-center">
                <UIcon
                  name="i-lucide-loader-2"
                  class="w-8 h-8 animate-spin mb-2 mx-auto text-muted"
                />
                <p class="text-base text-muted">加载地图中...</p>
              </div>
            </div>
            <div
              v-else-if="mapError"
              class="absolute inset-0 z-10 flex items-center justify-center bg-muted/80"
            >
              <div class="text-center text-error">
                <UIcon
                  name="i-lucide-alert-circle"
                  class="w-8 h-8 mb-2 mx-auto"
                />
                <p class="text-base">{{ mapError }}</p>
              </div>
            </div>
            <div
              ref="chartContainer"
              class="w-full h-full"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-elevated border border-default rounded-xl p-4">
          <h3 class="font-semibold mb-4">设备照片 ({{ photos.length }})</h3>
          <div
            v-if="photos.length === 0"
            class="text-center py-8 text-muted"
          >
            <UIcon
              name="i-lucide-image"
              class="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>暂无照片</p>
          </div>
          <div
            v-else
            class="grid grid-cols-2 gap-2"
          >
            <div
              v-for="photo in photos"
              :key="photo.id"
              class="relative aspect-video bg-muted/20 rounded-lg overflow-hidden group cursor-pointer"
              @click="openPhotoViewer(photo)"
            >
              <img
                :src="`${apiBase}/api/v1/upload/download?objectName=${encodeURIComponent(photo.objectName)}`"
                :alt="`照片 ${photo.id}`"
                class="w-full h-full object-cover"
              />
              <div
                v-if="photo.displayTime"
                class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-1 text-center"
              >
                {{ photo.displayTime }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-elevated border border-default rounded-xl p-4">
          <h3 class="font-semibold mb-4">
            监测数据
            <span
              v-if="isLoadingData"
              class="ml-2"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="w-4 h-4 animate-spin text-muted inline"
              />
            </span>
            <span
              v-else
              class="text-muted text-base font-normal ml-2"
            >
              ({{ monitoringData.length }})
            </span>
          </h3>

          <div
            v-if="isLoadingData"
            class="text-center py-8 text-muted"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="w-8 h-8 animate-spin mb-2 mx-auto"
            />
            <p>加载监测数据中...</p>
          </div>

          <div
            v-else-if="dataError"
            class="text-center py-8 text-error"
          >
            <UIcon
              name="i-lucide-alert-circle"
              class="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>{{ dataError }}</p>
            <UButton
              color="error"
              variant="soft"
              size="sm"
              class="mt-2"
              @click="fetchMonitoringData"
            >
              重试
            </UButton>
          </div>

          <div
            v-else-if="dataList.length === 0"
            class="text-center py-8 text-muted"
          >
            <UIcon
              name="i-lucide-database"
              class="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>暂无监测数据</p>
            <p class="text-base mt-1">设备编号: {{ device.code }}</p>
          </div>

          <div
            v-else
            class="overflow-auto"
          >
            <table class="w-full text-base">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 px-2 text-muted font-medium">
                    环号
                  </th>
                  <th class="text-left py-2 px-2 text-muted font-medium">
                    点名
                  </th>
                  <th class="text-left py-2 px-2 text-muted font-medium">
                    监测时间
                  </th>
                  <th class="text-right py-2 px-2 text-muted font-medium">
                    水平位移 (p9x)
                  </th>
                  <th class="text-right py-2 px-2 text-muted font-medium">
                    竖直位移 (p9y)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in dataList"
                  :key="item.id"
                  class="border-b border-default/50 hover:bg-muted/5"
                >
                  <td class="py-2 px-2">{{ item.target }}</td>
                  <td class="py-2 px-2">{{ item.pointName }}</td>
                  <td class="py-2 px-2">{{ item.time }}</td>
                  <td class="py-2 px-2 text-right">
                    <span
                      :class="
                        item.horizontal > 0 ? 'text-red-500' : 'text-green-500'
                      "
                    >
                      {{ item.horizontal > 0 ? '+' : ''
                      }}{{ item.horizontal.toFixed(4) }}
                    </span>
                  </td>
                  <td class="py-2 px-2 text-right">
                    <span
                      :class="
                        item.vertical > 0 ? 'text-red-500' : 'text-green-500'
                      "
                    >
                      {{ item.vertical > 0 ? '+' : ''
                      }}{{ item.vertical.toFixed(4) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-if="dataList.length > 0"
            class="mt-4 flex justify-center"
          >
            <UPagination
              v-model:page="pagination.page"
              :page-count="pagination.pageSize"
              :total="total"
              size="sm"
              @update:page="onPageChange"
            />
          </div>
        </div>
      </div>

      <Teleport to="body">
        <Transition
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isFullscreen && selectedPhoto"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            @click.self="closePhotoViewer"
          >
            <button
              class="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
              @click="closePhotoViewer"
            >
              <UIcon
                name="i-lucide-x"
                class="w-8 h-8"
              />
            </button>

            <button
              v-if="currentPhotoIndex > 0"
              class="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
              @click="prevPhoto"
            >
              <UIcon
                name="i-lucide-chevron-left"
                class="w-10 h-10"
              />
            </button>

            <button
              v-if="currentPhotoIndex < photos.length - 1"
              class="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
              @click="nextPhoto"
            >
              <UIcon
                name="i-lucide-chevron-right"
                class="w-10 h-10"
              />
            </button>

            <div class="max-w-6xl max-h-[90vh] mx-4">
              <img
                :src="`${apiBase}/api/v1/upload/download?objectName=${encodeURIComponent(selectedPhoto.objectName)}`"
                :alt="`照片 ${selectedPhoto.id}`"
                class="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div class="mt-4 text-center text-white">
                <p class="text-xl font-medium">
                  {{
                    selectedPhoto.objectName.split('/').pop() ||
                    selectedPhoto.objectName
                  }}
                </p>
                <p
                  v-if="selectedPhoto.displayTime"
                  class="text-base text-white/60 mt-1"
                >
                  {{ selectedPhoto.displayTime }}
                </p>
                <p class="text-sm text-white/40 mt-2">
                  {{ currentPhotoIndex + 1 }} / {{ photos.length }}
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>
