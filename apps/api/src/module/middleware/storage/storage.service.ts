import { Injectable, Inject, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PinoLogger } from 'nestjs-pino'
import * as Minio from 'minio'

@Injectable()
export class StorageService implements OnModuleInit {
  private client: Minio.Client
  private readonly bucket: string

  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger
  ) {
    this.client = minioClient
    this.bucket = this.configService.get<string>('minio.bucket') || 'default'
    this.logger.setContext(StorageService.name)
  }

  async onModuleInit() {
    await this.testConnection()
  }

  private async testConnection() {
    try {
      const buckets = await this.client.listBuckets()
      this.logger.info({ count: buckets.length }, 'MinIO connected')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error({ error: message }, 'MinIO connection failed')
      throw error
    }
  }

  async ensureBucket(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket)
      if (!exists) {
        await this.client.makeBucket(this.bucket)
        this.logger.info({ bucket: this.bucket }, 'Bucket created')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error({ error: message }, 'Failed to ensure bucket exists')
      throw error
    }
  }

  async uploadFile(
    objectName: string,
    filePath: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    await this.ensureBucket()
    await this.client.fPutObject(this.bucket, objectName, filePath, metadata)
    return objectName
  }

  async downloadFile(objectName: string, filePath: string): Promise<void> {
    await this.client.fGetObject(this.bucket, objectName, filePath)
  }

  async deleteFile(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName)
  }

  async listFiles(prefix = ''): Promise<any[]> {
    const stream = this.client.listObjects(this.bucket, prefix, true)
    return new Promise((resolve, reject) => {
      const items: any[] = []
      stream.on('data', (item) => items.push(item))
      stream.on('end', () => resolve(items))
      stream.on('error', reject)
    })
  }

  getPresignedUrl(objectName: string, expiry = 259200): Promise<string> {
    return this.client.presignedGetObject(this.bucket, objectName, expiry)
  }

  getPresignedPutObjectUrl(
    objectName: string,
    expiry = 259200
  ): Promise<string> {
    return this.client.presignedPutObject(this.bucket, objectName, expiry)
  }

  getClient(): Minio.Client {
    return this.client
  }
}
