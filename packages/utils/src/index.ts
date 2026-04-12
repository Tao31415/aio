import { createLogger } from './logger.js'

const logger = createLogger('utils:fn')

export function fn() {
  logger.info('fn 方法被调用')
  return 'Hello, tsdown!'
}
