import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { PinoLogger } from 'nestjs-pino'
import { TunnelMonitoringData } from './entities/tunnel-monitoring.entity'

/**
 * 隧道监测数据查询参数
 */
export interface TunnelMonitoringQueryParams {
  /** 按环号筛选 */
  ringNumber?: string
  /** 设备序列号 */
  sn?: string
  /** 开始时间 */
  startTime?: Date
  /** 结束时间 */
  endTime?: Date
  /** 时间间隔（分钟），用于聚合查询 */
  interval?: number
  /** 限制返回条数 */
  limit?: number
}

/**
 * 隧道监测数据聚合结果
 */
export interface TunnelMonitoringAggregate {
  bucket: Date
  sn: string
  ringNumber: string
  avgP1x: number | null
  avgP1y: number | null
  avgP9y: number | null
  avgCoc: number | null
  avgHc: number | null
  avgSd: number | null
  count: number
}

/**
 * 隧道监测数据服务
 * 负责时序数据处理和 hypertable 创建
 */
@Injectable()
export class TunnelMonitoringService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(TunnelMonitoringData)
    private readonly tunnelMonitoringRepository: Repository<TunnelMonitoringData>,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(TunnelMonitoringService.name)
  }

  async onModuleInit() {
    // await this.createHypertable()
  }

  /**
   * 将 tunnel_monitoring_data 表转换为 TimescaleDB hypertable
   * 按 timestamp 时间字段分区，每 1 天一个 chunk
   */
  private async createHypertable() {
    try {
      // 检查 timescaledb 扩展是否已启用
      const extensionResult: Array<Record<string, unknown>> = await this
        .dataSource.query(`
        SELECT 1 FROM pg_extension WHERE extname = 'timescaledb';
      `)

      if (extensionResult.length === 0) {
        this.logger.warn(
          'TimescaleDB extension not enabled, skipping hypertable creation'
        )
        return
      }

      // 将普通表转换为 hypertable (使用 timestamp 列)
      await this.dataSource.query(`
        SELECT create_hypertable(
          'tunnel_monitoring_data',
          'timestamp',
          chunk_time_interval => INTERVAL '1 day',
          if_not_exists => TRUE
        );
      `)

      this.logger.info(
        'Hypertable tunnel_monitoring_data created or already exists'
      )
    } catch (error) {
      this.logger.error({ error }, 'Failed to create hypertable')
    }
  }

  /**
   * 处理隧道监测数据（已由 MqttService.processTunnelMonitoringData 调用）
   * 数据已通过 TypeORM 保存到数据库，这里可以添加告警检查等业务逻辑
   */
  processData(data: TunnelMonitoringData[]) {
    for (const item of data) {
      // 检查告警阈值
      this.checkAlertThresholds(item)

      this.logger.debug(
        {
          ringNumber: item.ringNumber,
          sn: item.sn,
          p1x: item.p1x,
          p1y: item.p1y,
          p9y: item.p9y,
          sd: item.sd,
          coc: item.coc,
        },
        'Processed tunnel monitoring data'
      )
    }
  }

  /**
   * 检查告警阈值
   * 可根据实际需求调整阈值
   */
  private checkAlertThresholds(data: TunnelMonitoringData) {
    // 示例：沉降位移阈值 (单位:mm)
    const SD_THRESHOLD = 10.0
    // 示例：净空收敛阈值
    const COC_THRESHOLD = 5.0

    if (data.sd !== null && Math.abs(data.sd) > SD_THRESHOLD) {
      this.logger.warn(
        {
          ringNumber: data.ringNumber,
          sn: data.sn,
          sd: data.sd,
          threshold: SD_THRESHOLD,
        },
        'ALERT: Settlement displacement exceeded threshold'
      )
    }

    if (data.coc !== null && Math.abs(data.coc) > COC_THRESHOLD) {
      this.logger.warn(
        {
          ringNumber: data.ringNumber,
          sn: data.sn,
          coc: data.coc,
          threshold: COC_THRESHOLD,
        },
        'ALERT: Clearance convergence exceeded threshold'
      )
    }
  }

  /**
   * 按环号查询监测数据
   */
  async findByRingNumber(ringNumber: string): Promise<TunnelMonitoringData[]> {
    return this.tunnelMonitoringRepository.find({
      where: { ringNumber },
      order: { timestamp: 'DESC' },
    })
  }

  /**
   * 查询最新 N 条数据
   */
  async findLatest(limit: number = 100): Promise<TunnelMonitoringData[]> {
    return this.tunnelMonitoringRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    })
  }

  /**
   * 通用查询：支持时间范围、环号、设备号筛选
   */
  async query(params: TunnelMonitoringQueryParams): Promise<TunnelMonitoringData[]> {
    const where: Record<string, unknown> = {}

    if (params.ringNumber) {
      where.ringNumber = params.ringNumber
    }
    if (params.sn) {
      where.sn = params.sn
    }
    if (params.startTime && params.endTime) {
      where.timestamp = MoreThanOrEqual(params.startTime)
    } else if (params.startTime) {
      where.timestamp = MoreThanOrEqual(params.startTime)
    } else if (params.endTime) {
      where.timestamp = LessThanOrEqual(params.endTime)
    }

    return this.tunnelMonitoringRepository.find({
      where,
      order: { timestamp: 'DESC' },
      take: params.limit || 1000,
    })
  }

  /**
   * 按时间桶聚合查询
   * 使用 TimescaleDB time_bucket 函数进行时间聚合
   *
   * @param params 查询参数
   * @returns 聚合后的数据
   */
  async queryAggregated(
    params: TunnelMonitoringQueryParams
  ): Promise<TunnelMonitoringAggregate[]> {
    const interval = params.interval || 60 // 默认 60 分钟

    let query = `
      SELECT
        time_bucket('${interval} minutes', timestamp) AS bucket,
        sn,
        ring_number,
        AVG(p1x) AS "avgP1x",
        AVG(p1y) AS "avgP1y",
        AVG(p9y) AS "avgP9y",
        AVG(coc) AS "avgCoc",
        AVG(hc) AS "avgHc",
        AVG(sd) AS "avgSd",
        COUNT(*) AS count
      FROM tunnel_monitoring_data
      WHERE 1=1
    `

    const queryParams: unknown[] = []
    let paramIndex = 1

    if (params.sn) {
      query += ` AND sn = $${paramIndex++}`
      queryParams.push(params.sn)
    }

    if (params.ringNumber) {
      query += ` AND ring_number = $${paramIndex++}`
      queryParams.push(params.ringNumber)
    }

    if (params.startTime) {
      query += ` AND timestamp >= $${paramIndex++}`
      queryParams.push(params.startTime)
    }

    if (params.endTime) {
      query += ` AND timestamp <= $${paramIndex++}`
      queryParams.push(params.endTime)
    }

    query += `
      GROUP BY bucket, sn, ring_number
      ORDER BY bucket DESC
    `

    if (params.limit) {
      query += ` LIMIT $${paramIndex}`
      queryParams.push(params.limit)
    }

    const result = await this.dataSource.query(query, queryParams)

    return result.map((row: Record<string, unknown>) => ({
      bucket: new Date(row.bucket as string | number),
      sn: row.sn as string,
      ringNumber: row.ring_number as string,
      avgP1x: row.avgP1x ? parseFloat(row.avgP1x as string) : null,
      avgP1y: row.avgP1y ? parseFloat(row.avgP1y as string) : null,
      avgP9y: row.avgP9y ? parseFloat(row.avgP9y as string) : null,
      avgCoc: row.avgCoc ? parseFloat(row.avgCoc as string) : null,
      avgHc: row.avgHc ? parseFloat(row.avgHc as string) : null,
      avgSd: row.avgSd ? parseFloat(row.avgSd as string) : null,
      count: parseInt(row.count as string, 10),
    }))
  }

  /**
   * 获取最新的一条数据（按环号）
   */
  async findLatestByRingNumber(
    ringNumber: string
  ): Promise<TunnelMonitoringData | null> {
    const result = await this.tunnelMonitoringRepository.find({
      where: { ringNumber },
      order: { timestamp: 'DESC' },
      take: 1,
    })
    return result[0] || null
  }

  /**
   * 获取某设备最新一条数据
   */
  async findLatestBySn(sn: string): Promise<TunnelMonitoringData | null> {
    const result = await this.tunnelMonitoringRepository.find({
      where: { sn },
      order: { timestamp: 'DESC' },
      take: 1,
    })
    return result[0] || null
  }
}
