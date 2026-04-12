import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'

@Injectable()
export class MinioInitService implements OnModuleInit {
  private readonly logger = new Logger(MinioInitService.name)

  constructor(
    private config: ConfigService,
    private minioClient: Minio.Client
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      const bucket = this.config.get<string>('minio.bucket') ?? 'default'
      await this.ensureBucket(bucket)
    }
  }

  private async ensureBucket(bucket: string) {
    try {
      const exists = await this.minioClient.bucketExists(bucket)
      if (!exists) {
        await this.minioClient.makeBucket(bucket)
        this.logger.log(`MinIO bucket "${bucket}" created`)
      } else {
        this.logger.log(`MinIO bucket "${bucket}" already exists`)
      }
    } catch (error) {
      this.logger.error(`Failed to initialize MinIO bucket`, error)
    }
  }
}
