import pino from 'pino'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const logger = pino({
    level: config.public.logLevel || 'info',
    browser: {
      asObject: true,
    },
  })

  return {
    provide: {
      logger,
    },
  }
})
