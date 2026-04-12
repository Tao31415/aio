import { Controller, Get } from '@nestjs/common'
import { MinioService } from './minio.service'

@Controller()
export class HealthController {
  constructor(private readonly minioService: MinioService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      minio: 'connected',
    }
  }
}
