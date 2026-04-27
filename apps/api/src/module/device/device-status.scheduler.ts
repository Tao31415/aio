import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DeviceService } from './device.service'
import { DeviceStatusService } from './device-status.service'
import { PinoLogger } from 'nestjs-pino'

@Injectable()
export class DeviceStatusScheduler {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly deviceStatusService: DeviceStatusService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(DeviceStatusScheduler.name)
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateAllDeviceStatuses() {
    this.logger.info('Starting device status update job')

    try {
      const devices = await this.deviceService.findAllDevices()

      this.logger.info(
        { deviceCount: devices.length },
        'Found devices to update'
      )

      let updatedCount = 0
      let errorCount = 0

      for (const device of devices) {
        try {
          await this.deviceStatusService.updateDeviceStatus(
            device.id,
            device.code
          )
          updatedCount++
        } catch (error) {
          errorCount++
          this.logger.error(
            { error, deviceId: device.id, deviceCode: device.code },
            'Failed to update device status'
          )
        }
      }

      this.logger.info(
        { updatedCount, errorCount, totalCount: devices.length },
        'Device status update job completed'
      )
    } catch (error) {
      this.logger.error({ error }, 'Device status update job failed')
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateOnlineDevices() {
    try {
      const allStatuses = await this.deviceStatusService.findAllWithDeviceInfo()
      const now = new Date()
      const onlineThreshold = 5 * 60 * 1000

      for (const status of allStatuses) {
        if (status.lastSeenAt) {
          const timeSinceLastSeen = now.getTime() - status.lastSeenAt.getTime()
          const shouldBeOnline = timeSinceLastSeen <= onlineThreshold

          if (status.isOnline !== shouldBeOnline) {
            await this.deviceStatusService.initializeDeviceStatus(
              status.deviceId
            )
          }
        }
      }
    } catch (error) {
      this.logger.error({ error }, 'Failed to update online status')
    }
  }
}
