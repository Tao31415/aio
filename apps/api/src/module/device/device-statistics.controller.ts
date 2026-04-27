import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { DeviceStatusService, DashboardStats } from './device-status.service'
import { DeviceStatus } from './entities/device-status.entity'

@ApiTags('statistics')
@Controller('statistics')
@AllowAnonymous()
export class DeviceStatisticsController {
  constructor(private readonly deviceStatusService: DeviceStatusService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '获取首页统计数据' })
  @ApiResponse({ status: 200, description: '统计数据' })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.deviceStatusService.getDashboardStats()
  }

  @Get('device-status')
  @ApiOperation({ summary: '获取所有设备状态列表' })
  @ApiResponse({ status: 200, description: '设备状态列表' })
  async getDeviceStatusList(): Promise<DeviceStatus[]> {
    return this.deviceStatusService.findAllWithDeviceInfo()
  }

  @Get('device-status/:deviceId')
  @ApiOperation({ summary: '获取单个设备状态详情' })
  @ApiResponse({ status: 200, description: '设备状态详情' })
  @ApiResponse({ status: 404, description: '设备状态未找到' })
  async getDeviceStatusById(
    @Param('deviceId') deviceId: string
  ): Promise<DeviceStatus | null> {
    return this.deviceStatusService.findByDeviceId(deviceId)
  }
}
