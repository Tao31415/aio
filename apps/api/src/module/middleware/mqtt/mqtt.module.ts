import { Global, Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MqttService } from './mqtt.service'
import { TunnelMonitoringService } from './tunnel-monitoring.service'
import { MqttController } from './mqtt.controller'
import { MqttHttpController } from './mqtt-http.controller'
import { MqttMessage } from './entities/mqtt-message.entity'
import { TunnelMonitoringData } from './entities/tunnel-monitoring.entity'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([MqttMessage, TunnelMonitoringData]),
    ClientsModule.registerAsync([
      {
        name: 'MQTT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.MQTT,
          options: {
            url: config.get<string>('mqtt.brokerUrl'),
            username: config.get<string>('mqtt.username'),
            password: config.get<string>('mqtt.password'),
            clientId: config.get<string>('mqtt.clientId'),
          },
        }),
      },
    ]),
  ],
  controllers: [MqttController, MqttHttpController],
  providers: [MqttService, TunnelMonitoringService],
  exports: [MqttService, TunnelMonitoringService, ClientsModule],
})
export class MqttModule {}
