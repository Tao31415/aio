import type {
  Device,
  MeasurementPoint as StoreMeasurementPoint,
  DevicePhoto as StoreDevicePhoto,
} from '~/stores/device'

export interface DeviceListItem {
  id: string
  name: string
  code: string
  project: string | null
}

export interface DeviceDetail extends Device {
  measurementPoints: StoreMeasurementPoint[]
  devicePhotos: StoreDevicePhoto[]
}

export interface DevicePhoto extends StoreDevicePhoto {}

export interface DevicePhotoWithUrl extends DevicePhoto {
  url: string
  downloadUrl: string
}

export interface PhotoQueryParams {
  startTime?: string
  endTime?: string
  limit?: number
}

const deviceCache = new Map<string, { data: DeviceDetail; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000

export function useDevice() {
  const logger = useLogger('useDevice')
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchDevices(): Promise<DeviceListItem[]> {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<DeviceListItem[]>(`${apiBase}/api/v1/device`)

      logger.info({
        msg: '📋 Fetched device list',
        count: data?.length || 0,
      })

      return data || []
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      error.value = new Error(errorMsg)

      logger.error({
        msg: '❌ Failed to fetch device list',
        error: errorMsg,
      })

      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDevice(
    deviceId: string,
    useCache = true
  ): Promise<DeviceDetail | null> {
    const now = Date.now()
    const cached = deviceCache.get(deviceId)

    if (useCache && cached && now - cached.timestamp < CACHE_DURATION) {
      logger.info({
        msg: '📦 Using cached device data',
        deviceId,
        age: `${now - cached.timestamp}ms`,
      })
      return cached.data
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<DeviceDetail>(
        `${apiBase}/api/v1/device/${deviceId}`
      )

      logger.info({
        msg: '📡 Fetched device detail',
        deviceId,
        hasPoints: data?.measurementPoints?.length || 0,
        hasPhotos: data?.devicePhotos?.length || 0,
      })

      deviceCache.set(deviceId, { data, timestamp: now })
      return data
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      error.value = new Error(errorMsg)

      logger.error({
        msg: '❌ Failed to fetch device',
        deviceId,
        error: errorMsg,
      })

      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDevicePhotos(
    deviceId: string,
    params: PhotoQueryParams = {}
  ): Promise<DevicePhoto[]> {
    isLoading.value = true
    error.value = null

    try {
      const queryString = new URLSearchParams()
      if (params.startTime) queryString.append('startTime', params.startTime)
      if (params.endTime) queryString.append('endTime', params.endTime)
      if (params.limit) queryString.append('limit', String(params.limit))

      const url = `${apiBase}/api/v1/device/photos/device/${deviceId}${queryString.toString() ? `?${queryString}` : ''}`

      logger.info({
        msg: '📷 Fetching device photos',
        deviceId,
        params,
      })

      const data = await $fetch<DevicePhoto[]>(url)

      logger.info({
        msg: '✅ Device photos fetched',
        deviceId,
        count: data?.length || 0,
      })

      return data || []
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      error.value = new Error(errorMsg)

      logger.error({
        msg: '❌ Failed to fetch device photos',
        deviceId,
        error: errorMsg,
      })

      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPresignedUrl(objectName: string): Promise<string | null> {
    try {
      const data = await $fetch<{
        objectName: string
        presignedUrl: string
        expiresIn: number
      }>(`${apiBase}/api/v1/upload/presign-download`, {
        method: 'POST',
        body: { objectName },
      })

      logger.info({
        msg: '🔗 Fetched presigned URL',
        objectName,
        expiresIn: data.expiresIn,
      })

      return data.presignedUrl
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)

      logger.error({
        msg: '❌ Failed to fetch presigned URL',
        objectName,
        error: errorMsg,
      })

      return null
    }
  }

  async function fetchMonitoringData(params: {
    sn: string
    ringNumber?: string
    ringNumbers?: string[]
    startTime?: string
    endTime?: string
    limit?: number
  }): Promise<{ data: Array<Record<string, unknown>> } | null> {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      queryParams.append('sn', params.sn)
      if (params.ringNumber) queryParams.append('ringNumber', params.ringNumber)
      if (params.ringNumbers && params.ringNumbers.length > 0) {
        queryParams.append('ringNumbers', params.ringNumbers.join(','))
      }
      if (params.startTime) queryParams.append('startTime', params.startTime)
      if (params.endTime) queryParams.append('endTime', params.endTime)
      if (params.limit) queryParams.append('limit', String(params.limit))

      const url = `${apiBase}/api/v1/mqtt/tunnel-monitoring?${queryParams.toString()}`

      logger.info({
        msg: '📊 Fetching monitoring data',
        sn: params.sn,
        ringNumber: params.ringNumber || params.ringNumbers?.join(',') || 'all',
        startTime: params.startTime,
        endTime: params.endTime,
      })

      const data = await $fetch<{ data: Array<Record<string, unknown>> }>(url)

      logger.info({
        msg: '✅ Monitoring data fetched',
        sn: params.sn,
        count: data?.data?.length || 0,
      })

      return data
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      error.value = new Error(errorMsg)

      logger.error({
        msg: '❌ Failed to fetch monitoring data',
        sn: params.sn,
        error: errorMsg,
      })

      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearCache(deviceId?: string) {
    if (deviceId) {
      deviceCache.delete(deviceId)
      logger.info({ msg: '🗑️ Cleared device cache', deviceId })
    } else {
      deviceCache.clear()
      logger.info({ msg: '🗑️ Cleared all device cache' })
    }
  }

  function getCachedDevice(deviceId: string): DeviceDetail | null {
    const cached = deviceCache.get(deviceId)
    if (cached) {
      return cached.data
    }
    return null
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchDevices,
    fetchDevice,
    fetchDevicePhotos,
    fetchPresignedUrl,
    fetchMonitoringData,
    clearCache,
    getCachedDevice,
  }
}

export function useDeviceList() {
  const { fetchDevices, isLoading, error } = useDevice()
  const devices = ref<DeviceListItem[]>([])

  async function load() {
    devices.value = await fetchDevices()
  }

  return {
    devices: readonly(devices),
    isLoading,
    error,
    load,
  }
}

export function useDeviceDetail(deviceId: string | Ref<string>) {
  const resolvedId = computed(() =>
    typeof deviceId === 'string' ? deviceId : deviceId.value
  )
  const { fetchDevice, isLoading, error, clearCache } = useDevice()
  const device = ref<DeviceDetail | null>(null)

  async function load(useCache = true) {
    device.value = await fetchDevice(resolvedId.value, useCache)
  }

  watch(resolvedId, () => {
    load()
  })

  return {
    device: readonly(device),
    isLoading,
    error,
    load,
    clearCache: () => clearCache(resolvedId.value),
  }
}
