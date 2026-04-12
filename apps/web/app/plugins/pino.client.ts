import pino from 'pino'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const logger = pino({
    level: config.public.LOG_LEVEL,
    browser: {
      // 浏览器中以 JSON 形式输出，便于调试
      asObject: true,
    },
  })

  return {
    provide: {
      logger,
    },
  }
})
