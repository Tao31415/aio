/**
 * Page caching composables
 * Matches Next.js use-keep-alive.tsx implementation
 */

// Hook: 自动保存和恢复滚动位置
export function useScrollRestore() {
  const route = useRoute()
  const cacheStore = usePageCacheStore()
  const isRestoringRef = ref(false)

  // 保存滚动位置
  onMounted(() => {
    const handleScroll = () => {
      if (!isRestoringRef.value) {
        cacheStore.setPageState(route.path, { scrollY: window.scrollY })
      }
    }

    // 使用节流
    let timeoutId: NodeJS.Timeout | undefined
    const throttledScroll = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 100)
    }

    window.addEventListener('scroll', throttledScroll)

    onUnmounted(() => {
      window.removeEventListener('scroll', throttledScroll)
      if (timeoutId) clearTimeout(timeoutId)
    })
  })

  // 恢复滚动位置
  onMounted(() => {
    const pageState = cacheStore.getPageState(route.path)
    if (pageState && pageState.scrollY > 0) {
      isRestoringRef.value = true
      // 等待页面渲染完成
      requestAnimationFrame(() => {
        window.scrollTo(0, pageState.scrollY)
        // 延迟重置标志，避免立即触发保存
        setTimeout(() => {
          isRestoringRef.value = false
        }, 100)
      })
    }
  })
}

// Hook: 保存和恢复表单状态
export function useFormCache<T extends Record<string, unknown>>(
  formKey: string,
  initialValues: T
): [Ref<T>, (values: T) => void, () => void] {
  const route = useRoute()
  const cacheKey = `${route.path}:${formKey}`
  const cacheStore = usePageCacheStore()

  // 从缓存获取初始值
  const getCachedValues = (): T => {
    const pageState = cacheStore.getPageState(cacheKey)
    if (pageState?.formData) {
      return pageState.formData as T
    }
    return initialValues
  }

  const values = ref(getCachedValues()) as Ref<T>

  // 保存表单值到缓存
  const saveValues = (newValues: T) => {
    values.value = newValues
    cacheStore.setPageState(cacheKey, { formData: newValues })
  }

  // 清除缓存
  const clearCache = () => {
    values.value = initialValues
    cacheStore.clearPageState(cacheKey)
  }

  return [values, saveValues, clearCache]
}

// Hook: 保存和恢复自定义状态
export function useStateCache<T>(
  key: string,
  initialValue: T
): [Ref<T>, (value: T) => void] {
  const route = useRoute()
  const cacheKey = `${route.path}:${key}`
  const cacheStore = usePageCacheStore()

  // 从缓存获取初始值
  const getCachedValue = (): T => {
    const pageState = cacheStore.getPageState(cacheKey)
    if (pageState?.customState?.[key] !== undefined) {
      return pageState.customState[key] as T
    }
    return initialValue
  }

  const value = ref(getCachedValue()) as Ref<T>

  // 同步到缓存
  watch(
    value,
    (newValue) => {
      const pageState = cacheStore.getPageState(cacheKey) || {
        scrollY: 0,
        timestamp: Date.now(),
      }
      cacheStore.setPageState(cacheKey, {
        customState: { ...pageState.customState, [key]: newValue },
      })
    },
    { deep: true }
  )

  const setValue = (newValue: T) => {
    value.value = newValue
  }

  return [value, setValue]
}

// Hook: KeepAlive 管理
export function useKeepAlive() {
  const route = useRoute()
  const includeKeys = useState<string[]>('keep-alive-include', () => [])

  const currentKey = computed(() => {
    return (
      (route.meta.keepAliveKey as string) ||
      (route.name as string) ||
      route.path
    )
  })

  watch(
    () => route.fullPath,
    () => {
      if (route.meta.keepAlive !== false) {
        const key = currentKey.value
        if (key && !includeKeys.value.includes(key)) {
          includeKeys.value.push(key)
        }
      }
    },
    { immediate: true }
  )

  return {
    includeKeys,
    currentKey,
  }
}
