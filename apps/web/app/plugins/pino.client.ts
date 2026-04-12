import pino from 'pino'

export default defineNuxtPlugin(() => {
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
            },
          }
        : undefined,
  })

  return {
    provide: {
      logger,
    },
  }
})
