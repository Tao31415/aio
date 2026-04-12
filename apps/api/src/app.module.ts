import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthController } from './health.controller'
import { databaseConfig, redisConfig, mqttConfig, minioConfig } from './config'
import {
  DatabaseModule,
  CacheModule,
  RedisModule,
  MqttModule,
  StorageModule,
} from './modules'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, mqttConfig, minioConfig],
    }),
    DatabaseModule,
    CacheModule,
    RedisModule,
    MqttModule,
    StorageModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
