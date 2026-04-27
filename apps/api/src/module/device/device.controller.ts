import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { DeviceService } from './device.service'
import {
  Device,
  MeasurementPoint,
  DevicePhoto,
  PointThumbnail,
} from './entities'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

class CreateDeviceDto {
  name!: string
  code!: string
  project?: string
  longitude?: number
  latitude?: number
  elevation?: number
  coordX?: number
  coordY?: number
  coordZ?: number
}

class UpdateDeviceDto {
  name?: string
  code?: string
  project?: string
  longitude?: number
  latitude?: number
  elevation?: number
  coordX?: number
  coordY?: number
  coordZ?: number
}

class CreateMeasurementPointDto {
  deviceId!: string
  index!: number
  name!: string
  coordX?: number
  coordY?: number
  coordZ?: number
  ringNumber?: string
  size?: string
  warningThresholdHorizontal?: number
  warningThresholdVertical?: number
  alarmThresholdHorizontal?: number
  alarmThresholdVertical?: number
}

class CreateMeasurementPointsBatchDto {
  deviceId!: string
  points!: Array<{
    index: number
    name: string
    coordX?: number
    coordY?: number
    coordZ?: number
    ringNumber?: string
    size?: string
    warningThresholdHorizontal?: number
    warningThresholdVertical?: number
    alarmThresholdHorizontal?: number
    alarmThresholdVertical?: number
  }>
}

class UpdateMeasurementPointDto {
  index?: number
  name?: string
  coordX?: number
  coordY?: number
  coordZ?: number
  ringNumber?: string
  size?: string
  warningThresholdHorizontal?: number
  warningThresholdVertical?: number
  alarmThresholdHorizontal?: number
  alarmThresholdVertical?: number
}

class CreateDevicePhotoDto {
  deviceId!: string
  objectName!: string
  displayTime?: string // HH:mm 格式
}

class CreatePointThumbnailDto {
  measurementPointId!: string
  devicePhotoId?: string
  objectName!: string
  cropX!: number
  cropY!: number
  cropSize!: number
}

