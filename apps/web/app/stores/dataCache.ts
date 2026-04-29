/**
 * 数据页面缓存 store
 * 在 KeepAlive 场景下保存子页面的查询结果，防止组件状态丢失
 */

import { sub } from 'date-fns'
import type { MeasurementPoint } from '~/stores/device'

export interface TunnelMonitoringData {
  timestamp: string
  sn: string
  ringNumber: string
  p1x: number | null
  p1y: number | null
  p7x: number | null
  p7y: number | null
  p3x: number | null
  p3y: number | null
  p5x: number | null
  p5y: number | null
  p9x: number | null
  p9y: number | null
  coc: number | null
  hc: number | null
  sd: number | null
}

interface DisplacementCache {
  startDatetime: string
  endDatetime: string
  selectedPoint: string
  monitoringData: TunnelMonitoringData[]
  pagination: { page: number; pageSize: number; total: number }
  hasSearched: boolean
}

interface PhotoCacheItem {
  id: string
  name: string
  url: string
  time: string
  raw: unknown
}

interface PhotoCache {
  startDate: Date
  endDate: Date
  photos: PhotoCacheItem[]
  hasSearched: boolean
}

export const useDataCacheStore = defineStore('dataCache', {
  state: () => ({
    displacement: new Map<string, DisplacementCache>(),
    photo: new Map<string, PhotoCache>(),
  }),

  actions: {
    // === 位移数据 ===
    getDisplacement(deviceId: string): DisplacementCache | undefined {
      return this.displacement.get(deviceId)
    },

    setDisplacement(deviceId: string, data: DisplacementCache) {
      this.displacement.set(deviceId, data)
    },

    clearDisplacement(deviceId: string) {
      this.displacement.delete(deviceId)
    },

    // === 照片数据 ===
    getPhoto(deviceId: string): PhotoCache | undefined {
      return this.photo.get(deviceId)
    },

    setPhoto(deviceId: string, data: PhotoCache) {
      this.photo.set(deviceId, data)
    },

    clearPhoto(deviceId: string) {
      this.photo.delete(deviceId)
    },

    // === 清除设备所有缓存 ===
    clearDevice(deviceId: string) {
      this.displacement.delete(deviceId)
      this.photo.delete(deviceId)
    },
  },
})
