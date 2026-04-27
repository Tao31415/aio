import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PinoLogger } from 'nestjs-pino'
import {
  Device,
  MeasurementPoint,
  DevicePhoto,
  PointThumbnail,
} from './entities'

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(MeasurementPoint)
    private readonly measurementPointRepository: Repository<MeasurementPoint>,
    @InjectRepository(DevicePhoto)
    private readonly devicePhotoRepository: Repository<DevicePhoto>,
    @InjectRepository(PointThumbnail)
    private readonly pointThumbnailRepository: Repository<PointThumbnail>,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(DeviceService.name)
  }

  // ==================== Device CRUD ====================

  async createDevice(data: {
    name: string
    code: string
    project?: string
    longitude?: number
    latitude?: number
    elevation?: number
    coordX?: number
    coordY?: number
    coordZ?: number
  }): Promise<Device> {
    const device = this.deviceRepository.create(data)
    const saved = await this.deviceRepository.save(device)
    this.logger.info({ deviceId: saved.id, code: saved.code }, 'Device created')
    return saved
  }

  async findAllDevices(): Promise<Device[]> {
    return this.deviceRepository.find({
      relations: ['measurementPoints', 'devicePhotos'],
      order: { createdAt: 'DESC' },
    })
  }

  async findDeviceById(id: string): Promise<Device | null> {
    return this.deviceRepository.findOne({
      where: { id },
      relations: ['measurementPoints', 'devicePhotos'],
    })
  }

  async findDeviceByCode(code: string): Promise<Device | null> {
    return this.deviceRepository.findOne({
      where: { code },
      relations: ['measurementPoints', 'devicePhotos'],
    })
  }

  async updateDevice(
    id: string,
    data: Partial<{
      name: string
      code: string
      project: string
      longitude: number
      latitude: number
      elevation: number
      coordX: number
      coordY: number
      coordZ: number
    }>
  ): Promise<Device | null> {
    await this.deviceRepository.update(id, data)
    return this.findDeviceById(id)
  }

  async deleteDevice(id: string): Promise<void> {
    await this.deviceRepository.delete(id)
    this.logger.info({ deviceId: id }, 'Device deleted')
  }

  // ==================== MeasurementPoint CRUD ====================

  async createMeasurementPoint(data: {
    deviceId: string
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
  }): Promise<MeasurementPoint> {
    const point = this.measurementPointRepository.create(data)
    const saved = await this.measurementPointRepository.save(point)
    this.logger.info(
      { pointId: saved.id, deviceId: data.deviceId },
      'MeasurementPoint created'
    )
    return saved
  }

  async createMeasurementPoints(
    deviceId: string,
    points: Array<{
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
  ): Promise<MeasurementPoint[]> {
    const entities = points.map((p) =>
      this.measurementPointRepository.create({ ...p, deviceId })
    )
    const saved = await this.measurementPointRepository.save(entities)
    this.logger.info(
      { deviceId, count: saved.length },
      'MeasurementPoints created'
    )
    return saved
  }

  async findMeasurementPointsByDeviceId(
    deviceId: string
  ): Promise<MeasurementPoint[]> {
    return this.measurementPointRepository.find({
      where: { deviceId },
      relations: ['pointThumbnails'],
      order: { index: 'ASC' },
    })
  }

  async findMeasurementPointById(id: string): Promise<MeasurementPoint | null> {
    return this.measurementPointRepository.findOne({
      where: { id },
      relations: ['pointThumbnails'],
    })
  }

  async updateMeasurementPoint(
    id: string,
    data: Partial<{
      index: number
      name: string
      coordX: number
      coordY: number
      coordZ: number
      ringNumber: string
      size: string
      warningThresholdHorizontal: number
      warningThresholdVertical: number
      alarmThresholdHorizontal: number
      alarmThresholdVertical: number
    }>
  ): Promise<MeasurementPoint | null> {
    await this.measurementPointRepository.update(id, data)
    return this.measurementPointRepository.findOne({ where: { id } })
  }

  async deleteMeasurementPoint(id: string): Promise<void> {
    await this.measurementPointRepository.delete(id)
    this.logger.info({ pointId: id }, 'MeasurementPoint deleted')
  }

  async deleteMeasurementPointsByDeviceId(deviceId: string): Promise<void> {
    await this.measurementPointRepository.delete({ deviceId })
  }

  // ==================== DevicePhoto CRUD ====================

  async createDevicePhoto(data: {
    deviceId: string
    objectName: string
    displayTime?: string
  }): Promise<DevicePhoto> {
    const photo = this.devicePhotoRepository.create(data)
    const saved = await this.devicePhotoRepository.save(photo)
    this.logger.info(
      { photoId: saved.id, deviceId: data.deviceId },
      'DevicePhoto created'
    )
    return saved
  }

  async findDevicePhotosByDeviceId(deviceId: string): Promise<DevicePhoto[]> {
    return this.devicePhotoRepository.find({
      where: { deviceId },
      order: { createdAt: 'DESC' },
    })
  }

  async findDevicePhotoById(id: string): Promise<DevicePhoto | null> {
    return this.devicePhotoRepository.findOne({ where: { id } })
  }

  async deleteDevicePhoto(id: string): Promise<void> {
    await this.devicePhotoRepository.delete(id)
    this.logger.info({ photoId: id }, 'DevicePhoto deleted')
  }

  // ==================== PointThumbnail CRUD ====================

  async createPointThumbnail(data: {
    measurementPointId: string
    devicePhotoId?: string
    objectName: string
    cropX: number
    cropY: number
    cropSize: number
  }): Promise<PointThumbnail> {
    const thumbnail = this.pointThumbnailRepository.create(data)
    const saved = await this.pointThumbnailRepository.save(thumbnail)
    this.logger.info(
      { thumbnailId: saved.id, measurementPointId: data.measurementPointId },
      'PointThumbnail created'
    )
    return saved
  }

  async findPointThumbnailsByMeasurementPointId(
    measurementPointId: string
  ): Promise<PointThumbnail[]> {
    return this.pointThumbnailRepository.find({
      where: { measurementPointId },
      relations: ['devicePhoto'],
      order: { createdAt: 'DESC' },
    })
  }

  async deletePointThumbnail(id: string): Promise<void> {
    await this.pointThumbnailRepository.delete(id)
    this.logger.info({ thumbnailId: id }, 'PointThumbnail deleted')
  }
}
