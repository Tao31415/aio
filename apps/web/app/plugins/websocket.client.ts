/**
 * WebSocket 客户端插件
 * Matches Next.js websocket-provider.tsx implementation
 */

export interface Notification {
  id: string
  type: 'user' | 'system' | 'task' | 'alert'
  title: string
  content: string
  read: boolean
  createdAt: string
  link?: string
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

// Mock WebSocket 实现（模拟实时通知）
class MockWebSocket {
  private callbacks: {
    onOpen?: () => void
    onMessage?: (data: Notification) => void
    onClose?: () => void
    onError?: (error: Error) => void
  } = {}
  private interval: NodeJS.Timeout | null = null
  private isConnected = false

  connect() {
    // 模拟连接延迟
    setTimeout(() => {
      this.isConnected = true
      this.callbacks.onOpen?.()
      this.startMockMessages()
    }, 1000)
  }

  private startMockMessages() {
    // 随机发送模拟通知
    this.interval = setInterval(() => {
      if (!this.isConnected) return

      // 20% 概率发送新通知
      if (Math.random() < 0.2) {
        const mockNotifications: Notification[] = [
          {
            id: `ws-${Date.now()}`,
            type: 'user',
            title: '新用户注册',
            content: `用户 ${['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)]} 刚刚完成注册`,
            read: false,
            createdAt: new Date().toISOString(),
            link: '/users',
          },
          {
            id: `ws-${Date.now()}`,
            type: 'system',
            title: '系统通知',
            content: '数据备份已完成',
            read: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: `ws-${Date.now()}`,
            type: 'task',
            title: '任务更新',
            content: '您有一个新任务待处理',
            read: false,
            createdAt: new Date().toISOString(),
            link: '/tasks',
          },
          {
            id: `ws-${Date.now()}`,
            type: 'alert',
            title: '安全提醒',
            content: '检测到异常登录尝试',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ]

        const randomNotification =
          mockNotifications[
            Math.floor(Math.random() * mockNotifications.length)
          ]
        this.callbacks.onMessage?.(randomNotification)
      }
    }, 10000) // 每10秒检查一次
  }

  onOpen(callback: () => void) {
    this.callbacks.onOpen = callback
  }

  onMessage(callback: (data: Notification) => void) {
    this.callbacks.onMessage = callback
  }

  onClose(callback: () => void) {
    this.callbacks.onClose = callback
  }

  onError(callback: (error: Error) => void) {
    this.callbacks.onError = callback
  }

  send(data: unknown) {
    console.log('WebSocket send:', data)
  }

  close() {
    this.isConnected = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.callbacks.onClose?.()
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const notifications = useState<Notification[]>('ws-notifications', () => [])
  const status = useState<ConnectionStatus>('ws-status', () => 'disconnected')
  const lastMessage = useState<Notification | null>(
    'ws-last-message',
    () => null
  )

  let socket: MockWebSocket | null = null
  const _ = nuxtApp.$config.public.wsUrl || 'wss://echo.websocket.events'

  function connect() {
    if (socket) return
    status.value = 'connecting'
    socket = new MockWebSocket()

    socket.onOpen(() => {
      status.value = 'connected'
      socket?.send(JSON.stringify({ type: 'hello', ts: Date.now() }))
    })

    socket.onMessage((notification) => {
      lastMessage.value = notification
      // 添加到通知列表
      notifications.value.unshift(notification)
      // 限制通知列表长度
      if (notifications.value.length > 50) {
        notifications.value = notifications.value.slice(0, 50)
      }
    })

    socket.onClose(() => {
      status.value = 'disconnected'
      socket = null
      // 重连机制（3秒后重试）
      setTimeout(connect, 3000)
    })

    socket.onError(() => {
      status.value = 'error'
    })

    socket.connect()
  }

  // 自动连接（仅客户端）
  if (import.meta.client) {
    connect()

    // 清理 - 使用 window beforeunload 事件而非 nuxt hook
    window.addEventListener('beforeunload', () => {
      socket?.close()
    })
  }

  // 提供 WebSocket 接口
  return {
    provide: {
      ws: {
        status,
        notifications,
        lastMessage,
        send: (message: unknown) => socket?.send(message),
        reconnect: connect,
      },
    },
  }
})
