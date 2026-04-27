import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull, Not } from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { PinoLogger } from 'nestjs-pino'
import { DeviceStatus, AlertStatus } from './entities/device-status.entity'
import { Device } from './entities/device.entity'
import { MeasurementPoint } from './entities/measurement-point.entity'
import { TunnelMonitoringService } from '../middleware/mqtt/tunnel-monitoring.service'

export interface StatisticsFeatures {
  count: number
  avgHorizontal: number | null
  avgVertical: number | null
  stdHorizontal: number | null
  stdVertical: number | null
  maxHorizontal: number | null
  maxVertical: number | null
  minHorizontal: number | null
  minVertical: number | null
}

export interface AlertCheckResult {
  alertStatus: AlertStatus
  hasWarning: boolean
  hasAlarm: boolean
  warningDetails: string[]
  alarmDetails: string[]
}

export interface DashboardStats {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  warningDevices: number
  alarmDevices: number
  normalDevices: number
}

@Injectable()
export class DeviceStatusService {
  constructor(
    @InjectRepository(DeviceStatus)
    private readonly deviceStatusRepository: Repository<DeviceStatus>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(MeasurementPoint)
    private readonly measurementPointRepository: Repository<MeasurementPoint>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly tunnelMonitoringService: TunnelMonitoringService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(DeviceStatusService.name)
  }

  async initializeDeviceStatus(deviceId: string): Promise<DeviceStatus> {
    let status = await this.deviceStatusRepository.findOne({
      where: { deviceId },
    })

    if (!status) {
      status = this.deviceStatusRepository.create({
        deviceId,
        isOnline: false,
        alertStatus: AlertStatus.NORMAL,
        lastSeenAt: null,
        lastCheckedAt: null,
        dataCount1h: 0,
      })
      await this.deviceStatusRepository.save(status)
      this.logger.info({ deviceId }, 'DeviceStatus initialized')
    }

    return status
  }

  async updateDeviceStatus(
    deviceId: string,
    deviceCode: string
  ): Promise<DeviceStatus> {
    await this.initializeDeviceStatus(deviceId)

    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 60 * 60 * 1000)

    const statistics = await this.calculateStatisticsBySn(
      deviceCode,
      startTime,
      endTime
    )
    const latestData =
      await this.tunnelMonitoringService.findLatestBySn(deviceCode)

    const isOnline = latestData
      ? (endTime.getTime() - latestData.timestamp.getTime()) / (1000 * 60) <= 5
      : false

    const alertResult = await this.checkAlertStatus(deviceId, statistics)

    await this.deviceStatusRepository.update(deviceId, {
      lastSeenAt: latestData?.timestamp || null,
      isOnline,
      alertStatus: alertResult.alertStatus,
      lastCheckedAt: endTime,
      dataCount1h: statistics.count,
      avgHorizontal: statistics.avgHorizontal,
      avgVertical: statistics.avgVertical,
      stdHorizontal: statistics.stdHorizontal,
      stdVertical: statistics.stdVertical,
      maxHorizontal: statistics.maxHorizontal,
      maxVertical: statistics.maxVertical,
      minHorizontal: statistics.minHorizontal,
      minVertical: statistics.minVertical,
    })

    const updatedStatus = await this.deviceStatusRepository.findOne({
      where: { deviceId },
    })

    if (alertResult.hasAlarm) {
      this.logger.warn(
        {
          deviceId,
          deviceCode,
          alertDetails: alertResult.alarmDetails,
          statistics,
        },
        'ALARM: Device triggered alarm status'
      )
    } else if (alertResult.hasWarning) {
      this.logger.warn(
        {
          deviceId,
          deviceCode,
          warningDetails: alertResult.warningDetails,
          statistics,
        },
        'WARNING: Device triggered warning status'
      )
    }

