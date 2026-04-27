<script setup lang="ts">
  import { APP_ROUTE_MAP } from '~/utils/route-config'

  definePageMeta({
    title: APP_ROUTE_MAP['/device']!.title,
    icon: APP_ROUTE_MAP['/device']!.icon,
    layout: 'dashboard',
    auth: 'user',
  })

  const toast = useToast()
  const config = useRuntimeConfig()

  // ==================== Types ====================
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
    pointThumbnails?: PointThumbnail[]
  }

  interface DevicePhoto {
    id: string
    deviceId: string
    objectName: string
    displayTime: string | null
    createdAt: string
  }

  interface PointThumbnail {
    id: string
    measurementPointId: string
    devicePhotoId: string | null
    objectName: string
    cropX: number
    cropY: number
    cropSize: number
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

  // ==================== State ====================
  const devices = ref<Device[]>([])
  const isLoading = ref(false)
  const searchQuery = ref('')
  const selectedDevice = ref<Device | null>(null)
  const showDeviceModal = ref(false)
  const showPointModal = ref(false)
  const showPhotoModal = ref(false)
  const editingDevice = ref<Device | null>(null)
  const editingPoint = ref<MeasurementPoint | null>(null)
  const selectedPoint = ref<MeasurementPoint | null>(null)
  const activeTab = ref('info')

  // ==================== Forms ====================
  const deviceForm = reactive({
    name: '',
    code: '',
    project: '',
    longitude: undefined as number | undefined,
    latitude: undefined as number | undefined,
    elevation: undefined as number | undefined,
    coordX: undefined as number | undefined,
    coordY: undefined as number | undefined,
    coordZ: undefined as number | undefined,
  })

  const pointForm = reactive({
    index: 0,
    name: '',
    coordX: undefined as number | undefined,
    coordY: undefined as number | undefined,
    coordZ: undefined as number | undefined,
    ringNumber: '',
    size: '',
    warningThresholdHorizontal: undefined as number | undefined,
    warningThresholdVertical: undefined as number | undefined,
    alarmThresholdHorizontal: undefined as number | undefined,
    alarmThresholdVertical: undefined as number | undefined,
  })

  const photoTimeValue = ref('') // HH:mm format

  const selectedFile = ref<File | null>(null)
  const previewUrl = ref<string | null>(null)
  const previewHeight = ref(200)
  const isUploading = ref(false)
  const photoUrls = ref<Record<string, string>>({})
  const loadingPhotoId = ref<string | null>(null)

  // ==================== API ====================
  const apiBase = config.public.apiBase as string

  async function fetchDevices() {
    isLoading.value = true
    try {
      const data = await $fetch<Device[]>(`${apiBase}/api/v1/device`)
      devices.value = data || []
    } catch (e) {
      toast.add({
        title: '加载设备列表失败',
        description: String(e),
        color: 'error',
      })
    } finally {
      isLoading.value = false
    }
  }

  async function createDevice() {
    try {
      const data = await $fetch<Device>(`${apiBase}/api/v1/device`, {
        method: 'POST',
        body: {
          name: deviceForm.name,
          code: deviceForm.code,
          project: deviceForm.project || undefined,
          longitude: deviceForm.longitude,
          latitude: deviceForm.latitude,
          elevation: deviceForm.elevation,
          coordX: deviceForm.coordX,
          coordY: deviceForm.coordY,
          coordZ: deviceForm.coordZ,
        },
      })
      toast.add({ title: '设备创建成功', color: 'success' })
      closeDeviceModal()
      await fetchDevices()
    } catch (e) {
      toast.add({ title: '创建设失败', description: String(e), color: 'error' })
    }
  }

  async function updateDevice() {
    if (!editingDevice.value) return
    try {
      const data = await $fetch<Device>(
        `${apiBase}/api/v1/device/${editingDevice.value.id}`,
        {
          method: 'PUT',
          body: {
            name: deviceForm.name,
            code: deviceForm.code,
            project: deviceForm.project || undefined,
            longitude: deviceForm.longitude,
            latitude: deviceForm.latitude,
            elevation: deviceForm.elevation,
            coordX: deviceForm.coordX,
            coordY: deviceForm.coordY,
            coordZ: deviceForm.coordZ,
          },
        }
      )
      toast.add({ title: '设备更新成功', color: 'success' })
      closeDeviceModal()
      await fetchDevices()
      if (selectedDevice.value?.id === editingDevice.value.id) {
        selectedDevice.value = data
      }
    } catch (e) {
      toast.add({ title: '更新失败', description: String(e), color: 'error' })
    }
  }

  async function deleteDevice(device: Device) {
    if (!confirm(`确定要删除设备 "${device.name}" 吗？`)) return
    try {
      await $fetch(`${apiBase}/api/v1/device/${device.id}`, {
        method: 'DELETE',
      })
      toast.add({ title: '设备已删除', color: 'success' })
      if (selectedDevice.value?.id === device.id) {
        selectedDevice.value = null
      }
      await fetchDevices()
    } catch (e) {
      toast.add({ title: '删除失败', description: String(e), color: 'error' })
    }
  }

  async function createMeasurementPoint() {
    if (!selectedDevice.value) return
    try {
      const data = await $fetch<MeasurementPoint>(
        `${apiBase}/api/v1/device/point`,
        {
          method: 'POST',
          body: {
            deviceId: selectedDevice.value.id,
            index: pointForm.index,
            name: pointForm.name,
            coordX: pointForm.coordX,
            coordY: pointForm.coordY,
            coordZ: pointForm.coordZ,
            ringNumber: pointForm.ringNumber || undefined,
            size: pointForm.size || undefined,
            warningThresholdHorizontal: pointForm.warningThresholdHorizontal,
            warningThresholdVertical: pointForm.warningThresholdVertical,
            alarmThresholdHorizontal: pointForm.alarmThresholdHorizontal,
            alarmThresholdVertical: pointForm.alarmThresholdVertical,
          },
        }
      )
      toast.add({ title: '测点创建成功', color: 'success' })
      closePointModal()
      await refreshSelectedDevice()
    } catch (e) {
      toast.add({ title: '创建失败', description: String(e), color: 'error' })
    }
  }

  async function updateMeasurementPoint() {
    if (!editingPoint.value) return
    try {
      const data = await $fetch<MeasurementPoint>(
        `${apiBase}/api/v1/device/point/${editingPoint.value.id}`,
        {
          method: 'PUT',
          body: {
            index: pointForm.index,
            name: pointForm.name,
            coordX: pointForm.coordX,
            coordY: pointForm.coordY,
            coordZ: pointForm.coordZ,
            ringNumber: pointForm.ringNumber || undefined,
            size: pointForm.size || undefined,
            warningThresholdHorizontal: pointForm.warningThresholdHorizontal,
            warningThresholdVertical: pointForm.warningThresholdVertical,
            alarmThresholdHorizontal: pointForm.alarmThresholdHorizontal,
            alarmThresholdVertical: pointForm.alarmThresholdVertical,
          },
        }
      )
      toast.add({ title: '测点更新成功', color: 'success' })
      closePointModal()
      await refreshSelectedDevice()
    } catch (e) {
      toast.add({ title: '更新失败', description: String(e), color: 'error' })
    }
  }

  async function deleteMeasurementPoint(point: MeasurementPoint) {
    if (!confirm(`确定要删除测点 "${point.name}" 吗？`)) return
    try {
      await $fetch(`${apiBase}/api/v1/device/point/${point.id}`, {
        method: 'DELETE',
      })
      toast.add({ title: '测点已删除', color: 'success' })
      await refreshSelectedDevice()
    } catch (e) {
      toast.add({ title: '删除失败', description: String(e), color: 'error' })
    }
  }

  async function createDevicePhoto() {
    if (!selectedDevice.value || !selectedFile.value) {
      toast.add({
        title: '请选择图片',
        color: 'warning',
      })
      return
    }

    isUploading.value = true
    try {
      // 1. 获取预签名上传 URL
      const { objectName, presignedUrl } = await $fetch<{
        objectName: string
        presignedUrl: string
      }>(`${apiBase}/api/v1/upload/presign-upload`, {
        method: 'POST',
        body: {
          filename: selectedFile.value.name,
          contentType: selectedFile.value.type,
        },
      })

      // 2. 直接上传到 MinIO
      await fetch(presignedUrl, {
        method: 'PUT',
        body: selectedFile.value,
        headers: {
          'Content-Type': selectedFile.value.type,
        },
      })

      // 3. 创建照片记录
      const displayTimeStr = photoTimeValue.value || undefined
      await $fetch<DevicePhoto>(`${apiBase}/api/v1/device/photo`, {
        method: 'POST',
        body: {
          deviceId: selectedDevice.value.id,
          objectName,
          displayTime: displayTimeStr,
        },
      })

      toast.add({ title: '照片上传成功', color: 'success' })
      closePhotoModal()
      await refreshSelectedDevice()
    } catch (e) {
      toast.add({ title: '上传失败', description: String(e), color: 'error' })
    } finally {
      isUploading.value = false
    }
  }

  async function deleteDevicePhoto(photo: DevicePhoto) {
    if (!confirm('确定要删除这张照片吗？')) return
    try {
      await $fetch(`${apiBase}/api/v1/device/photo/${photo.id}`, {
        method: 'DELETE',
      })
      toast.add({ title: '照片已删除', color: 'success' })
      // Clean up cached URL
      if (photoUrls.value[photo.id]) {
        URL.revokeObjectURL(photoUrls.value[photo.id])
        delete photoUrls.value[photo.id]
      }
      await refreshSelectedDevice()
    } catch (e) {
      toast.add({ title: '删除失败', description: String(e), color: 'error' })
    }
  }

  async function fetchPhotoUrl(photo: DevicePhoto): Promise<string> {
    if (photoUrls.value[photo.id]) {
      return photoUrls.value[photo.id]
    }
    loadingPhotoId.value = photo.id
    try {
      const { presignedUrl } = await $fetch<{ presignedUrl: string }>(
        `${apiBase}/api/v1/upload/presign-download`,
        {
          method: 'POST',
          body: { objectName: photo.objectName },
        }
      )
      photoUrls.value[photo.id] = presignedUrl
      return presignedUrl
    } finally {
      loadingPhotoId.value = null
    }
  }

  async function refreshSelectedDevice() {
    if (!selectedDevice.value) return
    // Clean up URLs for photos that will be removed
    const currentPhotoIds = new Set(
      selectedDevice.value.devicePhotos?.map((p) => p.id) || []
    )
    for (const photoId of Object.keys(photoUrls.value)) {
      if (!currentPhotoIds.has(photoId)) {
        URL.revokeObjectURL(photoUrls.value[photoId])
        delete photoUrls.value[photoId]
      }
    }
    const data = await $fetch<Device>(
      `${apiBase}/api/v1/device/${selectedDevice.value.id}`
    )
    if (data) {
      selectedDevice.value = data
      const idx = devices.value.findIndex((d) => d.id === data.id)
      if (idx !== -1) {
        devices.value[idx] = data
      }
    }
  }

  // ==================== Modal Handlers ====================
  function openAddDeviceModal() {
    editingDevice.value = null
    Object.assign(deviceForm, {
      name: '',
      code: '',
      project: '',
      longitude: undefined,
      latitude: undefined,
      elevation: undefined,
      coordX: undefined,
      coordY: undefined,
      coordZ: undefined,
    })
    showDeviceModal.value = true
  }

  function openEditDeviceModal(device: Device) {
    editingDevice.value = device
    Object.assign(deviceForm, {
      name: device.name,
      code: device.code,
      project: device.project || '',
      longitude: device.longitude ?? undefined,
      latitude: device.latitude ?? undefined,
      elevation: device.elevation ?? undefined,
      coordX: device.coordX ?? undefined,
      coordY: device.coordY ?? undefined,
      coordZ: device.coordZ ?? undefined,
    })
    showDeviceModal.value = true
  }

  function closeDeviceModal() {
    showDeviceModal.value = false
    editingDevice.value = null
  }

  function openAddPointModal() {
    editingPoint.value = null
    const maxIndex = selectedDevice.value?.measurementPoints?.length
      ? Math.max(...selectedDevice.value.measurementPoints.map((p) => p.index))
      : 0
    Object.assign(pointForm, {
      index: maxIndex + 1,
      name: '',
      coordX: undefined,
      coordY: undefined,
      coordZ: undefined,
      ringNumber: '',
      size: '',
      warningThresholdHorizontal: undefined,
      warningThresholdVertical: undefined,
      alarmThresholdHorizontal: undefined,
      alarmThresholdVertical: undefined,
    })
    showPointModal.value = true
  }

  function openEditPointModal(point: MeasurementPoint) {
    editingPoint.value = point
    Object.assign(pointForm, {
      index: point.index,
      name: point.name,
      coordX: point.coordX ?? undefined,
      coordY: point.coordY ?? undefined,
      coordZ: point.coordZ ?? undefined,
      ringNumber: point.ringNumber || '',
      size: point.size || '',
      warningThresholdHorizontal: point.warningThresholdHorizontal ?? undefined,
      warningThresholdVertical: point.warningThresholdVertical ?? undefined,
      alarmThresholdHorizontal: point.alarmThresholdHorizontal ?? undefined,
      alarmThresholdVertical: point.alarmThresholdVertical ?? undefined,
    })
    showPointModal.value = true
  }

  function closePointModal() {
    showPointModal.value = false
    editingPoint.value = null
  }

  function openPhotoModal() {
    photoTimeValue.value = ''
    selectedFile.value = null
    previewUrl.value = null
    previewHeight.value = 200
    showPhotoModal.value = true
  }

  function closePhotoModal() {
    showPhotoModal.value = false
    selectedFile.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
  }

  function onFileSelect(file: File | null) {
    if (file) {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
      selectedFile.value = file
      previewUrl.value = URL.createObjectURL(file)
    }
  }

  function handleDeviceSubmit() {
    if (editingDevice.value) {
      updateDevice()
    } else {
      createDevice()
    }
  }

  function handlePointSubmit() {
    if (editingPoint.value) {
      updateMeasurementPoint()
    } else {
      createMeasurementPoint()
    }
  }

  // ==================== Computed ====================
  const timeOptions = computed(() => {
    const options = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const hour = String(h).padStart(2, '0')
        const minute = String(m).padStart(2, '0')
        options.push({
          label: `${hour}:${minute}`,
          value: `${hour}:${minute}`,
        })
      }
    }
    return options
  })

  const filteredDevices = computed(() => {
    if (!searchQuery.value) return devices.value
    const q = searchQuery.value.toLowerCase()
    return devices.value.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.project && d.project.toLowerCase().includes(q))
    )
  })

  // ==================== Lifecycle ====================
  onMounted(() => {
    fetchDevices()
  })
