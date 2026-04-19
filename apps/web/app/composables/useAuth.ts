import type { RouteLocationRaw } from 'vue-router'
import { useAuthStatus } from './auth/useAuthStatus'
import { useAuthActions } from './auth/useAuthActions'

const getAuthClient = () => {
  const { $auth } = useNuxtApp()
  if (!$auth) {
    throw new Error(
      'Auth client not initialized. Please ensure auth plugin is loaded.'
    )
  }
  return $auth
}

export interface SignOutOptions {
  redirectTo?: RouteLocationRaw
  redirect?: boolean
}

export interface FetchSessionOptions {
  force?: boolean
}

export const useAuth = () => {
  const client = getAuthClient()
  const store = useAuthStore()
  const logger = useLogger('auth')
  const status = useAuthStatus()
  const actions = useAuthActions()

  const fetchSession = async (options: FetchSessionOptions = {}) => {
    const { force = false } = options

    if (store.isLoading && !force) {
      logger.debug('auth.fetchSession skipped: already loading')
      return
    }

    logger.debug({ force }, 'auth.fetchSession started')

    try {
      const { data, error } = await client.getSession()
      if (error) {
        logger.error({ error }, 'auth.fetchSession failed')
        store.reset()
        return { error }
      }
      store.setSession({ session: data?.session, user: data?.user })
    } catch (err) {
      logger.error({ err }, 'auth.fetchSession exception')
      store.reset()
      throw err
    } finally {
      store.sessionLoading(false)
    }
  }

  return {
    ...status,
    ...actions,
    errorCodes: client.$ERROR_CODES,
    fetchSession,
    client,
  }
}
