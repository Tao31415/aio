import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '@database/database.module'
import {
  databaseConfig,
  redisConfig,
  mqttConfig,
  minioConfig,
  appConfig,
} from '@src/config'
import { validationEnv } from '@src/config/env.validation'
import { AuthModule } from '@auth/auth.module'
import { LogModule } from '@log/log.module'
import { RedisModule } from '@redis/redis.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validationEnv,
      load: [appConfig, databaseConfig, redisConfig, mqttConfig, minioConfig],
    }),
    LogModule,
    DatabaseModule,
    RedisModule,
    AuthModule,
    // MqttModule,
    // StorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
