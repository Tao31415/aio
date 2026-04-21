import { Injectable, Logger } from '@nestjs/common'
import type { TunnelMonitoringPayload } from './entities/tunnel-monitoring.entity'
import { TunnelMonitoringService } from './tunnel-monitoring.service'
import { Subscribe } from './mqtt.decorators'
import { MqttMessageService } from './mqtt-message.service'

/**
 * 隧道监测消息处理器
 * 通过 @Subscribe 装饰器自动注册到 MqttService 的路由表
 */
@Injectable()
export class TunnelMonitoringHandler {
  private readonly logger = new Logger(TunnelMonitoringHandler.name)

  constructor(
    private readonly tunnelMonitoringService: TunnelMonitoringService,
    private readonly mqttMessageService: MqttMessageService
  ) {}

  /**
   * 处理隧道监测数据
   * 当收到 grouting-data-monitoring-topic 消息时会自动调用
   */
  @Subscribe('grouting-data-monitoring-topic')
  async handleTunnelMonitoringData(
    topic: string,
    data: TunnelMonitoringPayload
  ) {
    this.logger.debug(
      { sn: data.sn, ringCount: data.data.length },
      'Processing tunnel monitoring payload'
    )
    return this.tunnelMonitoringService.processPayload(data)
  }
}
