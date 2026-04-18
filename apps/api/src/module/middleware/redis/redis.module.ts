import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export const REDIS_CLIENT = 'REDIS_CLIENT'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password'),
          retryStrategy: (times) => Math.min(times * 50, 2000),
        }),
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // 💡 应用关闭时自动断开连接，防止进程残留
  async onModuleDestroy() {
    await this.redis.quit()
  }
}
