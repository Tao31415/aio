import { defineStore } from 'pinia'
import type { RuntimeConfig } from '@nuxt/schema'

export interface DashboardStats {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  warningDevices: number
  alarmDevices: number
  normalDevices: number
}

export interface DeviceStatusInfo {
  deviceId: string
  deviceName: string
  deviceCode: string
  isOnline: boolean
  alertStatus: 'normal' | 'warning' | 'alarm'
  lastSeenAt: string | null
  lastCheckedAt: string | null
  dataCount1h: number
  avgHorizontal: number | null
  avgVertical: number | null
  stdHorizontal: number | null
  stdVertical: number | null
  maxHorizontal: number | null
  maxVertical: number | null
  minHorizontal: number | null
  minVertical: number | null
}

export const useDeviceStatsStore = defineStore('device-stats', () => {
  const config = useRuntimeConfig()
  const API_BASE = config.public.apiBase

  const stats = ref({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    warningDevices: 0,
    alarmDevices: 0,
    normalDevices: 0,
  })

  const deviceStatusList = ref<DeviceStatusInfo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastRefresh = ref<Date | null>(null)

  let refreshInterval: ReturnType<typeof setInterval> | null = null

  async function fetchDashboardStats() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<DashboardStats>(
        `${API_BASE}/api/v1/statistics/dashboard`
      )
      stats.value = response
      lastRefresh.value = new Date()
    } catch (err) {
      error.value = '获取统计数据失败'
      console.error('Failed to fetch dashboard stats:', err)
      console.error('API_BASE:', API_BASE)
    } finally {
      loading.value = false
    }
  }

  async function fetchDeviceStatusList() {
    try {
      const response = await $fetch<DeviceStatusInfo[]>(
        `${API_BASE}/api/v1/statistics/device-status`
      )
      deviceStatusList.value = response.map((item: any) => ({
        deviceId: item.deviceId,
        deviceName: item.device?.name || '未知设备',
        deviceCode: item.device?.code || '',
        isOnline: item.isOnline,
        alertStatus: item.alertStatus,
        lastSeenAt: item.lastSeenAt,
        lastCheckedAt: item.lastCheckedAt,
        dataCount1h: item.dataCount1h,
        avgHorizontal: item.avgHorizontal,
        avgVertical: item.avgVertical,
        stdHorizontal: item.stdHorizontal,
        stdVertical: item.stdVertical,
        maxHorizontal: item.maxHorizontal,
        maxVertical: item.maxVertical,
        minHorizontal: item.minHorizontal,
        minVertical: item.minVertical,
      }))
    } catch (err) {
      console.error('Failed to fetch device status list:', err)
      console.error('API_BASE:', API_BASE)
    }
  }

  function startAutoRefresh(intervalMs: number = 30000) {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }

    refreshInterval = setInterval(() => {
      fetchDashboardStats()
    }, intervalMs)
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  function $reset() {
    stats.value = {
      totalDevices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      warningDevices: 0,
      alarmDevices: 0,
      normalDevices: 0,
    }
    deviceStatusList.value = []
    error.value = null
    lastRefresh.value = null
    stopAutoRefresh()
  }

  return {
    stats,
    deviceStatusList,
    loading,
    error,
    lastRefresh,
    fetchDashboardStats,
    fetchDeviceStatusList,
    startAutoRefresh,
    stopAutoRefresh,
    $reset,
  }
})
