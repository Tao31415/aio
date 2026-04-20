/**
 * UI 设置状态管理
 */

export type Theme = 'light' | 'dark' | 'system'

export type SkinPreset =
  | 'default'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'violet'
  | 'rose'
  | 'teal'
  | 'slate'
  | 'ocean'
  | 'sunset'
  | 'aurora'

export const useUiSettingsStore = defineStore('uiSettings', {
  state: () => ({
    // 显示页脚
    showFooter: true,
    // 显示标签栏
    showTabBar: true,
    // 移动端头部固定
    mobileHeaderFixed: true,
    // 移动端标签栏固定
    mobileTabBarFixed: true,
    // 主题皮肤
    skin: 'default' as SkinPreset,
    // 主题模式
    theme: 'system' as Theme,
  }),

  getters: {
    // 解析后的主题（处理 system 选项）
    resolvedTheme(): 'light' | 'dark' {
      if (this.theme === 'system') {
        if (typeof window !== 'undefined') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
        }
        return 'light'
      }
      return this.theme
    },

    // 是否为暗黑模式
    isDark(): boolean {
      return this.resolvedTheme === 'dark'
    },
  },

  actions: {
    // 初始化
    init() {
      this.applyTheme()
      this.applySkin()
      this.watchSystemTheme()
    },

    // 设置主题
    setTheme(theme: Theme) {
      this.theme = theme
      this.applyTheme()
    },

    // 切换主题
    toggleTheme() {
      const themes: Theme[] = ['light', 'dark', 'system']
      const currentIndex = themes.indexOf(this.theme)
      const nextIndex = (currentIndex + 1) % themes.length
      this.setTheme(themes[nextIndex])
    },

    // 应用主题到 DOM
    applyTheme() {
      if (typeof document === 'undefined') return

      const html = document.documentElement
      if (this.resolvedTheme === 'dark') {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    },

    // 设置皮肤
    setSkin(skin: SkinPreset) {
      this.skin = skin
      this.applySkin()
    },

    // 应用皮肤到 DOM
    applySkin() {
      if (typeof document === 'undefined') return

      const html = document.documentElement
      // 移除所有皮肤类
      html.classList.forEach((cls) => {
        if (cls.startsWith('skin-')) {
          html.classList.remove(cls)
        }
      })
      // 添加当前皮肤类
      if (this.skin !== 'default') {
        html.classList.add(`skin-${this.skin}`)
      }
    },

    // 监听系统主题变化
    watchSystemTheme() {
      if (typeof window === 'undefined') return

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => {
        if (this.theme === 'system') {
          this.applyTheme()
        }
      })
    },

    // 切换页脚显示
    toggleFooter() {
      this.showFooter = !this.showFooter
    },

    // 切换标签栏显示
    toggleTabBar() {
      this.showTabBar = !this.showTabBar
    },

    // 重置设置
    reset() {
      this.$reset()
      this.applyTheme()
      this.applySkin()
    },
  },

  persist: {
    key: 'aio-ui-settings',
    pick: [
      'showFooter',
      'showTabBar',
      'mobileHeaderFixed',
      'mobileTabBarFixed',
      'skin',
      'theme',
    ],
  },
})
