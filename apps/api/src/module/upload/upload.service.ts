import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PinoLogger } from 'nestjs-pino'
import { StorageService } from '@storage/storage.service'
import { randomUUID } from 'crypto'

export interface PresignedUploadResult {
  objectName: string
  presignedUrl: string
  expiresIn: number
}

export interface PresignedDownloadResult {
  objectName: string
  presignedUrl: string
  expiresIn: number
}

@Injectable()
export class UploadService {
  private readonly defaultExpiry: number

  constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(UploadService.name)
    this.defaultExpiry = 259200 // 3 days
  }

  /**
   * Generate a presigned URL for uploading a file directly to MinIO
   */
  async generatePresignedUploadUrl(
    filename: string,
    contentType: string,
    expiry?: number
  ): Promise<PresignedUploadResult> {
    const ext = filename.split('.').pop() ?? ''
    const objectName = `uploads/${randomUUID()}${ext ? `.${ext}` : ''}`
    const expiresIn = expiry ?? this.defaultExpiry

    try {
      const presignedUrl = await this.storageService.getPresignedPutObjectUrl(
        objectName,
        expiresIn
      )

      this.logger.info(
        { objectName, expiresIn },
        'Presigned upload URL generated'
      )

      return {
        objectName,
        presignedUrl,
        expiresIn,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(
        { error: message },
        'Failed to generate presigned upload URL'
      )
      throw error
    }
  }

  /**
   * Generate a presigned URL for downloading a file directly from MinIO
   */
  async generatePresignedDownloadUrl(
    objectName: string,
    expiry?: number
  ): Promise<PresignedDownloadResult> {
    const expiresIn = expiry ?? this.defaultExpiry

    try {
      const presignedUrl = await this.storageService.getPresignedUrl(
        objectName,
        expiresIn
      )

      this.logger.info(
        { objectName, expiresIn, presignedUrl },
        'Presigned download URL generated'
      )

      return {
        objectName,
        presignedUrl,
        expiresIn,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(
        { error: message },
        'Failed to generate presigned download URL'
      )
      throw error
    }
  }

  /**
   * Delete a file from MinIO
   */
  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.storageService.deleteFile(objectName)
      this.logger.info({ objectName }, 'File deleted from MinIO')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error({ error: message }, 'Failed to delete file from MinIO')
      throw error
    }
  }

  /**
   * List all files in the uploads prefix
   */
  async listFiles(prefix = 'uploads/'): Promise<any[]> {
    try {
      const files = await this.storageService.listFiles(prefix)
      return files
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error({ error: message }, 'Failed to list files from MinIO')
      throw error
    }
  }
}
