import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { MqttMessageService } from './mqtt-message.service'
import { TunnelMonitoringService } from './tunnel-monitoring.service'
import type { TunnelMonitoringQueryParams } from './tunnel-monitoring.service'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

/**
 * MQTT HTTP 控制器
 * 所有接口前缀: /api/v1/mqtt
 */
@ApiTags('mqtt')
@AllowAnonymous()
@Controller('mqtt')
export class MqttHttpController {
  constructor(
    private readonly mqttMessageService: MqttMessageService,
    private readonly tunnelMonitoringService: TunnelMonitoringService
  ) {}

  /**
   * 获取历史 MQTT 消息
   * GET /api/v1/mqtt/messages?topic=xxx&limit=100
   */
  @Get('messages')
  @ApiOperation({ summary: '获取历史 MQTT 消息' })
  async getMessages(
    @Query('topic') topic?: string,
    @Query('limit') limit?: string
  ) {
    const messages = await this.mqttMessageService.getMessages(
      topic,
      limit ? parseInt(limit, 10) : 100
    )
    return { messages }
  }

  // ==================== 隧道监测数据接口 ====================

  /**
   * 查询隧道监测数据
   * GET /api/v1/mqtt/tunnel-monitoring?sn=xxx&ringNumber=xxx&startTime=xxx&endTime=xxx&limit=100
   */
  @Get('tunnel-monitoring')
  @ApiOperation({ summary: '查询隧道监测数据' })
  @ApiQuery({ name: 'sn', required: false, description: '设备序列号' })
  @ApiQuery({ name: 'ringNumber', required: false, description: '环号' })
  @ApiQuery({
    name: 'startTime',
    required: false,
    description: '开始时间 (ISO 8601)',
  })
  @ApiQuery({
    name: 'endTime',
    required: false,
    description: '结束时间 (ISO 8601)',
  })
  @ApiQuery({ name: 'limit', required: false, description: '返回条数限制' })
  async getTunnelMonitoringData(@Query() query: TunnelMonitoringQueryParams) {
    const data = await this.tunnelMonitoringService.query({
      sn: query.sn,
      ringNumber: query.ringNumber,
      startTime: query.startTime
        ? new Date(query.startTime as unknown as string)
        : undefined,
      endTime: query.endTime
        ? new Date(query.endTime as unknown as string)
        : undefined,
      limit: query.limit
        ? parseInt(query.limit as unknown as string, 10)
        : undefined,
    })
    return { data, total: data.length }
  }

  /**
   * 获取最新监测数据
   * GET /api/v1/mqtt/tunnel-monitoring/latest?limit=100
   */
  @Get('tunnel-monitoring/latest')
  @ApiOperation({ summary: '获取最新监测数据' })
  @ApiQuery({ name: 'limit', required: false, description: '返回条数' })
  async getLatestTunnelMonitoringData(@Query('limit') limit?: string) {
    const data = await this.tunnelMonitoringService.findLatest(
      limit ? parseInt(limit, 10) : 100
    )
    return { data, total: data.length }
  }

  /**
   * 聚合查询隧道监测数据（使用 TimescaleDB time_bucket）
   * GET /api/v1/mqtt/tunnel-monitoring/aggregate?sn=xxx&ringNumber=xxx&interval=5&limit=100
   */
  @Get('tunnel-monitoring/aggregate')
  @ApiOperation({ summary: '聚合查询隧道监测数据' })
  @ApiQuery({ name: 'sn', required: false, description: '设备序列号' })
  @ApiQuery({ name: 'ringNumber', required: false, description: '环号' })
  @ApiQuery({
    name: 'startTime',
    required: false,
    description: '开始时间 (ISO 8601)',
  })
  @ApiQuery({
    name: 'endTime',
    required: false,
    description: '结束时间 (ISO 8601)',
  })
  @ApiQuery({
    name: 'interval',
    required: false,
    description: '时间间隔（分钟）',
  })
  @ApiQuery({ name: 'limit', required: false, description: '返回条数限制' })
  async getAggregatedTunnelMonitoringData(
    @Query() query: TunnelMonitoringQueryParams
  ) {
    const data = await this.tunnelMonitoringService.queryAggregated({
      sn: query.sn,
      ringNumber: query.ringNumber,
      startTime: query.startTime
        ? new Date(query.startTime as unknown as string)
        : undefined,
      endTime: query.endTime
        ? new Date(query.endTime as unknown as string)
        : undefined,
      interval: query.interval
        ? parseInt(query.interval as unknown as string, 10)
        : 60,
      limit: query.limit
        ? parseInt(query.limit as unknown as string, 10)
        : undefined,
    })
    return { data, total: data.length }
  }

  /**
   * 按环号查询监测数据
   * GET /api/v1/mqtt/tunnel-monitoring/ring/:ringNumber
   */
  @Get('tunnel-monitoring/ring/:ringNumber')
  @ApiOperation({ summary: '按环号查询监测数据' })
  async getByRingNumber(@Query('ringNumber') ringNumber: string) {
    const data = await this.tunnelMonitoringService.findByRingNumber(ringNumber)
    return { data, total: data.length }
  }

  /**
   * 获取某环号最新数据
   * GET /api/v1/mqtt/tunnel-monitoring/ring/:ringNumber/latest
   */
  @Get('tunnel-monitoring/ring/:ringNumber/latest')
  @ApiOperation({ summary: '获取某环号最新数据' })
  async getLatestByRingNumber(@Query('ringNumber') ringNumber: string) {
    const data =
      await this.tunnelMonitoringService.findLatestByRingNumber(ringNumber)
    return { data }
  }

  /**
   * 获取所有不重复的设备序列号
   * GET /api/v1/mqtt/tunnel-monitoring/sn
   */
  @Get('tunnel-monitoring/sn')
  @ApiOperation({ summary: '获取所有不重复的设备序列号' })
  async getAllDistinctSn() {
    const sns = await this.tunnelMonitoringService.findAllDistinctSn()
    return { data: sns, total: sns.length }
  }

  /**
   * 获取指定 SN 的所有不重复环号
   * GET /api/v1/mqtt/tunnel-monitoring/sn/:sn/ring-numbers
   */
  @Get('tunnel-monitoring/sn/:sn/ring-numbers')
  @ApiOperation({ summary: '获取指定 SN 的所有不重复环号' })
  async getDistinctRingNumbersBySn(@Param('sn') sn: string) {
    const ringNumbers =
      await this.tunnelMonitoringService.findDistinctRingNumbersBySn(sn)
    return { data: ringNumbers, total: ringNumbers.length }
  }
}
