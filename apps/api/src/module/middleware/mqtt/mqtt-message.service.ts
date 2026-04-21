import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MqttMessage } from './entities/mqtt-message.entity'

/**
 * MQTT 消息持久化服务
 * 负责保存和查询 MQTT 历史消息
 */
@Injectable()
export class MqttMessageService {
  constructor(
    @InjectRepository(MqttMessage)
    private readonly repository: Repository<MqttMessage>
  ) {}

  async saveMessage(data: {
    topic: string
    payload: string | null
    qos?: number
    retained?: boolean
  }): Promise<MqttMessage> {
    const message = this.repository.create({
      topic: data.topic,
      payload: data.payload,
      qos: data.qos ?? 0,
      retained: data.retained ?? false,
    })
    return this.repository.save(message)
  }

  async getMessages(
    topic?: string,
    limit: number = 100
  ): Promise<MqttMessage[]> {
    const query = this.repository
      .createQueryBuilder('msg')
      .orderBy('msg.createdAt', 'DESC')
      .take(limit)

    if (topic) {
      query.where('msg.topic LIKE :topic', { topic: `%${topic}%` })
    }

    return query.getMany()
  }
}
