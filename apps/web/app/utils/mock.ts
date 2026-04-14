/**
 * Mock 数据设置
 * 客户端 fetch 拦截器
 */

import Mock from 'mockjs'

const Random = Mock.Random

// 用户角色定义
const roles = [
  { id: 'admin', name: 'admin', label: '超级管理员', permissions: ['*'] },
  {
    id: 'manager',
    name: 'manager',
    label: '管理员',
    permissions: ['dashboard:view', 'users:view', 'users:edit'],
  },
  {
    id: 'editor',
    name: 'editor',
    label: '编辑',
    permissions: ['dashboard:view', 'content:view', 'content:edit'],
  },
  {
    id: 'viewer',
    name: 'viewer',
    label: '访客',
    permissions: ['dashboard:view'],
  },
]

// 用户状态
const userStatuses = ['active', 'inactive', 'suspended']

// 部门列表
const departments = [
  '技术部',
  '产品部',
  '运营部',
  '市场部',
  '财务部',
  '人力资源部',
]

// 职位列表
const positions = ['工程师', '高级工程师', '技术专家', '经理', '总监', '副总裁']

// 生成用户列表
function generateUsers(count = 30) {
  return Array.from({ length: count }, () => ({
    id: Random.guid(),
    name: Random.cname(),
    email: Random.email('halolight.dev'),
    phone: `1${Random.pick(['3', '5', '7', '8', '9'])}${Random.string('number', 9)}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Random.word()}`,
    role: Random.pick(roles),
    status: Random.pick(userStatuses),
    department: Random.pick(departments),
    position: Random.pick(positions),
    bio: Random.cparagraph(1, 3),
    createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
    lastLoginAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
  }))
}

// 生成仪表板统计数据
function generateDashboardStats() {
  return {
    totalUsers: Random.integer(1000, 10000),
    activeUsers: Random.integer(500, 5000),
    totalOrders: Random.integer(5000, 50000),
    revenue: Random.integer(100000, 1000000),
    growthRate: Random.float(0, 30, 2, 2),
    conversionRate: Random.float(1, 10, 2, 2),
  }
}

// 生成图表数据
function generateChartData(days = 7) {
  const labels = []
  const data = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
    data.push(Random.integer(100, 1000))
  }

  return { labels, data }
}

// 生成通知列表
function generateNotifications(count = 10) {
  const types = ['info', 'success', 'warning', 'error']
  const titles = [
    '系统更新通知',
    '新用户注册',
    '订单支付成功',
    '安全警告',
    '任务完成提醒',
    '消息提醒',
  ]

  return Array.from({ length: count }, () => ({
    id: Random.guid(),
    type: Random.pick(types),
    title: Random.pick(titles),
    content: Random.csentence(10, 30),
    read: Random.boolean(),
    createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
  }))
}

