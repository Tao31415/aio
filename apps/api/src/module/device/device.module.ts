import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DeviceController } from './device.controller'
import { DeviceService } from './device.service'
import { DeviceStatusService } from './device-status.service'
import { DeviceStatusScheduler } from './device-status.scheduler'
import { DeviceStatisticsController } from './device-statistics.controller'
import {
  Device,
  MeasurementPoint,
  DevicePhoto,
  PointThumbnail,
  DeviceStatus,
} from './entities'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Device,
      MeasurementPoint,
      DevicePhoto,
      PointThumbnail,
      DeviceStatus,
    ]),
  ],
  controllers: [DeviceController, DeviceStatisticsController],
  providers: [DeviceService, DeviceStatusService, DeviceStatusScheduler],
  exports: [DeviceService, DeviceStatusService],
})
export class DeviceModule {}
