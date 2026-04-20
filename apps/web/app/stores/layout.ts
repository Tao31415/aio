/**
 * 布局状态管理
 */
export const useLayoutStore = defineStore('layout', {
  state: () => ({
    // 侧边栏折叠状态
    sidebarCollapsed: false,
    // 移动端侧边栏打开状态
    mobileSidebarOpen: false,
  }),

  getters: {
    // 侧边栏宽度
    sidebarWidth: (state) => (state.sidebarCollapsed ? 64 : 200),
  },

  actions: {
    // 切换侧边栏折叠
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    // 设置侧边栏折叠状态
    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    },

    // 切换移动端侧边栏
    toggleMobileSidebar() {
      this.mobileSidebarOpen = !this.mobileSidebarOpen
    },

    // 打开移动端侧边栏
    openMobileSidebar() {
      this.mobileSidebarOpen = true
    },

    // 关闭移动端侧边栏
    closeMobileSidebar() {
      this.mobileSidebarOpen = false
    },
  },

  persist: {
    key: 'aio-layout',
    pick: ['sidebarCollapsed'],
  },
})
