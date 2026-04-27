<script setup lang="ts">
  import { APP_ROUTE_MAP } from '~/utils/route-config'
  import type { Device } from '~/stores/device'
  import { useDeviceStore } from '~/stores/device'

  definePageMeta({
    title: APP_ROUTE_MAP['/device']!.title,
    icon: APP_ROUTE_MAP['/device']!.icon,
    layout: 'dashboard',
    auth: 'user',
  })

  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const deviceStore = useDeviceStore()

  const searchQuery = ref('')
  const snList = ref<string[]>([])
  const isLoadingSnList = ref(false)
  const showDeviceModal = ref(false)
  const editingDevice = ref<Device | null>(null)

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

  const activeTab = computed({
    get: () => (route.query.tab as string) || 'info',
    set: (val) => router.push({ query: { ...route.query, tab: val } }),
  })

  const filteredDevices = computed(() => {
    if (!searchQuery.value) return deviceStore.devices
    const q = searchQuery.value.toLowerCase()
    return deviceStore.devices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.project && d.project.toLowerCase().includes(q))
    )
  })

  async function fetchSnList() {
    try {
      isLoadingSnList.value = true
      const response = await $fetch<{ data: string[] }>(
        `${apiBase}/api/v1/mqtt/tunnel-monitoring/sn`
      )
      snList.value = response.data || []
    } catch (e) {
      console.error('Failed to fetch SN list:', e)
      snList.value = []
    } finally {
      isLoadingSnList.value = false
    }
  }

  async function createDevice() {
    try {
      await $fetch<Device>(`${apiBase}/api/v1/device`, {
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
      await deviceStore.fetchDevices()
    } catch (e) {
      toast.add({
        title: '创建设备失败',
        description: String(e),
        color: 'error',
      })
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
      await deviceStore.fetchDevices()
      if (deviceStore.selectedDevice?.id === editingDevice.value.id) {
        deviceStore.selectDevice(data)
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
      if (deviceStore.selectedDevice?.id === device.id) {
        deviceStore.selectDevice(null)
      }
      await deviceStore.fetchDevices()
    } catch (e) {
      toast.add({ title: '删除失败', description: String(e), color: 'error' })
    }
  }

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

  function handleDeviceSubmit() {
    if (editingDevice.value) {
      updateDevice()
    } else {
      createDevice()
    }
  }

  function handleSelectDevice(device: Device) {
    deviceStore.selectDevice(device)
    deviceStore.loadAllPhotoUrls()
    router.push({ query: { ...route.query, deviceId: device.id } })
  }

  watch(
    () => route.query.deviceId,
    (deviceId) => {
      if (deviceId) {
        deviceStore.setSelectedDeviceById(deviceId as string)
        deviceStore.loadAllPhotoUrls()
      } else {
        deviceStore.selectDevice(null)
      }
    },
    { immediate: true }
  )

  watch(
    () => deviceStore.devices,
    (devices) => {
      if (route.query.deviceId) {
        deviceStore.setSelectedDeviceById(route.query.deviceId as string)
      }
    }
  )

  onMounted(() => {
    deviceStore.fetchDevices()
    fetchSnList()
  })
</script>

<template>
  <div class="flex h-full gap-6">
    <div class="w-80 shrink-0 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold">设备管理</h1>
        <UButton
          icon="i-lucide-plus"
          size="sm"
          @click="openAddDeviceModal"
        />
      </div>

      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="搜索设备..."
      />

      <div class="space-y-2">
        <UCard
          v-for="device in filteredDevices"
          :key="device.id"
          :class="[
            'cursor-pointer transition-all hover:border-primary',
            deviceStore.selectedDevice?.id === device.id &&
              'border-primary ring-1 ring-primary',
          ]"
          @click="handleSelectDevice(device)"
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

    <div class="flex-1 min-w-0">
      <UCard
        v-if="deviceStore.selectedDevice"
        class="h-full"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div>
                <h2 class="text-lg font-bold">
                  {{ deviceStore.selectedDevice.name }}
                </h2>
                <p class="text-sm text-muted">
                  {{ deviceStore.selectedDevice.code }}
                </p>
              </div>
              <UButton
                :to="`/home/device?deviceId=${deviceStore.selectedDevice.id}`"
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

        <DeviceInfo v-if="activeTab === 'info'" />
        <DevicePoints v-else-if="activeTab === 'points'" />
        <DevicePhotos v-else-if="activeTab === 'photos'" />
      </UCard>

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
          <div v-if="snList.length > 0">
            <USelect
              v-model="deviceForm.code"
              :items="snList.map((sn) => ({ label: sn, value: sn }))"
              placeholder="选择或输入设备编号"
              :loading="isLoadingSnList"
              creatable
              :create-formatter="(value: string) => ({ label: value, value })"
            />
          </div>
          <div v-else>
            <UInput
              v-model="deviceForm.code"
              placeholder="请输入设备编号"
            />
          </div>
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
</template>
