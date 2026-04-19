import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ClientProxy } from '@nestjs/microservices'
import { PinoLogger } from 'nestjs-pino'
import { MqttMessage } from './entities/mqtt-message.entity'
import {
  TunnelMonitoringData,
  TunnelMonitoringPayload,
} from './entities/tunnel-monitoring.entity'
import { TunnelMonitoringService } from './tunnel-monitoring.service'

export const MQTT_SERVICE = 'MQTT_SERVICE'

@Injectable()
export class MqttService {
  constructor(
    @InjectRepository(MqttMessage)
    private readonly mqttMessageRepository: Repository<MqttMessage>,
    @InjectRepository(TunnelMonitoringData)
    private readonly tunnelMonitoringRepository: Repository<TunnelMonitoringData>,
    @Inject(MQTT_SERVICE)
    private readonly mqttClient: ClientProxy,
    private readonly logger: PinoLogger,
    private readonly tunnelMonitoringService: TunnelMonitoringService
  ) {
    this.logger.setContext(MqttService.name)
  }

  async saveMessage(data: {
    topic: string
    payload: string | null
    qos?: number
    retained?: boolean
  }): Promise<MqttMessage> {
    const message = this.mqttMessageRepository.create({
      topic: data.topic,
      payload: data.payload,
      qos: data.qos ?? 0,
      retained: data.retained ?? false,
    })
    return this.mqttMessageRepository.save(message)
  }

  publish(topic: string, payload: string, qos: number = 0) {
    this.mqttClient.emit(topic, {
      payload,
      qos,
      timestamp: new Date().toISOString(),
    })
    this.logger.info({ topic }, 'Published to topic')
  }

  async getMessages(
    topic?: string,
    limit: number = 100
  ): Promise<MqttMessage[]> {
    const query = this.mqttMessageRepository
      .createQueryBuilder('msg')
      .orderBy('msg.createdAt', 'DESC')
      .take(limit)

    if (topic) {
      query.where('msg.topic LIKE :topic', { topic: `%${topic}%` })
    }

    return query.getMany()
  }

  /**
   * 处理隧道监测数据
   * 将 MQTT payload 转换为 entity 并保存
   */
  async processTunnelMonitoringData(
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

    const savedEntities = await this.tunnelMonitoringRepository.save(entities)
    this.logger.info(
      { count: savedEntities.length },
      'Saved tunnel monitoring records'
    )

    // 触发后续业务处理
    this.tunnelMonitoringService.processData(savedEntities)

    return savedEntities
  }
}
