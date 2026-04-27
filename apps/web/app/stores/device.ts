import { defineStore } from 'pinia'

export interface MeasurementPoint {
  id: string
  deviceId: string
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

export interface DevicePhoto {
  id: string
  deviceId: string
  objectName: string
  displayTime: string | null
  createdAt: string
}

export interface PointThumbnail {
  id: string
  measurementPointId: string
  devicePhotoId: string | null
  objectName: string
  cropX: number
  cropY: number
  cropSize: number
  createdAt: string
}

export interface Device {
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

export const useDeviceStore = defineStore('device', () => {
  const devices = ref<Device[]>([])
  const selectedDevice = ref<Device | null>(null)
  const isLoading = ref(false)

  const photoUrls = ref<Record<string, string>>({})
  const isLoadingPhotoUrls = ref(false)

  async function fetchDevices() {
    isLoading.value = true
    try {
      const config = useRuntimeConfig()
      const apiBase = config.public.apiBase
      const data = await $fetch<Device[]>(`${apiBase}/api/v1/device`)
      devices.value = data || []
    } catch (e) {
      const toast = useToast()
      toast.add({
        title: '加载设备列表失败',
        description: String(e),
        color: 'error',
      })
    } finally {
      isLoading.value = false
    }
  }

  async function refreshSelectedDevice() {
    if (!selectedDevice.value) return
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase
    const data = await $fetch<Device>(
      `${apiBase}/api/v1/device/${selectedDevice.value.id}`
    )
    if (data) {
      const oldPhotos = selectedDevice.value.devicePhotos || []
      const newPhotos = data.devicePhotos || []

      oldPhotos.forEach((oldPhoto) => {
        const stillExists = newPhotos.some((p) => p.id === oldPhoto.id)
        if (!stillExists && photoUrls.value[oldPhoto.id]) {
          delete photoUrls.value[oldPhoto.id]
        }
      })

      selectedDevice.value = data
      const idx = devices.value.findIndex((d) => d.id === data.id)
      if (idx !== -1) {
        devices.value[idx] = data
      }
    }
  }

  function selectDevice(device: Device | null) {
    selectedDevice.value = device
  }

  function setSelectedDeviceById(deviceId: string) {
    selectedDevice.value = devices.value.find((d) => d.id === deviceId) || null
  }

  async function fetchPhotoUrl(photo: DevicePhoto): Promise<string> {
    if (photoUrls.value[photo.id]) {
      return photoUrls.value[photo.id]!
    }

    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase
    try {
      const data = await $fetch<{
        objectName: string
        presignedUrl: string
        expiresIn: number
      }>(`${apiBase}/api/v1/upload/presign-download`, {
        method: 'POST',
        body: { objectName: photo.objectName },
      })
      photoUrls.value[photo.id] = data.presignedUrl
      return data.presignedUrl
    } catch (e) {
      const toast = useToast()
      toast.add({
        title: '获取图片地址失败',
        description: `${photo.objectName}: ${String(e)}`,
        color: 'error',
      })
      throw e
    }
  }

  async function loadAllPhotoUrls(): Promise<void> {
    if (!selectedDevice.value?.devicePhotos?.length) {
      return
    }

    const photos = selectedDevice.value.devicePhotos.filter(
      (p) => !photoUrls.value[p.id]
    )
    if (photos.length === 0) {
      return
    }

    isLoadingPhotoUrls.value = true
    try {
      await Promise.allSettled(photos.map((photo) => fetchPhotoUrl(photo)))
    } finally {
      isLoadingPhotoUrls.value = false
    }
  }

  function clearPhotoUrls(photoId?: string) {
    if (photoId) {
      delete photoUrls.value[photoId]
    } else {
      photoUrls.value = {}
    }
  }

  return {
    devices,
    selectedDevice,
    isLoading,
    photoUrls,
    isLoadingPhotoUrls,
    fetchDevices,
    refreshSelectedDevice,
    selectDevice,
    setSelectedDeviceById,
    fetchPhotoUrl,
    loadAllPhotoUrls,
    clearPhotoUrls,
  }
})
