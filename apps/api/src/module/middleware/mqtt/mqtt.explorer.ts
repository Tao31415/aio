/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { DiscoveryService, Reflector } from '@nestjs/core'
import { MqttService } from './mqtt.service'
import { MQTT_SUBSCRIBE_KEY } from './mqtt.decorators'

/**
 * MQTT 主题探索器
 * 扫描所有 Provider 中带有 @Subscribe 装饰器的方法，并注册到 MqttService
 */
@Injectable()
export class MqttExplorer implements OnModuleInit {
  private readonly logger = new Logger(MqttExplorer.name)

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly mqttService: MqttService
  ) {}

  onModuleInit() {
    this.discoverHandlers()
  }

  private discoverHandlers() {
    let discoveredCount = 0
    let skippedCount = 0

    this.discoveryService.getProviders().forEach((wrapper) => {
      const instance = wrapper.instance

      // Skip invalid instances
      if (!instance || typeof instance !== 'object') {
        skippedCount++
        return
      }

      // Skip string instances (indicates placeholder)
      if (typeof instance === 'string') {
        skippedCount++
        return
      }

      // Skip internal NestJS components with RxJS observables
      if (
        instance.constructor &&
        instance.constructor.name &&
        (instance.constructor.name.includes('Router') ||
          instance.constructor.name.includes('Routes') ||
          instance.constructor.name.includes('Controller'))
      ) {
        skippedCount++
        return
      }

      try {
        const prototype = Object.getPrototypeOf(instance) as Record<
          string,
          Function
        >

        // Ensure prototype is valid
        if (!prototype || typeof prototype !== 'object') {
          skippedCount++
          return
        }

        const methodNames = Object.getOwnPropertyNames(prototype).filter(
          (name) =>
            name !== 'constructor' && typeof prototype[name] === 'function'
        )

        for (const methodName of methodNames) {
          const method = prototype[methodName]

          // Skip if method is not valid
          if (!method || typeof method !== 'function') continue

          const topic = this.reflector.get(MQTT_SUBSCRIBE_KEY, method)

          if (topic) {
            this.mqttService.addHandler(topic, instance, methodName)
            discoveredCount++
            this.logger.debug(
              `Discovered @Subscribe('${topic}') on ${instance.constructor.name}.${methodName}`
            )
          }
        }
      } catch {
        // Skip instances that cause errors during introspection
        skippedCount++
      }
    })

    this.logger.log(
      `MQTT explorer discovered ${discoveredCount} handler(s), skipped ${skippedCount} invalid`
    )
  }
}
