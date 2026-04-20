import pino from 'pino'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const isDev = import.meta.dev

  const logger = pino({
    level: isDev ? 'debug' : (config.public.logLevel || 'info'),
    browser: {
      asObject: false,
    },
  })

  return {
    provide: {
      logger,
    },
  }
})