</script>

<template>
  <div class="flex h-full gap-6">
    <!-- 左侧设备列表 -->
    <div class="w-80 shrink-0 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold">设备管理</h1>
        <UButton
          icon="i-lucide-plus"
          size="sm"
          @click="openAddDeviceModal"
        />
      </div>

      <!-- 搜索 -->
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="搜索设备..."
      />

      <!-- 设备列表 -->
      <div class="space-y-2">
        <UCard
          v-for="device in filteredDevices"
          :key="device.id"
          :class="[
            'cursor-pointer transition-all hover:border-primary',
            selectedDevice?.id === device.id &&
              'border-primary ring-1 ring-primary',
          ]"
          @click="selectedDevice = device"
        >
          <div class="flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <p class="font-medium truncate">{{ device.name }}</p>
              <p class="text-sm text-muted truncate">{{ device.code }}</p>
              <p
                v-if="device.project"
                class="text-xs text-muted truncate"
              >
                {{ device.project }}
              </p>
            </div>
            <div class="flex gap-1 ml-2">
              <UButton
                icon="i-lucide-pencil"
                variant="ghost"
                size="xs"
                @click.stop="openEditDeviceModal(device)"
              />
              <UButton
                icon="i-lucide-trash"
                variant="ghost"
                size="xs"
                color="error"
                @click.stop="deleteDevice(device)"
              />
            </div>
          </div>
          <div class="flex gap-2 mt-2 text-xs text-muted">
            <span v-if="device.measurementPoints?.length">
              {{ device.measurementPoints.length }} 测点
            </span>
            <span v-if="device.devicePhotos?.length">
              {{ device.devicePhotos.length }} 照片
            </span>
          </div>
        </UCard>

        <div
          v-if="filteredDevices.length === 0"
          class="text-center py-8 text-muted"
        >
          <UIcon
            name="i-lucide-hard-drive"
            class="w-12 h-12 mx-auto mb-2 opacity-50"
          />
          <p>暂无设备</p>
        </div>
      </div>
    </div>

    <!-- 右侧设备详情 -->
    <div class="flex-1 min-w-0">
      <UCard
        v-if="selectedDevice"
        class="h-full"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div>
                <h2 class="text-lg font-bold">{{ selectedDevice.name }}</h2>
                <p class="text-sm text-muted">{{ selectedDevice.code }}</p>
              </div>
              <UButton
                :to="`/home/device?deviceId=${selectedDevice.id}`"
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-chart-line"
              >
                查看监测数据
              </UButton>
            </div>
            <UTabs
              v-model="activeTab"
              :items="[
                { label: '基本信息', value: 'info' },
                { label: '测点', value: 'points' },
                { label: '照片', value: 'photos' },
              ]"
            />
          </div>
        </template>

        <!-- 基本信息 -->
        <div
          v-if="activeTab === 'info'"
          class="space-y-4"
        >
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-sm text-muted">工程</p>
              <p>{{ selectedDevice.project || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted">经度</p>
              <p>{{ selectedDevice.longitude ?? '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted">纬度</p>
              <p>{{ selectedDevice.latitude ?? '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted">高程</p>
              <p>{{ selectedDevice.elevation ?? '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted">X 坐标</p>
              <p>{{ selectedDevice.coordX ?? '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted">Y 坐标</p>
              <p>{{ selectedDevice.coordY ?? '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted">Z 坐标</p>
              <p>{{ selectedDevice.coordZ ?? '-' }}</p>
            </div>
          </div>
        </div>

        <!-- 测点列表 -->
        <div
          v-else-if="activeTab === 'points'"
          class="space-y-4"
        >
          <div class="flex justify-between">
            <p class="font-medium">
              测点列表 ({{ selectedDevice.measurementPoints?.length || 0 }})
            </p>
            <UButton
              size="sm"
              icon="i-lucide-plus"
              @click="openAddPointModal"
            />
          </div>

          <UTable
            v-if="selectedDevice.measurementPoints?.length"
            :data="selectedDevice.measurementPoints"
            :columns="[
              { accessorKey: 'index', header: '序号' },
              { accessorKey: 'name', header: '名称' },
              { accessorKey: 'ringNumber', header: '环号' },
              { accessorKey: 'size', header: '尺寸' },
              { accessorKey: 'coordX', header: 'X' },
              { accessorKey: 'coordY', header: 'Y' },
              { accessorKey: 'coordZ', header: 'Z' },
              {
                id: 'actions',
                header: '',
                cell: ({ row }) =>
                  h('div', { class: 'flex gap-1 justify-end' }, [
                    h(UButton, {
                      icon: 'i-lucide-pencil',
                      variant: 'ghost',
                      size: 'xs',
                      onClick: () => openEditPointModal(row),
                    }),
                    h(UButton, {
                      icon: 'i-lucide-trash',
                      variant: 'ghost',
                      size: 'xs',
                      color: 'error',
                      onClick: () => deleteMeasurementPoint(row),
                    }),
                  ]),
              },
            ]"
            class="w-full"
          />

          <div
            v-else
            class="text-center py-8 text-muted"
          >
            <UIcon
              name="i-lucide-crosshair"
              class="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>暂无测点</p>
          </div>
        </div>

        <!-- 照片列表 -->
        <div
          v-else-if="activeTab === 'photos'"
          class="space-y-4"
        >
          <div class="flex justify-between">
            <p class="font-medium">
              设备照片 ({{ selectedDevice.devicePhotos?.length || 0 }})
            </p>
            <UButton
              size="sm"
              icon="i-lucide-plus"
              @click="openPhotoModal"
            />
          </div>

          <div
            v-if="selectedDevice.devicePhotos?.length"
            class="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div
              v-for="photo in selectedDevice.devicePhotos"
              :key="photo.id"
              class="relative group aspect-square bg-accented rounded-lg overflow-hidden"
            >
              <template v-if="photoUrls[photo.id]">
                <img
                  :src="photoUrls[photo.id]"
                  :alt="photo.displayTime || '设备照片'"
                  class="w-full h-full object-cover"
                />
              </template>
              <template v-else>
                <div
                  class="absolute inset-0 flex items-center justify-center text-muted"
                >
                  <UIcon
                    name="i-lucide-image"
                    class="w-12 h-12"
                  />
                </div>
                <div
                  class="absolute inset-0 flex items-center justify-center"
                  @click="fetchPhotoUrl(photo)"
                >
                  <UButton
                    icon="i-lucide-refresh-cw"
                    size="xs"
                    variant="soft"
                    :loading="loadingPhotoId === photo.id"
                    @click.stop="fetchPhotoUrl(photo)"
                  >
                    加载
                  </UButton>
                </div>
              </template>
              <div
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
              >
                <UButton
                  icon="i-lucide-trash"
                  color="error"
                  variant="solid"
                  size="xs"
                  @click.stop="deleteDevicePhoto(photo)"
                />
              </div>
              <p
                v-if="photo.displayTime"
                class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate"
              >
                {{ photo.displayTime }}
              </p>
            </div>
          </div>

          <div
            v-else
            class="text-center py-8 text-muted"
          >
            <UIcon
              name="i-lucide-image"
              class="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>暂无照片</p>
          </div>
        </div>
      </UCard>

      <!-- 无选中设备 -->
      <UCard
        v-else
        class="h-full flex items-center justify-center"
      >
        <div class="text-center text-muted">
          <UIcon
            name="i-lucide-hard-drive"
            class="w-16 h-16 mx-auto mb-4 opacity-50"
          />
          <p>请选择一个设备查看详情</p>
        </div>
      </UCard>
    </div>
  </div>

  <!-- 添加/编辑设备弹窗 -->
  <UModal
    v-model:open="showDeviceModal"
    :title="editingDevice ? '编辑设备' : '添加设备'"
  >
    <template #body>
      <UForm
        class="space-y-4"
        @submit="handleDeviceSubmit"
      >
        <UFormField
          label="设备名称"
          required
        >
          <UInput
            v-model="deviceForm.name"
            placeholder="请输入设备名称"
          />
        </UFormField>
        <UFormField
          label="设备编号"
          required
        >
          <UInput
            v-model="deviceForm.code"
            placeholder="请输入设备编号"
          />
        </UFormField>
        <UFormField label="工程信息">
          <UInput
            v-model="deviceForm.project"
            placeholder="请输入工程信息"
          />
        </UFormField>
        <div class="grid grid-cols-3 gap-4">
          <UFormField label="经度">
            <UInput
              v-model="deviceForm.longitude"
              type="number"
              placeholder="经度"
            />
          </UFormField>
          <UFormField label="纬度">
            <UInput
              v-model="deviceForm.latitude"
              type="number"
              placeholder="纬度"
            />
          </UFormField>
          <UFormField label="高程">
            <UInput
              v-model="deviceForm.elevation"
              type="number"
              placeholder="高程"
            />
          </UFormField>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <UFormField label="X 坐标">
            <UInput
              v-model="deviceForm.coordX"
              type="number"
              placeholder="X"
            />
          </UFormField>
          <UFormField label="Y 坐标">
            <UInput
              v-model="deviceForm.coordY"
              type="number"
              placeholder="Y"
            />
          </UFormField>
          <UFormField label="Z 坐标">
            <UInput
              v-model="deviceForm.coordZ"
              type="number"
              placeholder="Z"
            />
          </UFormField>
        </div>
        <div class="flex gap-3 pt-4">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            class="flex-1 justify-center"
            @click="closeDeviceModal"
          >
            取消
          </UButton>
          <UButton
            type="submit"
            color="primary"
            class="flex-1 justify-center"
          >
            {{ editingDevice ? '保存' : '添加' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>

  <!-- 添加/编辑测点弹窗 -->
  <UModal
    v-model:open="showPointModal"
    :title="editingPoint ? '编辑测点' : '添加测点'"
  >
    <template #body>
      <UForm
        class="space-y-4"
        @submit="handlePointSubmit"
      >
        <UFormField
          label="序号"
          required
        >
          <UInput
            v-model="pointForm.index"
            type="number"
            placeholder="序号"
          />
        </UFormField>
        <UFormField
          label="名称"
          required
        >
          <UInput
            v-model="pointForm.name"
            placeholder="请输入测点名称"
          />
        </UFormField>
        <div class="grid grid-cols-3 gap-4">
          <UFormField label="X 坐标">
            <UInput
              v-model="pointForm.coordX"
              type="number"
              placeholder="X"
            />
          </UFormField>
          <UFormField label="Y 坐标">
            <UInput
              v-model="pointForm.coordY"
              type="number"
              placeholder="Y"
            />
          </UFormField>
          <UFormField label="Z 坐标">
            <UInput
              v-model="pointForm.coordZ"
              type="number"
              placeholder="Z"
            />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="环号">
            <UInput
              v-model="pointForm.ringNumber"
              placeholder="环号"
            />
          </UFormField>
          <UFormField label="尺寸">
            <UInput
              v-model="pointForm.size"
              placeholder="尺寸"
            />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="水平预警阈值 (mm)">
            <UInput
              v-model="pointForm.warningThresholdHorizontal"
              type="number"
              placeholder="水平位移预警阈值"
            />
          </UFormField>
          <UFormField label="垂直预警阈值 (mm)">
            <UInput
              v-model="pointForm.warningThresholdVertical"
              type="number"
              placeholder="垂直位移预警阈值"
            />
          </UFormField>
          <UFormField label="水平报警阈值 (mm)">
            <UInput
              v-model="pointForm.alarmThresholdHorizontal"
              type="number"
              placeholder="水平位移报警阈值"
            />
          </UFormField>
          <UFormField label="垂直报警阈值 (mm)">
            <UInput
              v-model="pointForm.alarmThresholdVertical"
              type="number"
              placeholder="垂直位移报警阈值"
            />
          </UFormField>
        </div>
        <div class="flex gap-3 pt-4">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            class="flex-1 justify-center"
            @click="closePointModal"
          >
            取消
          </UButton>
          <UButton
            type="submit"
            color="primary"
            class="flex-1 justify-center"
          >
            {{ editingPoint ? '保存' : '添加' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>

  <!-- 添加照片弹窗 -->
  <UModal
    v-model:open="showPhotoModal"
    title="上传照片"
  >
    <template #body>
      <UForm
        class="space-y-4"
        @submit="createDevicePhoto"
      >
        <!-- 文件选择 -->
        <UFormField
          label="选择图片"
          description="支持 JPG、PNG、WebP 格式"
        >
          <div v-if="!selectedFile" class="w-full">
            <UFileUpload
              v-model="selectedFile"
              accept="image/jpeg,image/png,image/webp"
              :multiple="false"
              size="lg"
              label="点击选择图片或拖拽到此处"
              description="图片文件，不超过 10MB"
              :preview="false"
              class="w-full min-h-48"
              @update:model-value="onFileSelect"
            />
          </div>
          <div
            v-if="previewUrl"
            class="rounded-lg overflow-hidden border border-accented aspect-video"
          >
            <img
              :src="previewUrl"
              class="w-full h-full object-cover"
              alt="Preview"
            />
          </div>
        </UFormField>

        <!-- 显示时刻 -->
        <UFormField label="显示时刻 (HH:mm)">
          <div class="flex gap-2 items-center">
            <USelect
              v-model="photoTimeValue"
              placeholder="选择时间"
              class="flex-1"
              :items="timeOptions"
            />
          </div>
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex gap-3">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          class="flex-1 justify-center"
          :disabled="isUploading"
          @click="closePhotoModal"
        >
          取消
        </UButton>
        <UButton
          type="submit"
          color="primary"
          class="flex-1 justify-center"
          :disabled="!selectedFile || isUploading"
          :loading="isUploading"
        >
          {{ isUploading ? '上传中...' : '上传' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
