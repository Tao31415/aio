/**
 * Toast 通知组合式函数
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

// 全局 toast 状态
const toasts = ref<Toast[]>([])

export function useToast() {
  // 添加 toast
  function addToast(toast: Omit<Toast, 'id'>) {
    const id = generateId()
    const newToast: Toast = {
      id,
      duration: 3000,
      ...toast,
    }
    toasts.value.push(newToast)

    // 自动移除
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  // 移除 toast
  function removeToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  // 清除所有 toast
  function clearToasts() {
    toasts.value = []
  }

  // 快捷方法
  function success(message: string, title?: string) {
    return addToast({ type: 'success', message, title })
  }

  function error(message: string, title?: string) {
    return addToast({ type: 'error', message, title })
  }

  function warning(message: string, title?: string) {
    return addToast({ type: 'warning', message, title })
  }

  function info(message: string, title?: string) {
    return addToast({ type: 'info', message, title })
  }

  // 通用显示方法（别名）
  function showToast(
    message: string,
    type: ToastType = 'info',
    title?: string
  ) {
    return addToast({ type, message, title })
  }

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearToasts,
    showToast,
    success,
    error,
    warning,
    info,
  }
}
