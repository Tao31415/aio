import type { Logger } from 'pino'

export const useLogger = (tag?: string) => {
  const logger = useNuxtApp().$logger as Logger

  if (!tag) return logger

  return logger.child({ tag })
}
