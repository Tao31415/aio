import { Controller, Post, Get, Body, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { MqttService } from './mqtt.service'

@ApiTags('mqtt')
@Controller('mqtt')
export class MqttHttpController {
  constructor(private readonly mqttService: MqttService) {}

  @Post('publish')
  @ApiOperation({ summary: '发布 MQTT 消息' })
  publish(@Body() body: { topic: string; payload: string; qos?: number }) {
    this.mqttService.publish(body.topic, body.payload, body.qos ?? 0)
    return { success: true, topic: body.topic }
  }

  @Get('messages')
  @ApiOperation({ summary: '获取历史 MQTT 消息' })
  async getMessages(
    @Query('topic') topic?: string,
    @Query('limit') limit?: string
  ) {
    const messages = await this.mqttService.getMessages(
      topic,
      limit ? parseInt(limit, 10) : 100
    )
    return { messages }
  }
}
