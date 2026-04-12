import { Module } from '@nestjs/common'
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import KeyvRedis from '@keyv/redis'

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('redis.host') ?? 'localhost'
        const port = config.get<number>('redis.port') ?? 6379
        return {
          stores: [new KeyvRedis(`redis://${host}:${port}`)],
        }
      },
    }),
  ],
})
export class CacheModule {}
