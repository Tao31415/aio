import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { MqttService } from './mqtt.service'
import type { TunnelMonitoringPayload } from './entities/tunnel-monitoring.entity'

@Controller()
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @EventPattern('*')
  async handleMqttMessage(
    @Payload() data: {
      topic?: string
      payload?: string
      qos?: number
      retained?: boolean
    }
  ) {
    const topic = data.topic || 'unknown'
    await this.mqttService.saveMessage({
      topic,
      payload: data.payload || null,
      qos: data.qos ?? 0,
      retained: data.retained ?? false,
    })
  }

  /**
   * 隧道收敛监测数据监听
   * Topic: grouting-data-monitoring-topic
   */
  @EventPattern('grouting-data-monitoring-topic')
  async handleTunnelMonitoring(@Payload() payload: TunnelMonitoringPayload) {
    await this.mqttService.processTunnelMonitoringData(payload)
  }
}
