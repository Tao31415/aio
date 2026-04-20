/**
 * Better Auth Client 插件
 * 初始化 better-auth 客户端实例
 */
import { createAuthClient } from 'better-auth/client'
import {
  adminClient,
  usernameClient,
  multiSessionClient,
} from 'better-auth/client/plugins'
import { ensureSession } from '~/composables/auth/session-manager'

export type AuthClient = ReturnType<typeof createAuthClient<typeof _typeConfig>>
export type Session = AuthClient['$Infer']['Session']['session']
export type User = AuthClient['$Infer']['Session']['user']

// need improve
const _typeConfig = {
  baseURL: '',
  basePath: '',
  appName: 'aio',
  logger: {
    disabled: false,
    disableColors: false,
    level: 'debug',
    log: (level: any, message: any, ...args: any) => {
      // Custom logging implementation
      console.log(`[${level}] ${message}`, ...args)
    },
  },
  session: {
    storageKey: 'better-auth-session',
    fetchDataOnMount: true,
  },
  fetchOptions: {
    credentials: 'include' as const,
  },
  plugins: [adminClient(), usernameClient(), multiSessionClient()],
}

export default defineNuxtPlugin(async (_) => {
  const config = useRuntimeConfig()
  const logger = useLogger('auth')

  const authClient = createAuthClient({
    baseURL: config.public.apiBase,
    basePath: config.public.authBasePath,
    appName: 'aio',
    logger: {
      disabled: false,
      disableColors: false,
      level: 'debug',
      log: (level: any, message: any, ...args: any) => {
        logger.info(`[${level}] ${message}`, ...args)
      },
    },
    session: {
      storageKey: 'better-auth-session',
      fetchDataOnMount: true,
    },
    fetchOptions: {
      credentials: 'include',
    },
    plugins: [adminClient(), usernameClient(), multiSessionClient()],
  })
  if (import.meta.client) {
    logger.debug('auth.sessionSignal listener registered')
    authClient.$store.listen('$sessionSignal', (signal) => {
      if (!signal) return
      logger.debug({ signal }, 'auth.sessionSignal received')
      void ensureSession({
        client: authClient,
        force: true,
        reason: 'auth.session-signal',
      })
    })
  }
  await ensureSession({
    client: authClient,
    reason: 'auth.plugin-init',
  })

  return {
    provide: {
      auth: authClient,
    },
  }
})
