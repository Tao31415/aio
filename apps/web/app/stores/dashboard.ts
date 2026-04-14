import { defineStore } from 'pinia'

// 部件类型
export type WidgetType =
  | 'stats'
  | 'chart-line'
  | 'chart-bar'
  | 'chart-pie'
  | 'recent-users'
  | 'notifications'
  | 'tasks'
  | 'calendar'
  | 'quick-actions'

// 部件配置
export interface Widget {
  id: string
  type: WidgetType
  title: string
}

// 布局配置
export interface DashboardLayout {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

// 默认部件配置
const defaultWidgets: Widget[] = [
  { id: 'stats-1', type: 'stats', title: '核心指标' },
  { id: 'chart-line-1', type: 'chart-line', title: '访问趋势' },
  { id: 'chart-bar-1', type: 'chart-bar', title: '销售统计' },
  { id: 'recent-users-1', type: 'recent-users', title: '最近用户' },
  { id: 'notifications-1', type: 'notifications', title: '通知中心' },
  { id: 'tasks-1', type: 'tasks', title: '待办事项' },
]

// 默认布局配置
const defaultLayouts: DashboardLayout[] = [
  { i: 'stats-1', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
  { i: 'chart-line-1', x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3 },
  { i: 'chart-bar-1', x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
  { i: 'recent-users-1', x: 0, y: 6, w: 4, h: 4, minW: 3, minH: 3 },
  { i: 'notifications-1', x: 4, y: 6, w: 4, h: 4, minW: 3, minH: 3 },
  { i: 'tasks-1', x: 8, y: 6, w: 4, h: 4, minW: 3, minH: 3 },
]

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    widgets: [...defaultWidgets] as Widget[],
    layouts: [...defaultLayouts] as DashboardLayout[],
    isEditing: false,
    lastRefresh: null as Date | null,
  }),

  getters: {
    hasWidgets: (state) => state.widgets.length > 0,

    getWidgetById: (state) => (id: string) => {
      return state.widgets.find((w) => w.id === id)
    },

    getLayoutById: (state) => (id: string) => {
      return state.layouts.find((l) => l.i === id)
    },
  },

  actions: {
    setIsEditing(value: boolean) {
      this.isEditing = value
    },

    setLayouts(layouts: DashboardLayout[]) {
      this.layouts = layouts
    },

    addWidget(type: WidgetType, title: string) {
      const id = `${type}-${Date.now()}`
      const widget: Widget = { id, type, title }

      // 计算新部件位置
      const maxY = Math.max(...this.layouts.map((l) => l.y + l.h), 0)
      const layout: DashboardLayout = {
        i: id,
        x: 0,
        y: maxY,
        w: 4,
        h: 4,
        minW: 2,
        minH: 2,
      }

      this.widgets.push(widget)
      this.layouts.push(layout)
    },

    removeWidget(id: string) {
      this.widgets = this.widgets.filter((w) => w.id !== id)
      this.layouts = this.layouts.filter((l) => l.i !== id)
    },

    resetToDefault() {
      this.widgets = [...defaultWidgets]
      this.layouts = [...defaultLayouts]
    },

    updateLastRefresh() {
      this.lastRefresh = new Date()
    },
  },

  persist: true,
})
