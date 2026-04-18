import { Global, Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MQTT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.MQTT,
          options: {
            url: config.get<string>('mqtt.brokerUrl'),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MqttModule {}
