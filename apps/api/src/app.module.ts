import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from 'nestjs-pino'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthController } from './health.controller'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { User, Account, Session, Verification } from './auth/entities'
import { databaseConfig, redisConfig, mqttConfig, minioConfig } from './config'


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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'postgres'),
        database: configService.get('DATABASE_NAME', 'nest_better_auth'),
        entities: [User, Account, Session, Verification],
        synchronize: true, // Set to false in production
      }),
    }),
    AuthModule,
    AdminModule,
    // DatabaseModule,
    // CacheModule,
    // RedisModule,
    // MqttModule,
    // StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