    return updatedStatus!
  }

  async calculateStatisticsBySn(
    sn: string,
    startTime: Date,
    endTime: Date
  ): Promise<StatisticsFeatures> {
    const query = `
      SELECT 
        COUNT(*)::integer as count,
        AVG(GREATEST(ABS(p1x), ABS(p7x), ABS(p3x), ABS(p5x), ABS(p9x)))::numeric as avg_horizontal,
        AVG(GREATEST(ABS(p1y), ABS(p7y), ABS(p3y), ABS(p5y), ABS(p9y), ABS(sd)))::numeric as avg_vertical,
        STDDEV(GREATEST(ABS(p1x), ABS(p7x), ABS(p3x), ABS(p5x), ABS(p9x)))::numeric as std_horizontal,
        STDDEV(GREATEST(ABS(p1y), ABS(p7y), ABS(p3y), ABS(p5y), ABS(p9y), ABS(sd)))::numeric as std_vertical,
        MAX(GREATEST(ABS(p1x), ABS(p7x), ABS(p3x), ABS(p5x), ABS(p9x)))::numeric as max_horizontal,
        MAX(GREATEST(ABS(p1y), ABS(p7y), ABS(p3y), ABS(p5y), ABS(p9y), ABS(sd)))::numeric as max_vertical,
        MIN(GREATEST(ABS(p1x), ABS(p7x), ABS(p3x), ABS(p5x), ABS(p9x)))::numeric as min_horizontal,
        MIN(GREATEST(ABS(p1y), ABS(p7y), ABS(p3y), ABS(p5y), ABS(p9y), ABS(sd)))::numeric as min_vertical
      FROM tunnel_monitoring_data 
      WHERE sn = $1 
        AND timestamp >= $2 
        AND timestamp <= $3
    `

    try {
      const result = await this.dataSource.query(query, [
        sn,
        startTime,
        endTime,
      ])

      if (!result[0] || result[0].count === 0) {
        return {
          count: 0,
          avgHorizontal: null,
          avgVertical: null,
          stdHorizontal: null,
          stdVertical: null,
          maxHorizontal: null,
          maxVertical: null,
          minHorizontal: null,
          minVertical: null,
        }
      }

      const row = result[0]
      return {
        count: row.count,
        avgHorizontal:
          row.avg_horizontal !== null ? parseFloat(row.avg_horizontal) : null,
        avgVertical:
          row.avg_vertical !== null ? parseFloat(row.avg_vertical) : null,
        stdHorizontal:
          row.std_horizontal !== null ? parseFloat(row.std_horizontal) : null,
        stdVertical:
          row.std_vertical !== null ? parseFloat(row.std_vertical) : null,
        maxHorizontal:
          row.max_horizontal !== null ? parseFloat(row.max_horizontal) : null,
        maxVertical:
          row.max_vertical !== null ? parseFloat(row.max_vertical) : null,
        minHorizontal:
          row.min_horizontal !== null ? parseFloat(row.min_horizontal) : null,
        minVertical:
          row.min_vertical !== null ? parseFloat(row.min_vertical) : null,
      }
    } catch (error) {
      this.logger.error(
        { error, sn, startTime, endTime },
        'Failed to calculate statistics'
      )
      return {
        count: 0,
        avgHorizontal: null,
        avgVertical: null,
        stdHorizontal: null,
        stdVertical: null,
        maxHorizontal: null,
        maxVertical: null,
        minHorizontal: null,
        minVertical: null,
      }
    }
  }

  async checkAlertStatus(
    deviceId: string,
    statistics: StatisticsFeatures
  ): Promise<AlertCheckResult> {
    const measurementPoints = await this.measurementPointRepository.find({
      where: { deviceId },
    })

    if (measurementPoints.length === 0 || statistics.count === 0) {
      return {
        alertStatus: AlertStatus.NORMAL,
        hasWarning: false,
        hasAlarm: false,
        warningDetails: [],
        alarmDetails: [],
      }
    }

    const result: AlertCheckResult = {
      alertStatus: AlertStatus.NORMAL,
      hasWarning: false,
      hasAlarm: false,
      warningDetails: [],
      alarmDetails: [],
    }

    const avgHorizontal = statistics.avgHorizontal ?? 0
    const avgVertical = statistics.avgVertical ?? 0
    const stdHorizontal = statistics.stdHorizontal ?? 0
    const stdVertical = statistics.stdVertical ?? 0
    const maxHorizontal = statistics.maxHorizontal ?? 0
    const maxVertical = statistics.maxVertical ?? 0

    for (const point of measurementPoints) {
      const thresholds = {
        warningHorizontal: point.warningThresholdHorizontal ?? null,
        warningVertical: point.warningThresholdVertical ?? null,
        alarmHorizontal: point.alarmThresholdHorizontal ?? null,
        alarmVertical: point.alarmThresholdVertical ?? null,
      }

      if (
        thresholds.alarmHorizontal !== null &&
        (maxHorizontal > thresholds.alarmHorizontal ||
          avgHorizontal + 2 * stdHorizontal > thresholds.alarmHorizontal)
      ) {
        result.hasAlarm = true
        result.alarmDetails.push(
          `环号${point.ringNumber || '未知'}: 水平位移最大值${maxHorizontal.toFixed(2)}mm超过报警阈值${thresholds.alarmHorizontal}mm`
        )
      }

      if (
        thresholds.alarmVertical !== null &&
        (maxVertical > thresholds.alarmVertical ||
          avgVertical + 2 * stdVertical > thresholds.alarmVertical)
      ) {
        result.hasAlarm = true
        result.alarmDetails.push(
          `环号${point.ringNumber || '未知'}: 垂直位移最大值${maxVertical.toFixed(2)}mm超过报警阈值${thresholds.alarmVertical}mm`
        )
      }

      if (
        !result.hasAlarm &&
        thresholds.warningHorizontal !== null &&
        (maxHorizontal > thresholds.warningHorizontal ||
          avgHorizontal + 2 * stdHorizontal > thresholds.warningHorizontal)
      ) {
        result.hasWarning = true
        result.warningDetails.push(
          `环号${point.ringNumber || '未知'}: 水平位移最大值${maxHorizontal.toFixed(2)}mm超过预警阈值${thresholds.warningHorizontal}mm`
        )
      }

      if (
        !result.hasAlarm &&
        thresholds.warningVertical !== null &&
        (maxVertical > thresholds.warningVertical ||
          avgVertical + 2 * stdVertical > thresholds.warningVertical)
      ) {
        result.hasWarning = true
        result.warningDetails.push(
          `环号${point.ringNumber || '未知'}: 垂直位移最大值${maxVertical.toFixed(2)}mm超过预警阈值${thresholds.warningVertical}mm`
        )
      }
    }

    if (result.hasAlarm) {
      result.alertStatus = AlertStatus.ALARM
    } else if (result.hasWarning) {
      result.alertStatus = AlertStatus.WARNING
    }

    return result
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const result = await this.deviceStatusRepository
      .createQueryBuilder('ds')
      .select([
        'COUNT(*) as total',
        'SUM(CASE WHEN ds.isOnline = true THEN 1 ELSE 0 END)::integer as online',
        'SUM(CASE WHEN ds.isOnline = false THEN 1 ELSE 0 END)::integer as offline',
        'SUM(CASE WHEN ds.alertStatus = :warning THEN 1 ELSE 0 END)::integer as warning',
        'SUM(CASE WHEN ds.alertStatus = :alarm THEN 1 ELSE 0 END)::integer as alarm',
        'SUM(CASE WHEN ds.alertStatus = :normal THEN 1 ELSE 0 END)::integer as normal',
      ])
      .setParameters({
        warning: AlertStatus.WARNING,
        alarm: AlertStatus.ALARM,
        normal: AlertStatus.NORMAL,
      })
      .getRawOne()

    return {
      totalDevices: parseInt(result.total) || 0,
      onlineDevices: parseInt(result.online) || 0,
      offlineDevices: parseInt(result.offline) || 0,
      warningDevices: parseInt(result.warning) || 0,
      alarmDevices: parseInt(result.alarm) || 0,
      normalDevices: parseInt(result.normal) || 0,
    }
  }

  async findAllWithDeviceInfo(): Promise<DeviceStatus[]> {
    return this.deviceStatusRepository.find({
      relations: ['device'],
      order: { updatedAt: 'DESC' },
    })
  }

  async findByDeviceId(deviceId: string): Promise<DeviceStatus | null> {
    return this.deviceStatusRepository.findOne({
      where: { deviceId },
      relations: ['device'],
    })
  }

  async updateLastSeenBySn(sn: string): Promise<void> {
    const device = await this.deviceRepository.findOne({
      where: { code: sn },
    })

    if (!device) {
      this.logger.warn({ sn }, 'Device not found when updating last seen')
      return
    }

    await this.deviceStatusRepository.update(device.id, {
      lastSeenAt: new Date(),
      isOnline: true,
    })
  }
}
