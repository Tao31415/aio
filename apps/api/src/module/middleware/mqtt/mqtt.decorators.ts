import { SetMetadata } from '@nestjs/common'

export const MQTT_SUBSCRIBE_KEY = 'mqtt:subscribe'

/**
 * 标记该方法需要订阅某个主题
 * @param topic MQTT 主题，支持通配符 + 和 #
 */
export const Subscribe = (topic: string) =>
  SetMetadata(MQTT_SUBSCRIBE_KEY, topic)
