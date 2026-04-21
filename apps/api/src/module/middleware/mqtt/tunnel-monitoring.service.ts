import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Repository,
  DataSource,
  LessThanOrEqual,
  MoreThanOrEqual,
  SelectQueryBuilder,
} from 'typeorm'
import { PinoLogger } from 'nestjs-pino'
import {
  TunnelMonitoringData,
  TunnelMonitoringPayload,
} from './entities/tunnel-monitoring.entity'

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
   * 处理 MQTT payload 并保存到数据库
   */
  async processPayload(
    payload: TunnelMonitoringPayload
  ): Promise<TunnelMonitoringData[]> {
    const { timestamp, sn, data } = payload

    this.logger.info(
      { sn, rings: data.length, timestamp },
      'Processing tunnel monitoring data'
    )

    const entities: TunnelMonitoringData[] = []

    for (const item of data) {
      const entity = this.tunnelMonitoringRepository.create({
        ringNumber: item.rn,
        sn: sn,
        timestamp: new Date(timestamp),
        p1x: item['1x'] ?? null,
        p1y: item['1y'] ?? null,
        p7x: item['7x'] ?? null,
        p7y: item['7y'] ?? null,
        p3x: item['3x'] ?? null,
        p3y: item['3y'] ?? null,
        p5x: item['5x'] ?? null,
        p5y: item['5y'] ?? null,
        p9x: item['9x'] ?? null,
        p9y: item['9y'] ?? null,
        coc: item.coc ?? null,
        hc: item.hc ?? null,
        sd: item.sd ?? null,
      })

      entities.push(entity)
    }

    const saved = await this.tunnelMonitoringRepository.save(entities)
    this.logger.info({ count: saved.length }, 'Saved tunnel monitoring records')

    this.processData(saved)
    return saved
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
  async query(
    params: TunnelMonitoringQueryParams
  ): Promise<TunnelMonitoringData[]> {
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

    // 使用 SelectQueryBuilder 构建查询（更类型安全）
    const qb: SelectQueryBuilder<TunnelMonitoringData> =
      this.tunnelMonitoringRepository.createQueryBuilder('t')

    // 时间范围
    const endTime = params.endTime || new Date()
    const startTime =
      params.startTime || new Date(endTime.getTime() - 24 * 60 * 60 * 1000)

    // time_bucket 聚合
    qb.select(`time_bucket('${interval} minutes', t.timestamp)`, 'bucket')
      .addSelect('t.sn', 'sn')
      .addSelect('t.ringNumber', 'ringNumber')
      .addSelect('AVG(t.p1x)', 'avgP1x')
      .addSelect('AVG(t.p1y)', 'avgP1y')
      .addSelect('AVG(t.p9y)', 'avgP9y')
      .addSelect('AVG(t.coc)', 'avgCoc')
      .addSelect('AVG(t.hc)', 'avgHc')
      .addSelect('AVG(t.sd)', 'avgSd')
      .addSelect('COUNT(*)', 'count')
      .where('t.timestamp >= :startTime', { startTime })
      .andWhere('t.timestamp <= :endTime', { endTime })

    // 条件筛选
    if (params.sn) {
      qb.andWhere('t.sn = :sn', { sn: params.sn })
    }
    if (params.ringNumber) {
      qb.andWhere('t.ringNumber = :ringNumber', {
        ringNumber: params.ringNumber,
      })
    }

    // 分组和排序
    qb.groupBy('bucket')
      .addGroupBy('t.sn')
      .addGroupBy('t.ringNumber')
      .orderBy('bucket', 'DESC')

    // 限制
    if (params.limit) {
      qb.take(params.limit)
    }

    const result = await qb.getRawMany()

    return result.map((row: Record<string, unknown>) => ({
      bucket: new Date(row.bucket as string | number),
      sn: row.sn as string,
      ringNumber: row.ringNumber as string,
      avgP1x: row.avgP1x !== null ? parseFloat(row.avgP1x as string) : null,
      avgP1y: row.avgP1y !== null ? parseFloat(row.avgP1y as string) : null,
      avgP9y: row.avgP9y !== null ? parseFloat(row.avgP9y as string) : null,
      avgCoc: row.avgCoc !== null ? parseFloat(row.avgCoc as string) : null,
      avgHc: row.avgHc !== null ? parseFloat(row.avgHc as string) : null,
      avgSd: row.avgSd !== null ? parseFloat(row.avgSd as string) : null,
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
