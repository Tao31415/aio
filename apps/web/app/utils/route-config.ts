export interface AppRouteConfig {
  key: string
  path: string
  title: string
  description?: string
  icon?: string
  showInSidebar?: boolean
  children?: AppRouteConfig[]
}

export const APP_ROUTE_TREE: AppRouteConfig[] = [
  {
    key: 'home',
    path: '/',
    title: '仪表板',
    description: '系统概览与核心数据看板',
    icon: 'i-lucide-house',
  },
  {
    key: 'monitor',
    path: '/home',
    title: '主页',
    description: '设备监控与数据查看',
    icon: 'i-lucide-monitor',
  },
  {
    key: 'dashboard',
    path: '/dashboard',
    title: '仪表板',
    description: '系统概览与核心数据看板',
    icon: 'i-lucide-layout-dashboard',
    showInSidebar: true,
  },
  {
    key: 'users',
    path: '/users',
    title: '用户管理',
    description: '管理系统中的所有用户账户',
    icon: 'i-lucide-users',
    showInSidebar: true,
  },
  {
    key: 'messages',
    path: '/messages',
    title: '消息中心',
    description: '查看会话消息与沟通记录',
    icon: 'i-lucide-messages-square',
    showInSidebar: false,
  },
  {
    key: 'analytics',
    path: '/analytics',
    title: '数据分析',
    description: '查看系统运营数据和统计报表',
    icon: 'i-lucide-chart-column',
    showInSidebar: true,
  },
  {
    key: 'device',
    path: '/device',
    title: '设备管理',
    description: '管理监测设备和测点',
    icon: 'i-lucide-hard-drive',
    showInSidebar: true,
  },
  {
    key: 'settings',
    path: '/settings',
    title: '系统设置',
    description: '管理您的账户和系统偏好设置',
    icon: 'i-lucide-settings',
    showInSidebar: true,
  },
  {
    key: 'login',
    path: '/login',
    title: '登录',
    description: '登录您的账户',
    icon: 'i-lucide-log-in',
  },
]

function flattenRoutes(routes: AppRouteConfig[]): AppRouteConfig[] {
  return routes.flatMap((route) => [
    route,
    ...flattenRoutes(route.children || []),
  ])
}

export const APP_ROUTE_LIST = flattenRoutes(APP_ROUTE_TREE)

export const APP_ROUTE_MAP: Record<string, AppRouteConfig> = Object.fromEntries(
  APP_ROUTE_LIST.map((route) => [route.path, route])
)

export const SETTINGS_ROUTE = APP_ROUTE_MAP['/settings']

export const SETTINGS_ROUTE_CONFIG =
  SETTINGS_ROUTE?.children?.reduce<Record<string, AppRouteConfig>>(
    (acc, child) => {
      const normalizedKey = child.key.replace('settings-', '')
      acc[normalizedKey] = child
      return acc
    },
    {}
  ) || {}

export function getAppRoute(path: string) {
  return APP_ROUTE_MAP[path]
}

export function getAppRouteTitle(path: string) {
  return getAppRoute(path)?.title || '页面'
}

export function getAppRouteChildren(path: string) {
  return getAppRoute(path)?.children || []
}

export function getSidebarRoutes() {
  return APP_ROUTE_TREE.filter((route) => route.showInSidebar)
}
