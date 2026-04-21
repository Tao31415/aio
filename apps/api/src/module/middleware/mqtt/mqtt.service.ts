/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from '@nestjs/common'
import { connect, MqttClient, IClientPublishOptions } from 'mqtt'
import type { MqttModuleOptions } from './mqtt.interfaces'

interface Handler {
  target: any
  method: string
}

/**
 * MQTT Service
 * 核心连接管理与消息路由，支持 @Subscribe 装饰器声明式订阅
 */
@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name)
  private mqttClient: MqttClient | null = null
  private handlerMap = new Map<string, Handler[]>()
  private pendingSubscriptions: Set<string> = new Set()
  private isConnected = false

  constructor(
    @Inject('MQTT_OPTIONS') private readonly options: MqttModuleOptions
  ) {}

  onModuleInit() {
    this.connect()
  }

  onModuleDestroy() {
    this.disconnect()
  }

  private connect() {
    const {
      brokerUrl,
      username,
      password,
      clientId,
      clean,
      reconnectPeriod,
      connectTimeout,
      extra,
    } = this.options

    this.mqttClient = connect(brokerUrl, {
      clientId:
        clientId || `nest-mqtt-${Math.random().toString(16).slice(3, 7)}`,
      clean: clean ?? true,
      reconnectPeriod: reconnectPeriod ?? 5000,
      connectTimeout: connectTimeout ?? 30000,
      username: username || undefined,
      password: password || undefined,
      ...extra,
    })

    this.mqttClient.on('connect', () => {
      this.isConnected = true
      this.logger.log('MQTT client connected')
      this.resubscribe()
    })

    this.mqttClient.on('error', (err) => {
      this.logger.error({ err }, 'MQTT client error')
    })

    this.mqttClient.on('reconnect', () => {
      this.isConnected = false
      this.logger.warn('MQTT client reconnecting...')
    })

    this.mqttClient.on('disconnect', () => {
      this.isConnected = false
    })

    this.mqttClient.on('message', (topic, payload) => {
      this.dispatchMessage(topic, payload)
    })
  }

  private disconnect() {
    if (this.mqttClient) {
      this.mqttClient.end()
      this.mqttClient = null
      this.isConnected = false
      this.logger.log('MQTT client disconnected')
    }
  }

  // ============ 路由注册 ============

  /**
   * 注册一个主题处理器（内部由 MqttExplorer 调用）
   */
  addHandler(topic: string, target: any, method: string) {
    if (!this.handlerMap.has(topic)) {
      this.handlerMap.set(topic, [])
      this.pendingSubscriptions.add(topic)
    }
    this.handlerMap.get(topic)!.push({ target, method })

    if (this.isConnected && this.mqttClient) {
      this.doSubscribe(topic)
    }

    this.logger.debug(`Registered handler for topic: ${topic}`)
  }

  private doSubscribe(topic: string, qos: 0 | 1 | 2 = 1) {
    if (!this.mqttClient) return
    this.mqttClient.subscribe(topic, { qos }, (err) => {
      if (err) {
        this.logger.error({ err, topic }, 'MQTT subscribe failed')
      } else {
        this.logger.debug(`Subscribed to topic: ${topic} (QoS ${qos})`)
      }
    })
  }

  private resubscribe() {
    for (const topic of this.pendingSubscriptions) {
      this.doSubscribe(topic)
    }
  }

  // ============ 消息分发 ============

  private dispatchMessage(topic: string, payload: Buffer) {
    const matched = this.matchHandlers(topic)
    if (matched.length === 0) {
      this.logger.debug({ topic }, 'No handler matched, ignoring message')
      return
    }

    let message: any
    try {
      message = JSON.parse(payload.toString('utf-8'))
    } catch {
      message = payload.toString('utf-8')
    }

    for (const { target, method } of matched) {
      this.invokeHandler(target, method, topic, message)
    }
  }

  private invokeHandler(
    target: any,
    method: string,
    topic: string,
    message: any
  ) {
    try {
      const methodFn = target[method]
      methodFn.call(target, topic, message)
    } catch (err) {
      this.logger.error({ err, topic }, 'Failed to invoke MQTT handler')
    }
  }

  /**
   * 通配符匹配 + 和 #
   * + 匹配单级，# 匹配任意级别（只能在末尾）
   */
  matchHandlers(incomingTopic: string): Handler[] {
    const matched: Handler[] = []

    for (const [subscription, handlers] of this.handlerMap.entries()) {
      if (this.topicMatch(subscription, incomingTopic)) {
        matched.push(...handlers)
      }
    }

    return matched
  }

  private topicMatch(subscription: string, incoming: string): boolean {
    if (subscription === '#') return true
    if (subscription === incoming) return true

    const subParts = subscription.split('/')
    const incParts = incoming.split('/')

    for (let i = 0; i < subParts.length; i++) {
      const sub = subParts[i]
      if (sub === '#') return true
      if (sub === '+') continue
      if (sub !== incParts[i]) return false
    }

    return subParts.length === incParts.length
  }

  // ============ 发布 ============

  async publish(
    topic: string,
    message: string | object,
    options?: IClientPublishOptions
  ) {
    if (!this.mqttClient) {
      throw new Error('MQTT client not connected')
    }

    const payload =
      typeof message === 'string' ? message : JSON.stringify(message)

    return new Promise<void>((resolve, reject) => {
      this.mqttClient!.publish(
        topic,
        payload,
        { qos: 1, ...options },
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })
  }
}
