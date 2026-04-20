/**
 * 标签页状态管理
 */

export interface Tab {
  id: string
  title: string
  path: string
  icon?: string
  closable?: boolean
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    // 标签列表
    tabs: [
      {
        id: 'home',
        title: '仪表板',
        path: '/',
        closable: false,
      },
    ] as Tab[],
  }),

  getters: {
    // 当前标签数量
    count: (state) => state.tabs.length,

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
    // 添加标签
    addTab(tab: Tab) {
      const existingTab = this.tabs.find((t) => t.path === tab.path)
      if (!existingTab) {
        this.tabs.push(tab)
      }
    },

    // 关闭标签
    closeTab(id: string) {
      const index = this.tabs.findIndex((tab) => tab.id === id)
      if (index !== -1 && this.tabs[index].closable !== false) {
        this.tabs.splice(index, 1)
      }
    },

    // 关闭其他标签
    closeOtherTabs(currentPath: string) {
      this.tabs = this.tabs.filter(
        (tab) => tab.path === currentPath || tab.closable === false
      )
    },

    // 关闭所有标签（除了首页）
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
    },
  },

  persist: {
    key: 'aio-tabs',
    pick: ['tabs'],
  },
})
