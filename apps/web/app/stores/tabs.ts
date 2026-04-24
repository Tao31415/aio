/**
 * 标签页状态管理
 */

import { APP_ROUTE_MAP } from '~/utils/route-config'

export interface Tab {
  id: string
  title: string
  path: string
  icon?: string
  closable?: boolean
}

// 固定标签路径（不可关闭）
const FIXED_TAB_PATHS = ['/dashboard']

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    // 标签列表
    tabs: [] as Tab[],
  }),

  getters: {
    // 当前标签数量
    count: (state) => state.tabs.length,

    // 获取固定标签
    fixedTabs: (state) =>
      state.tabs.filter((tab) => FIXED_TAB_PATHS.includes(tab.path)),

    // 根据路径获取标签
    getTabByPath: (state) => (path: string) => {
      return state.tabs.find((tab) => tab.path === path)
    },

    // 根据 ID 获取标签
    getTabById: (state) => (id: string) => {
      return state.tabs.find((tab) => tab.id === id)
    },
  },

  actions: {
    // 检查路径是否为固定标签
    isFixedPath(path: string): boolean {
      return FIXED_TAB_PATHS.includes(path)
    },

    // 添加标签
    addTab(tab: Tab) {
      const existingTab = this.tabs.find((t) => t.path === tab.path)
      if (!existingTab) {
        // 如果是固定路径，强制设置 closable: false
        const finalTab = this.isFixedPath(tab.path)
          ? { ...tab, closable: false }
          : tab
        this.tabs.push(finalTab)
      }
    },

    // 关闭标签
    closeTab(id: string) {
      const index = this.tabs.findIndex((tab) => tab.id === id)
      const tab = index !== -1 ? this.tabs[index] : undefined
      if (tab && tab.closable !== false) {
        this.tabs.splice(index, 1)
      }
    },

    // 初始化标签
    init() {
      // 确保固定标签存在
      FIXED_TAB_PATHS.forEach((path) => {
        const existing = this.tabs.find((t) => t.path === path)
        if (!existing) {
          const title = APP_ROUTE_MAP[path]?.title || path
          this.tabs.push({
            id: `fixed-${path.replace('/', '')}`,
            title,
            path,
            closable: false,
          })
        }
      })
    },

    // 关闭其他标签
    closeOtherTabs(currentPath: string) {
      this.tabs = this.tabs.filter(
        (tab) => tab.path === currentPath || tab.closable === false
      )
    },

    // 关闭所有标签（除了固定标签）
    closeAllTabs() {
      this.tabs = this.tabs.filter((tab) => tab.closable === false)
    },

    // 关闭左侧标签
    closeLeftTabs(currentPath: string) {
      const currentIndex = this.tabs.findIndex(
        (tab) => tab.path === currentPath
      )
      if (currentIndex > 0) {
        this.tabs = this.tabs.filter(
          (tab, index) => index >= currentIndex || tab.closable === false
        )
      }
    },

    // 关闭右侧标签
    closeRightTabs(currentPath: string) {
      const currentIndex = this.tabs.findIndex(
        (tab) => tab.path === currentPath
      )
      if (currentIndex < this.tabs.length - 1) {
        this.tabs = this.tabs.filter(
          (tab, index) => index <= currentIndex || tab.closable === false
        )
      }
    },

    // 更新标签标题
    updateTabTitle(path: string, title: string) {
      const tab = this.tabs.find((t) => t.path === path)
      if (tab) {
        tab.title = title
      }
    },

    // 重置标签
    reset() {
      this.$reset()
      // 重新初始化固定标签
      this.init()
    },
  },

  persist: {
    key: 'aio-tabs',
    pick: ['tabs'],
  },
})
