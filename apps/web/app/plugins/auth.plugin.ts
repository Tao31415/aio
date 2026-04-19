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
  const store = useAuthStore()

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
    authClient.$store.listen('$sessionSignal', async (signal) => {
      if (!signal) return
      logger.debug({ signal }, 'auth.sessionSignal received')
      try {
        const { data, error } = await authClient.getSession()
        if (error) {
          logger.error({ error }, 'auth.sessionSignal: getSession failed')
          store.reset()
          return
        }
        store.setSession({ session: data?.session, user: data?.user })
      } catch (err) {
        logger.error({ err }, 'auth.sessionSignal exception')
        store.reset()
      }
    })
  }
  await authClient.getSession()

  return {
    provide: {
      auth: authClient,
    },
  }
})
