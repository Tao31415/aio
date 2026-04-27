import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DeviceController } from './device.controller'
import { DeviceService } from './device.service'
import {
  Device,
  MeasurementPoint,
  DevicePhoto,
  PointThumbnail,
} from './entities'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Device,
      MeasurementPoint,
      DevicePhoto,
      PointThumbnail,
    ]),
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
