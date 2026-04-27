import { Controller, Post, Get, Delete, Body, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import {
  UploadService,
  PresignedUploadResult,
  PresignedDownloadResult,
} from './upload.service'
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

class GenerateUploadUrlDto {
  filename!: string
  contentType!: string
  expiry?: number
}

class GenerateDownloadUrlDto {
  objectName!: string
  expiry?: number
}

@ApiTags('Upload')
@Controller('upload')
@AllowAnonymous()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presign-upload')
  @ApiOperation({ summary: 'Generate a presigned URL for uploading a file' })
  @ApiResponse({ status: 201, description: 'Presigned upload URL generated' })
  @ApiResponse({ status: 500, description: 'Failed to generate presigned URL' })
  async generatePresignedUploadUrl(
    @Body() dto: GenerateUploadUrlDto
  ): Promise<PresignedUploadResult> {
    return this.uploadService.generatePresignedUploadUrl(
      dto.filename,
      dto.contentType,
      dto.expiry
    )
  }

  @Post('presign-download')
  @ApiOperation({ summary: 'Generate a presigned URL for downloading a file' })
  @ApiResponse({ status: 201, description: 'Presigned download URL generated' })
  @ApiResponse({ status: 500, description: 'Failed to generate presigned URL' })
  async generatePresignedDownloadUrl(
    @Body() dto: GenerateDownloadUrlDto
  ): Promise<PresignedDownloadResult> {
    return this.uploadService.generatePresignedDownloadUrl(
      dto.objectName,
      dto.expiry
    )
  }

  @Get('files')
  @ApiOperation({ summary: 'List all uploaded files' })
  @ApiQuery({
    name: 'prefix',
    required: false,
    description: 'Filter files by prefix',
  })
  @ApiResponse({ status: 200, description: 'List of files' })
  async listFiles(@Query('prefix') prefix?: string): Promise<any[]> {
    return this.uploadService.listFiles(prefix)
  }

  @Delete('file')
  @ApiOperation({ summary: 'Delete a file from storage' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 500, description: 'Failed to delete file' })
  async deleteFile(
    @Body() body: { objectName: string }
  ): Promise<{ success: boolean }> {
    await this.uploadService.deleteFile(body.objectName)
    return { success: true }
  }

  @Get('download')
  @ApiOperation({ summary: 'Download a file via redirect' })
  @ApiQuery({
    name: 'objectName',
    required: true,
    description: 'Object name in MinIO',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to presigned download URL',
  })
  async downloadFile(
    @Query('objectName') objectName: string,
    @Res() res: Response
  ) {
    const { presignedUrl } =
      await this.uploadService.generatePresignedDownloadUrl(objectName)
    res.redirect(302, presignedUrl)
  }
}
