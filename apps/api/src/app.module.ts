import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '@database/database.module'
import {
  databaseConfig,
  redisConfig,
  mqttConfig,
  minioConfig,
  appConfig,
} from '@/config'
import { validationEnv } from '@/config/env.validation'
import { AuthModule } from '@auth/auth.module'
import { LogModule } from '@log/log.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validationEnv,
      load: [appConfig, databaseConfig, redisConfig, mqttConfig, minioConfig],
    }),
    LogModule,
    AuthModule,
    DatabaseModule,
    // CacheModule,
    // RedisModule,
    // MqttModule,
    // StorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
