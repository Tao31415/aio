import { defineStore } from 'pinia'
import { useDevice } from '~/composables/useDevice'

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

  const { fetchDevice, clearCache: clearDeviceCache } = useDevice()

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

  async function fetchDeviceById(deviceId: string): Promise<Device | null> {
    const device = await fetchDevice(deviceId)
    return device as Device | null
  }

  async function refreshSelectedDevice() {
    if (!selectedDevice.value) return
    const device = await fetchDevice(selectedDevice.value.id)
    if (device) {
      const oldPhotos = selectedDevice.value.devicePhotos || []
      const newPhotos = device.devicePhotos || []

      oldPhotos.forEach((oldPhoto) => {
        const stillExists = newPhotos.some((p) => p.id === oldPhoto.id)
        if (!stillExists && photoUrls.value[oldPhoto.id]) {
          delete photoUrls.value[oldPhoto.id]
        }
      })

      selectedDevice.value = device
      const idx = devices.value.findIndex((d) => d.id === device.id)
      if (idx !== -1) {
        devices.value[idx] = device
      }
    }
  }

  function selectDevice(device: Device | null) {
    selectedDevice.value = device
  }

  function setSelectedDeviceById(deviceId: string) {
    const cachedDevice = devices.value.find((d) => d.id === deviceId)
    if (cachedDevice) {
      selectedDevice.value = cachedDevice
    } else {
      selectedDevice.value = null
      fetchDeviceById(deviceId).then((device) => {
        if (device) {
          selectedDevice.value = device
        }
      })
    }
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

  function clearCache(deviceId?: string) {
    clearDeviceCache(deviceId)
    if (deviceId) {
      const idx = devices.value.findIndex((d) => d.id === deviceId)
      if (idx !== -1) {
        devices.value.splice(idx, 1)
      }
    }
  }

  return {
    devices,
    selectedDevice,
    isLoading,
    photoUrls,
    isLoadingPhotoUrls,
    fetchDevices,
    fetchDeviceById,
    refreshSelectedDevice,
    selectDevice,
    setSelectedDeviceById,
    fetchPhotoUrl,
    loadAllPhotoUrls,
    clearPhotoUrls,
    clearCache,
  }
})