@ApiTags('Device')
@Controller('device')
@AllowAnonymous()
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // ==================== Device Routes ====================

  @Post()
  @ApiOperation({ summary: 'Create a new device' })
  @ApiResponse({ status: 201, description: 'Device created' })
  async createDevice(@Body() dto: CreateDeviceDto): Promise<Device> {
    return this.deviceService.createDevice(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all devices' })
  @ApiResponse({ status: 200, description: 'List of devices' })
  async findAllDevices(): Promise<Device[]> {
    return this.deviceService.findAllDevices()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by ID' })
  @ApiResponse({ status: 200, description: 'Device found' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async findDeviceById(@Param('id') id: string): Promise<Device | null> {
    return this.deviceService.findDeviceById(id)
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get device by code' })
  @ApiResponse({ status: 200, description: 'Device found' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async findDeviceByCode(@Param('code') code: string): Promise<Device | null> {
    return this.deviceService.findDeviceByCode(code)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update device' })
  @ApiResponse({ status: 200, description: 'Device updated' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async updateDevice(
    @Param('id') id: string,
    @Body() dto: UpdateDeviceDto
  ): Promise<Device | null> {
    return this.deviceService.updateDevice(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete device' })
  @ApiResponse({ status: 200, description: 'Device deleted' })
  async deleteDevice(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.deviceService.deleteDevice(id)
    return { success: true }
  }

  // ==================== MeasurementPoint Routes ====================

  @Post('point')
  @ApiOperation({ summary: 'Create a measurement point' })
  @ApiResponse({ status: 201, description: 'MeasurementPoint created' })
  async createMeasurementPoint(
    @Body() dto: CreateMeasurementPointDto
  ): Promise<MeasurementPoint> {
    return this.deviceService.createMeasurementPoint(dto)
  }

  @Post('points/batch')
  @ApiOperation({ summary: 'Create multiple measurement points' })
  @ApiResponse({ status: 201, description: 'MeasurementPoints created' })
  async createMeasurementPointsBatch(
    @Body() dto: CreateMeasurementPointsBatchDto
  ): Promise<MeasurementPoint[]> {
    return this.deviceService.createMeasurementPoints(dto.deviceId, dto.points)
  }

  @Get('point/:id')
  @ApiOperation({ summary: 'Get measurement point by ID' })
  @ApiResponse({ status: 200, description: 'MeasurementPoint found' })
  async findMeasurementPointById(
    @Param('id') id: string
  ): Promise<MeasurementPoint | null> {
    return this.deviceService.findMeasurementPointById(id)
  }

  @Get('points/device/:deviceId')
  @ApiOperation({ summary: 'Get measurement points by device ID' })
  @ApiResponse({ status: 200, description: 'List of measurement points' })
  async findMeasurementPointsByDeviceId(
    @Param('deviceId') deviceId: string
  ): Promise<MeasurementPoint[]> {
    return this.deviceService.findMeasurementPointsByDeviceId(deviceId)
  }

  @Put('point/:id')
  @ApiOperation({ summary: 'Update measurement point' })
  @ApiResponse({ status: 200, description: 'MeasurementPoint updated' })
  @ApiResponse({ status: 404, description: 'MeasurementPoint not found' })
  async updateMeasurementPoint(
    @Param('id') id: string,
    @Body() dto: UpdateMeasurementPointDto
  ): Promise<MeasurementPoint | null> {
    return this.deviceService.updateMeasurementPoint(id, dto)
  }

  @Delete('point/:id')
  @ApiOperation({ summary: 'Delete measurement point' })
  @ApiResponse({ status: 200, description: 'MeasurementPoint deleted' })
  async deleteMeasurementPoint(
    @Param('id') id: string
  ): Promise<{ success: boolean }> {
    await this.deviceService.deleteMeasurementPoint(id)
    return { success: true }
  }

  // ==================== DevicePhoto Routes ====================

  @Post('photo')
  @ApiOperation({ summary: 'Create a device photo record' })
  @ApiResponse({ status: 201, description: 'DevicePhoto created' })
  async createDevicePhoto(
    @Body() dto: CreateDevicePhotoDto
  ): Promise<DevicePhoto> {
    return this.deviceService.createDevicePhoto(dto)
  }

  @Get('photos/device/:deviceId')
  @ApiOperation({ summary: 'Get photos by device ID' })
  @ApiResponse({ status: 200, description: 'List of device photos' })
  async findDevicePhotosByDeviceId(
    @Param('deviceId') deviceId: string
  ): Promise<DevicePhoto[]> {
    return this.deviceService.findDevicePhotosByDeviceId(deviceId)
  }

  @Get('photo/:id')
  @ApiOperation({ summary: 'Get device photo by ID' })
  @ApiResponse({ status: 200, description: 'DevicePhoto found' })
  async findDevicePhotoById(
    @Param('id') id: string
  ): Promise<DevicePhoto | null> {
    return this.deviceService.findDevicePhotoById(id)
  }

  @Delete('photo/:id')
  @ApiOperation({ summary: 'Delete device photo' })
  @ApiResponse({ status: 200, description: 'DevicePhoto deleted' })
  async deleteDevicePhoto(
    @Param('id') id: string
  ): Promise<{ success: boolean }> {
    await this.deviceService.deleteDevicePhoto(id)
    return { success: true }
  }

  // ==================== PointThumbnail Routes ====================

  @Post('thumbnail')
  @ApiOperation({ summary: 'Create a point thumbnail' })
  @ApiResponse({ status: 201, description: 'PointThumbnail created' })
  async createPointThumbnail(
    @Body() dto: CreatePointThumbnailDto
  ): Promise<PointThumbnail> {
    return this.deviceService.createPointThumbnail(dto)
  }

  @Get('thumbnails/point/:measurementPointId')
  @ApiOperation({ summary: 'Get thumbnails by measurement point ID' })
  @ApiResponse({ status: 200, description: 'List of point thumbnails' })
  async findPointThumbnailsByMeasurementPointId(
    @Param('measurementPointId') measurementPointId: string
  ): Promise<PointThumbnail[]> {
    return this.deviceService.findPointThumbnailsByMeasurementPointId(
      measurementPointId
    )
  }

  @Delete('thumbnail/:id')
  @ApiOperation({ summary: 'Delete point thumbnail' })
  @ApiResponse({ status: 200, description: 'PointThumbnail deleted' })
  async deletePointThumbnail(
    @Param('id') id: string
  ): Promise<{ success: boolean }> {
    await this.deviceService.deletePointThumbnail(id)
    return { success: true }
  }
}
