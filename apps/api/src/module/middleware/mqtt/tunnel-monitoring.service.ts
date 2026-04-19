import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { PinoLogger } from 'nestjs-pino'
import { TunnelMonitoringData } from './entities/tunnel-monitoring.entity'

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
   * 按 createdAt 时间字段分区，每 1 天一个 chunk
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

      // 将普通表转换为 hypertable
      await this.dataSource.query(`
        SELECT create_hypertable(
          'tunnel_monitoring_data',
          'createdAt',
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
   * 这里可以添加额外的业务逻辑，如告警检查、数据聚合等
   */
  processData(data: TunnelMonitoringData[]) {
    // TODO: 实现具体业务逻辑
    // - 触发告警检查
    // - 更新报表数据
    // - 推送通知等

    for (const item of data) {
      this.logger.debug(
        {
          ringNumber: item.ringNumber,
          p1x: item.p1x,
          p1y: item.p1y,
          p9y: item.p9y,
          sd: item.sd,
          coc: item.coc,
        },
        'Processing ring data'
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
}
