import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { MqttService } from './mqtt.service'
import { PinoLogger } from 'nestjs-pino'
import type { TunnelMonitoringPayload } from './entities/tunnel-monitoring.entity'

@Controller()
export class MqttController {
  constructor(
    private readonly mqttService: MqttService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(MqttController.name)
  }

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
  async handleTunnelMonitoring(@Payload() payload: unknown) {
    this.logger.debug({ payload: typeof payload === 'string' ? payload : JSON.stringify(payload).substring(0, 200) }, 'Raw MQTT payload')

    // Step 1: Parse string if needed
    let data = payload
    if (typeof payload === 'string') {
      try {
        data = JSON.parse(payload)
      } catch {
        this.logger.error({ payload }, 'Failed to parse MQTT message as JSON')
        return
      }
    }

    // Step 2: Determine the actual payload structure
    let tunnelPayload: TunnelMonitoringPayload

    if (Array.isArray(data)) {
      // Payload is directly the data array [{rn, 1x, ...}]
      tunnelPayload = {
        timestamp: Date.now(),
        sn: 'unknown',
        data: data,
      }
    } else if ('timestamp' in (data as Record<string, unknown>) && 'sn' in (data as Record<string, unknown>) && 'data' in (data as Record<string, unknown>)) {
      // Full payload { timestamp, sn, data: [...] }
      tunnelPayload = data as TunnelMonitoringPayload
    } else if ('data' in (data as Record<string, unknown>) && Array.isArray((data as Record<string, unknown>).data)) {
      // { data: [...] } - extract nested data
      const d = data as Record<string, unknown>
      tunnelPayload = {
        timestamp: ('timestamp' in d ? d.timestamp : Date.now()) as number,
        sn: ('sn' in d ? d.sn : 'unknown') as string,
        data: d.data as TunnelMonitoringPayload['data'],
      }
    } else {
      this.logger.error({ data }, 'Unknown MQTT payload format')
      return
    }

    this.logger.debug({ tunnelPayload: JSON.stringify(tunnelPayload).substring(0, 200) }, 'Processed tunnel payload')
    await this.mqttService.processTunnelMonitoringData(tunnelPayload)
  }
}
