/**
 * 主题管理组合式函数
 * SSR/SSG 安全实现
 */

export function useTheme() {
  // 延迟获取 store，仅在客户端执行
  const getUiSettings = () => {
    if (import.meta.client) {
      return useUiSettingsStore()
    }
    return null
  }

  // 初始化主题
  function initTheme() {
    if (!import.meta.client) return

    const uiSettings = getUiSettings()
    if (!uiSettings) return

    // 应用保存的主题
    uiSettings.applyTheme()
    uiSettings.applySkin()
    uiSettings.watchSystemTheme()
  }

  // 设置主题
  function setTheme(theme: 'light' | 'dark' | 'system') {
    const uiSettings = getUiSettings()
    if (uiSettings) {
      uiSettings.setTheme(theme)
    }
  }

  // 切换主题
  function toggleTheme() {
    const uiSettings = getUiSettings()
    if (uiSettings) {
      uiSettings.toggleTheme()
    }
  }

  // 获取当前主题（SSR 安全）
  const currentTheme = computed(() => {
    const uiSettings = getUiSettings()
    return uiSettings?.theme ?? 'system'
  })

  const resolvedTheme = computed(() => {
    const uiSettings = getUiSettings()
    return uiSettings?.resolvedTheme ?? 'light'
  })

  const isDark = computed(() => {
    const uiSettings = getUiSettings()
    return uiSettings?.isDark ?? false
  })

  return {
    currentTheme,
    resolvedTheme,
    isDark,
    initTheme,
    setTheme,
    toggleTheme,
  }
}
