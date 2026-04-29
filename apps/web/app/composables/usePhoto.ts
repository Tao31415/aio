import type { DevicePhoto } from '~/stores/device'

export interface PhotoWithDetails {
  id: string
  url: string
  name: string
  time: string
  displayTime: string | null
  deviceId: string
  objectName: string
  createdAt: string
}

export interface PhotoQueryOptions {
  startTime?: Date | string
  endTime?: Date | string
  limit?: number
}

const photoCache = new Map<string, { data: DevicePhoto[]; timestamp: number }>()
const photoUrlCache = new Map<string, { url: string; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000

export function usePhoto() {
  const logger = useLogger('usePhoto')
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchPhotos(
    deviceId: string,
    options: PhotoQueryOptions = {}
  ): Promise<DevicePhoto[]> {
    const cacheKey = `photos:${deviceId}:${options.startTime?.toString() || ''}:${options.endTime?.toString() || ''}`
    const now = Date.now()
    const cached = photoCache.get(cacheKey)

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      logger.info({
        msg: '📷 Using cached photos',
        deviceId,
        age: `${now - cached.timestamp}ms`,
        count: cached.data.length,
      })
      return cached.data
    }

    isLoading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (options.startTime) {
        const start =
          options.startTime instanceof Date
            ? options.startTime.toISOString()
            : options.startTime
        queryParams.append('startTime', start)
      }
      if (options.endTime) {
        const end =
          options.endTime instanceof Date
            ? options.endTime.toISOString()
            : options.endTime
        queryParams.append('endTime', end)
      }
      if (options.limit) {
        queryParams.append('limit', String(options.limit))
      }

      const url = `${apiBase}/api/v1/device/photos/device/${deviceId}${queryParams.toString() ? `?${queryParams}` : ''}`

      logger.info({
        msg: '📷 Fetching device photos',
        deviceId,
        options,
      })

      const data = await $fetch<DevicePhoto[]>(url)

      photoCache.set(cacheKey, { data: data || [], timestamp: now })

      logger.info({
        msg: '✅ Photos fetched',
        deviceId,
        count: data?.length || 0,
      })

      return data || []
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      error.value = new Error(errorMsg)

      logger.error({
        msg: '❌ Failed to fetch photos',
        deviceId,
        error: errorMsg,
      })

      return []
    } finally {
      isLoading.value = false
    }
  }

  function transformPhotos(
    photos: DevicePhoto[],
    includeDownload = false
  ): PhotoWithDetails[] {
    return photos.map((photo) => {
      const downloadUrl = includeDownload
        ? `${apiBase}/api/v1/upload/download?objectName=${encodeURIComponent(photo.objectName)}`
        : ''

      return {
        id: photo.id,
        url: downloadUrl,
        name: photo.objectName.split('/').pop() || photo.objectName,
        time: photo.displayTime || photo.createdAt,
        displayTime: photo.displayTime,
        deviceId: photo.deviceId,
        objectName: photo.objectName,
        createdAt: photo.createdAt,
      }
    })
  }

  async function getPresignedUrl(
    objectName: string,
    useCache = true
  ): Promise<string | null> {
    const cacheKey = `url:${objectName}`
    const now = Date.now()
    const cached = photoUrlCache.get(cacheKey)

    if (useCache && cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.url
    }

    try {
      const data = await $fetch<{
        objectName: string
        presignedUrl: string
        expiresIn: number
      }>(`${apiBase}/api/v1/upload/presign-download`, {
        method: 'POST',
        body: { objectName },
      })

      photoUrlCache.set(cacheKey, { url: data.presignedUrl, timestamp: now })

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

  function clearCache(deviceId?: string) {
    if (deviceId) {
      for (const key of photoCache.keys()) {
        if (key.startsWith(`photos:${deviceId}:`)) {
          photoCache.delete(key)
        }
      }
      logger.info({ msg: '🗑️ Cleared photo cache', deviceId })
    } else {
      photoCache.clear()
      logger.info({ msg: '🗑️ Cleared all photo cache' })
    }
    photoUrlCache.clear()
  }

  function clearUrlCache(objectName?: string) {
    if (objectName) {
      photoUrlCache.delete(`url:${objectName}`)
    } else {
      photoUrlCache.clear()
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchPhotos,
    transformPhotos,
    getPresignedUrl,
    clearCache,
    clearUrlCache,
  }
}

export function useDevicePhotos(deviceId: string | Ref<string>) {
  const resolvedId = computed(() =>
    typeof deviceId === 'string' ? deviceId : deviceId.value
  )
  const { fetchPhotos, transformPhotos, isLoading, error } = usePhoto()

  const photos = ref<DevicePhoto[]>([])
  const photoDetails = ref<PhotoWithDetails[]>([])

  async function load(options: PhotoQueryOptions = {}) {
    const rawPhotos = await fetchPhotos(resolvedId.value, options)
    photos.value = rawPhotos
    photoDetails.value = transformPhotos(rawPhotos, true)
  }

  watch(
    resolvedId,
    () => {
      load()
    },
    { immediate: true }
  )

  return {
    photos: readonly(photos),
    photoDetails: readonly(photoDetails),
    isLoading,
    error,
    load,
  }
}
