import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { HealthController } from '@system/health.controller'
import { AuthModule } from '@auth/auth.module'
import { AdminModule } from '@user/admin.module'
import { DatabaseModule } from '@database/database.module'
import { databaseConfig, redisConfig, mqttConfig, minioConfig } from '@/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, mqttConfig, minioConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),

    AuthModule,
    AdminModule,
    DatabaseModule,
    // CacheModule,
    // RedisModule,
    // MqttModule,
    // StorageModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
