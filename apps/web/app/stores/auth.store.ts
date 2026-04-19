import type { Session, User } from '~/plugins/auth.plugin'

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  globalError: string | null
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  globalError: null,
}

export const useAuthStore = defineStore('auth', () => {
  const logger = useLogger('auth.store')
  const authState = reactive(initialState)
  function sessionLoading(result: boolean) {
    authState.isLoading = result
    logger.debug({ isLoading: result }, 'Auth loading state changed')
  }

  function setSession(data: { session?: Session | null; user?: User | null }) {
    authState.user = data?.user ?? null
    authState.session = data?.session ?? null
    authState.isAuthenticated = !!data.session
    logger.info(
      {
        hasSession: !!data.session,
        hasUser: !!data.user,
        userId: data.user?.id,
      },
      'Auth session updated'
    )
  }

  let errorTimer: ReturnType<typeof setTimeout> | null = null
  function setError(error: string | null) {
    authState.globalError = error
    if (error) {
      logger.error({ error }, 'Auth error set')
      if (errorTimer) clearTimeout(errorTimer)
      errorTimer = setTimeout(() => {
        clearError()
      }, 5000)
    }
  }

  function clearError() {
    authState.globalError = null
    logger.debug('Auth error cleared')
  }

  function reset() {
    logger.info('Auth state reset')
    Object.assign(authState, initialState)
  }

  return {
    ...authState,
    authState,
    setError,
    clearError,
    setSession,
    reset,
    sessionLoading,
  }
})
