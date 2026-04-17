import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'

@Injectable()
export class StorageService implements OnModuleInit {
  private client: Minio.Client
  private readonly logger = new Logger(StorageService.name)
  private readonly bucket: string

  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    private readonly configService: ConfigService
  ) {
    this.client = minioClient
    this.bucket = this.configService.get<string>('minio.bucket') || 'default'
  }

  async onModuleInit() {
    await this.testConnection()
  }

  private async testConnection() {
    try {
      const buckets = await this.client.listBuckets()
      this.logger.log(`MinIO 连接成功，已连接 ${buckets.length} 个 buckets`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`MinIO 连接失败: ${message}`)
      throw error
    }
  }

  async ensureBucket(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket)
      if (!exists) {
        await this.client.makeBucket(this.bucket)
        this.logger.log(`Bucket "${this.bucket}" 已创建`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`确保 Bucket 存在失败: ${message}`)
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

  getPresignedUrl(objectName: string, expiry = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, objectName, expiry)
  }

  getClient(): Minio.Client {
    return this.client
  }
}
