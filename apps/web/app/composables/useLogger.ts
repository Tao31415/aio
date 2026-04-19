import pino, { type Logger } from 'pino'

const fallbackLogger = pino({ level: 'info' })

export const useLogger = (tag?: string) => {
  const logger =
    (tryUseNuxtApp()?.$logger as Logger | undefined) ?? fallbackLogger

  if (!tag) return logger

  return logger.child({ tag })
}
