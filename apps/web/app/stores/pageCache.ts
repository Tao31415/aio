/**
 * 页面缓存状态管理
 * Matches Next.js use-keep-alive.tsx implementation
 */

export interface PageState {
  scrollY: number
  formData?: Record<string, unknown>
  customState?: Record<string, unknown>
  timestamp: number
}

export const usePageCacheStore = defineStore('pageCache', {
  state: () => ({
    cache: new Map<string, PageState>(),
  }),

  actions: {
    setPageState(path: string, state: Partial<PageState>) {
      const existing = this.cache.get(path) || {
        scrollY: 0,
        timestamp: Date.now(),
      }
      this.cache.set(path, { ...existing, ...state, timestamp: Date.now() })
    },

    getPageState(path: string): PageState | undefined {
      return this.cache.get(path)
    },

    clearPageState(path: string) {
      this.cache.delete(path)
    },

    clearAllCache() {
      this.cache.clear()
    },
  },
})
