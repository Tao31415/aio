import { useLogger } from './useLogger'

export interface CustomFetchOptions<T = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  params?: Record<string, string | number | boolean | undefined | null>
  body?: T
  headers?: Record<string, string>
  timeout?: number
  retry?: number
  retryDelay?: number
}

export interface RequestLog {
  url: string
  method: string
  params?: Record<string, unknown>
  body?: unknown
  timestamp: string
  status?: 'pending' | 'success' | 'error'
  duration?: number
  response?: unknown
  error?: string
}

const requestLogs = ref<RequestLog[]>([])

export function useRequestLogs() {
  return {
    logs: readonly(requestLogs),
    clearLogs: () => {
      requestLogs.value = []
    },
  }
}

export function useCustomFetch<T = unknown>(
  baseUrl: string,
  defaultOptions: CustomFetchOptions<T> = {}
) {
  const logger = useLogger('useCustomFetch')
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)

  const fullUrl = computed(() => {
    if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
      return baseUrl
    }
    return `${apiBase}${baseUrl}`
  })

  async function execute<R = T>(
    url: string,
    options: CustomFetchOptions<R> = {}
  ): Promise<R | null> {
    const mergedOptions = { ...defaultOptions, ...options }
    const finalUrl = mergedOptions.params
      ? `${url}?${new URLSearchParams(
          mergedOptions.params as Record<string, string>
        ).toString()}`
      : url

    const logEntry: RequestLog = {
      url: finalUrl,
      method: mergedOptions.method || 'GET',
      params: mergedOptions.params as Record<string, unknown>,
      body: mergedOptions.body as unknown,
      timestamp: new Date().toISOString(),
      status: 'pending',
    }

    const startTime = Date.now()

    logger.info({
      msg: '🚀 Request started',
      url: finalUrl,
      method: mergedOptions.method || 'GET',
      params: mergedOptions.params,
      body: mergedOptions.body,
    })

    requestLogs.value.push(logEntry)

    isLoading.value = true
    error.value = null

    const maxRetries = mergedOptions.retry ?? 0
    const retryDelay = mergedOptions.retryDelay ?? 1000

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await $fetch<R>(finalUrl, {
          method: mergedOptions.method || 'GET',
          body: mergedOptions.body as Record<string, unknown>,
          headers: mergedOptions.headers,
          timeout: mergedOptions.timeout,
        })

        const duration = Date.now() - startTime

        logEntry.status = 'success'
        logEntry.duration = duration
        logEntry.response = result

        logger.info({
          msg: '✅ Request success',
          url: finalUrl,
          duration: `${duration}ms`,
          attempt: attempt + 1,
        })

        data.value = result as T
        return result
      } catch (e) {
        const isLastAttempt = attempt === maxRetries

        if (isLastAttempt) {
          const duration = Date.now() - startTime
          const errorMessage = e instanceof Error ? e.message : String(e)

          logEntry.status = 'error'
          logEntry.duration = duration
          logEntry.error = errorMessage

          logger.error({
            msg: '❌ Request failed',
            url: finalUrl,
            duration: `${duration}ms`,
            attempts: attempt + 1,
            error: errorMessage,
          })

          error.value = e instanceof Error ? e : new Error(String(e))
          data.value = null
          return null
        }

        logger.warn({
          msg: '🔄 Request retry',
          url: finalUrl,
          attempt: attempt + 1,
          maxRetries,
          retryDelay,
        })

        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        )
      }
    }

    return null
  }

  async function get<R = T>(
    url: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): Promise<R | null> {
    return execute<R>(url, { ...defaultOptions, method: 'GET', params })
  }

  async function post<R = T>(url: string, body?: R): Promise<R | null> {
    return execute<R>(url, { ...defaultOptions, method: 'POST', body })
  }

  async function put<R = T>(url: string, body?: R): Promise<R | null> {
    return execute<R>(url, { ...defaultOptions, method: 'PUT', body })
  }

  async function del<R = T>(
    url: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): Promise<R | null> {
    return execute<R>(url, { ...defaultOptions, method: 'DELETE', params })
  }

  return {
    data: readonly(data),
    isLoading: readonly(isLoading),
    error: readonly(error),
    execute,
    get,
    post,
    put,
    delete: del,
    fullUrl,
  }
}

export function useFetchWithCache<T = unknown>(
  baseUrl: string,
  options: CustomFetchOptions<T> & {
    cacheKey?: string
    cacheDuration?: number
  } = {}
) {
  const { cacheKey = baseUrl, cacheDuration = 5 * 60 * 1000 } = options
  const customFetch = useCustomFetch<T>(baseUrl, options)

  const cache = new Map<string, { data: T; timestamp: number }>()
  const cachedData = ref<T | null>(null)
  const isFromCache = ref(false)

  async function fetch<R = T>(
    url: string,
    fetchOptions?: CustomFetchOptions<R>
  ): Promise<R | null> {
    const now = Date.now()
    const cached = cache.get(cacheKey)

    if (cached && now - cached.timestamp < cacheDuration) {
      cachedData.value = cached.data
      isFromCache.value = true
      return cached.data as R
    }

    isFromCache.value = false
    const result = await customFetch.execute<R>(url, fetchOptions)

    if (result) {
      cache.set(cacheKey, { data: result as T, timestamp: now })
      cachedData.value = result as T
    }

    return result
  }

  function clearCache() {
    cache.delete(cacheKey)
  }

  function clearAllCache() {
    cache.clear()
  }

  return {
    ...customFetch,
    data: readonly(cachedData),
    isFromCache: readonly(isFromCache),
    fetch,
    clearCache,
    clearAllCache,
  }
}
