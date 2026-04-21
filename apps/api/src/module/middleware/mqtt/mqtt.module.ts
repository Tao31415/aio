import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DiscoveryModule } from '@nestjs/core'
import { MqttService } from './mqtt.service'
import { MqttExplorer } from './mqtt.explorer'
import { MqttHttpController } from './mqtt-http.controller'
import { TunnelMonitoringService } from './tunnel-monitoring.service'
import { TunnelMonitoringHandler } from './tunnel-monitoring.handler'
import { MqttMessageService } from './mqtt-message.service'
import { MqttModuleAsyncOptions, MqttModuleOptions } from './mqtt.interfaces'
import { MqttMessage } from './entities/mqtt-message.entity'
import { TunnelMonitoringData } from './entities/tunnel-monitoring.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([MqttMessage, TunnelMonitoringData])],
  controllers: [MqttHttpController],
  providers: [
    MqttService,
    MqttExplorer,
    TunnelMonitoringService,
    TunnelMonitoringHandler,
    MqttMessageService,
  ],
  exports: [MqttService, TunnelMonitoringService, MqttMessageService],
})
export class MqttModule {
  static forRoot(options: MqttModuleOptions): DynamicModule {
    return {
      module: MqttModule,
      imports: [DiscoveryModule],
      providers: [
        { provide: 'MQTT_OPTIONS', useValue: options },
        MqttService,
        MqttExplorer,
      ],
      exports: [MqttService],
    }
  }

  static forRootAsync(options: MqttModuleAsyncOptions): DynamicModule {
    const asyncProviders: Provider[] = []

    if (options.useFactory) {
      asyncProviders.push({
        provide: 'MQTT_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      })
    }

    return {
      module: MqttModule,
      imports: [DiscoveryModule, ...(options.imports || [])],
      providers: [...asyncProviders, MqttService, MqttExplorer],
      exports: [MqttService],
    }
  }

  /**
   * 从 ConfigService 读取配置
   */
  static forRootAsyncFromConfig(): DynamicModule {
    return MqttModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        brokerUrl: config.get('mqtt.brokerUrl', 'mqtt://localhost:1883'),
        username: config.get<string>('mqtt.username') || undefined,
        password: config.get<string>('mqtt.password') || undefined,
        clientId: config.get<string>('mqtt.clientId') || undefined,
      }),
    })
  }
}
