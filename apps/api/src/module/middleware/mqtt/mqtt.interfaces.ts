import { ModuleMetadata, Type } from '@nestjs/common'
import { IClientOptions } from 'mqtt'

export interface MqttModuleOptions {
  brokerUrl: string
  username?: string
  password?: string
  clientId?: string
  clean?: boolean
  reconnectPeriod?: number
  connectTimeout?: number
  /** 默认 QoS 级别 */
  qos?: 0 | 1 | 2
  /** 额外的 mqtt.js 选项 */
  extra?: IClientOptions
}

export interface MqttOptionsFactory {
  createMqttOptions(): Promise<MqttModuleOptions> | MqttModuleOptions
}

export interface MqttModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  useExisting?: Type<MqttOptionsFactory>
  useClass?: Type<MqttOptionsFactory>
  useFactory?: (
    ...args: any[]
  ) => Promise<MqttModuleOptions> | MqttModuleOptions
  inject?: any[]
}