// 生成消息列表
function generateMessages(count = 20) {
  return Array.from({ length: count }, () => ({
    id: Random.guid(),
    sender: {
      id: Random.guid(),
      name: Random.cname(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Random.word()}`,
    },
    content: Random.cparagraph(1, 3),
    read: Random.boolean(),
    createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
  }))
}

// 生成日历事件
function generateCalendarEvents(count = 15) {
  const eventTypes = ['meeting', 'task', 'reminder', 'event']
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return Array.from({ length: count }, () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + Random.integer(-15, 15))
    startDate.setHours(Random.integer(8, 18))
    startDate.setMinutes(Random.pick([0, 15, 30, 45]))

    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + Random.integer(1, 3))

    return {
      id: Random.guid(),
      title: Random.ctitle(3, 10),
      type: Random.pick(eventTypes),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      color: Random.pick(colors),
      description: Random.csentence(10, 30),
    }
  })
}

// 生成文件列表
function generateFiles(count = 20) {
  const fileTypes = ['pdf', 'doc', 'xlsx', 'pptx', 'jpg', 'png', 'zip', 'mp4']
  const folders = ['文档', '图片', '视频', '压缩包', '其他']

  return Array.from({ length: count }, () => {
    const type = Random.pick(fileTypes)
    return {
      id: Random.guid(),
      name: `${Random.word(5, 15)}.${type}`,
      type,
      size: Random.integer(1024, 1024 * 1024 * 100),
      folder: Random.pick(folders),
      uploadedBy: {
        id: Random.guid(),
        name: Random.cname(),
      },
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updatedAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
    }
  })
}

// Mock 路由处理器
const mockRoutes: Record<string, () => unknown> = {
  // 用户相关
  'GET /api/users': () => {
    const users = generateUsers(30)
    return {
      code: 200,
      message: 'success',
      data: {
        list: users,
        total: users.length,
        page: 1,
        pageSize: 10,
      },
    }
  },

  'GET /api/users/:id': () => {
    const users = generateUsers(1)
    return {
      code: 200,
      message: 'success',
      data: users[0],
    }
  },

  // 仪表板相关
  'GET /api/dashboard/stats': () => {
    return {
      code: 200,
      message: 'success',
      data: generateDashboardStats(),
    }
  },

  'GET /api/dashboard/chart': () => {
    return {
      code: 200,
      message: 'success',
      data: generateChartData(7),
    }
  },

  'GET /api/dashboard/recent-users': () => {
    const users = generateUsers(5)
    return {
      code: 200,
      message: 'success',
      data: users,
    }
  },

  // 通知相关
  'GET /api/notifications': () => {
    const notifications = generateNotifications(10)
    return {
      code: 200,
      message: 'success',
      data: {
        list: notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      },
    }
  },

  // 消息相关
  'GET /api/messages': () => {
    const messages = generateMessages(20)
    return {
      code: 200,
      message: 'success',
      data: {
        list: messages,
        total: messages.length,
      },
    }
  },

  // 日历相关
  'GET /api/calendar/events': () => {
    return {
      code: 200,
      message: 'success',
      data: generateCalendarEvents(15),
    }
  },

  // 文件相关
  'GET /api/files': () => {
    const files = generateFiles(20)
    return {
      code: 200,
      message: 'success',
      data: {
        list: files,
        total: files.length,
      },
    }
  },
}

// 匹配路由
function matchRoute(method: string, url: string): (() => unknown) | null {
  const routeKey = `${method} ${url.split('?')[0]}`

  // 精确匹配
  if (mockRoutes[routeKey]) {
    return mockRoutes[routeKey]
  }

  // 动态路由匹配
  for (const key of Object.keys(mockRoutes)) {
    const [routeMethod, routePath] = key.split(' ')
    if (routeMethod !== method) continue

    const routeParts = routePath.split('/')
    const urlParts = url.split('?')[0].split('/')

    if (routeParts.length !== urlParts.length) continue

    let match = true
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) continue
      if (routeParts[i] !== urlParts[i]) {
        match = false
        break
      }
    }

    if (match) {
      return mockRoutes[key]
    }
  }

  return null
}

// 设置 Mock
export function setupMock() {
  if (typeof window === 'undefined') return

  // 保存原始 fetch
  const originalFetch = window.fetch

  // 替换 fetch
  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url
    const method = init?.method?.toUpperCase() || 'GET'

    // 只拦截 /api 开头的请求
    if (url.startsWith('/api')) {
      const handler = matchRoute(method, url)

      if (handler) {
        // 模拟网络延迟
        await new Promise((resolve) =>
          setTimeout(resolve, Random.integer(100, 300))
        )

        const data = handler()
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // 非 mock 请求使用原始 fetch
    return originalFetch(input, init)
  }

  // Mock 数据服务已启动
}

// 导出生成器函数供其他模块使用
export {
  generateUsers,
  generateDashboardStats,
  generateChartData,
  generateNotifications,
  generateMessages,
  generateCalendarEvents,
  generateFiles,
}
