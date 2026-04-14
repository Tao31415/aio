/**
 * WebSocket composables
 * Provides easy access to WebSocket functionality
 */

import type { Notification } from '~/plugins/websocket.client'

export function useWebSocket() {
  const { $ws } = useNuxtApp()
  return $ws
}

// 实时通知 Hook
export function useRealtimeNotifications(
  onNotification?: (notification: Notification) => void
) {
  const { $ws } = useNuxtApp()

  watch(
    () => $ws.lastMessage.value,
    (message) => {
      if (message && onNotification) {
        onNotification(message)
      }
    }
  )

  return {
    status: $ws.status,
    lastMessage: $ws.lastMessage,
    notifications: $ws.notifications,
  }
}
