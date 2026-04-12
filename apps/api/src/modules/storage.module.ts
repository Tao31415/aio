import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as Minio from 'minio'
import { MinioInitService } from '../minio-init.service'

export const MINIO_CLIENT = 'MINIO_CLIENT'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MINIO_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const endpoint =
          config.get<string>('minio.endpoint') ?? 'localhost:9000'
        const [host = 'localhost', port = '9000'] = endpoint.split(':')
        return new Minio.Client({
          endPoint: host,
          port: parseInt(port, 10),
          useSSL: false,
          accessKey: config.get<string>('minio.accessKey') ?? 'minioadmin',
          secretKey: config.get<string>('minio.secretKey') ?? 'minioadmin',
        })
      },
    },
    MinioInitService,
  ],
  exports: [MINIO_CLIENT, MinioInitService],
})
export class StorageModule {}
