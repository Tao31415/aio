/**
 * 工具函数集合
 */

/**
 * 合并类名（简化版）
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * 生成随机 ID
 */
export function generateId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, length + 2)
}

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | string | number,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array)
    return obj.map((item) => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  return obj
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

/**
 * 获取文件类型图标
 */
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase()
  const iconMap: Record<string, string> = {
    // 文档
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📽️',
    pptx: '📽️',
    txt: '📃',
    // 图片
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    // 视频
    mp4: '🎬',
    avi: '🎬',
    mov: '🎬',
    // 音频
    mp3: '🎵',
    wav: '🎵',
    // 压缩包
    zip: '📦',
    rar: '📦',
    '7z': '📦',
    // 代码
    js: '💻',
    ts: '💻',
    py: '💻',
    java: '💻',
    cpp: '💻',
    html: '🌐',
    css: '🎨',
  }
  return iconMap[ext] || '📎'
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 生成随机字符串
 */
export function randomString(
  length: number,
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 驼峰转连字符
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 连字符转驼峰
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 安全地解析 JSON
 */
export function safeJsonParse<T = unknown>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

/**
 * 安全地执行函数
 */
export function safeExec<T>(fn: () => T, defaultValue: T): T {
  try {
    return fn()
  } catch {
    return defaultValue
  }
}

/**
 * 等待指定时间
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 生成 UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 数组分组
 */
export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : String(item[key])
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

/**
 * 数组去重
 */
export function uniqueBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): T[] {
  const seen = new Set<string>()
  return array.filter((item) => {
    const itemKey = typeof key === 'function' ? key(item) : String(item[key])
    if (seen.has(itemKey)) {
      return false
    }
    seen.add(itemKey)
    return true
  })
}

/**
 * 获取嵌套对象值
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: unknown
): unknown {
  return (
    path.split('.').reduce(
      (acc: Record<string, unknown> | undefined, key) => {
        return acc && typeof acc === 'object'
          ? (acc[key] as Record<string, unknown> | undefined)
          : undefined
      },
      obj as Record<string, unknown> | undefined
    ) ?? defaultValue
  )
}

/**
 * 设置嵌套对象值
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((acc: Record<string, unknown>, key) => {
    if (!acc[key]) acc[key] = {}
    return acc[key] as Record<string, unknown>
  }, obj)
  target[lastKey] = value
}

/**
 * 颜色工具
 */
export const colorUtils = {
  /**
   * 生成随机颜色
   */
  randomColor(): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  },

  /**
   * 判断颜色是否为深色
   */
  isDarkColor(color: string): boolean {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
  },

  /**
   * 获取对比色
   */
  getContrastColor(color: string): string {
    return this.isDarkColor(color) ? '#FFFFFF' : '#000000'
  },
}

/**
 * 时间工具
 */
export const timeUtils = {
  /**
   * 获取相对时间
   */
  timeAgo(date: Date | string | number): string {
    const now = new Date()
    const target = new Date(date)
    const diff = now.getTime() - target.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(months / 12)

    if (years > 0) return `${years}年前`
    if (months > 0) return `${months}个月前`
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  },

  /**
   * 格式化持续时间
   */
  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}天${hours % 24}小时`
    if (hours > 0) return `${hours}小时${minutes % 60}分钟`
    if (minutes > 0) return `${minutes}分钟${seconds % 60}秒`
    return `${seconds}秒`
  },

  /**
   * 等待指定时间
   */
  async waitUntil(targetTime: Date | number): Promise<void> {
    const target = new Date(targetTime).getTime()
    const now = Date.now()
    if (target > now) {
      await sleep(target - now)
    }
  },
}

/**
 * 验证工具
 */
export const validationUtils = {
  /**
   * 验证邮箱
   */
  email: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },

  /**
   * 验证手机号
   */
  phone: (phone: string): boolean => {
    return /^1[3-9]\d{9}$/.test(phone)
  },

  /**
   * 验证密码强度
   */
  passwordStrength: (password: string): { score: number; level: string } => {
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    const levels = ['很弱', '弱', '一般', '强', '很强']
    return {
      score,
      level: levels[score] || '很弱',
    }
  },

  /**
   * 验证 URL
   */
  url: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
}

/**
 * 本地存储工具
 */
export const storageUtils = {
  /**
   * 设置本地存储
   */
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to set localStorage:', error)
    }
  },

  /**
   * 获取本地存储
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn('Failed to get localStorage:', error)
      return defaultValue
    }
  },

  /**
   * 删除本地存储
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove localStorage:', error)
    }
  },

  /**
   * 清空本地存储
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  },
}

// 默认导出
export default {
  cn,
  generateId,
  formatDate,
  formatFileSize,
  deepClone,
  debounce,
  throttle,
  getFileExtension,
  getFileIcon,
  isValidEmail,
  isValidPhone,
  randomString,
  capitalize,
  camelToKebab,
  kebabToCamel,
  safeJsonParse,
  safeExec,
  sleep,
  generateUUID,
  groupBy,
  uniqueBy,
  getNestedValue,
  setNestedValue,
  colorUtils,
  timeUtils,
  validationUtils,
  storageUtils,
}
