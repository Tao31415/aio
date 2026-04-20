import type { Session, User } from '~/plugins/auth.plugin'

export type AuthStatus =
  | 'unknown'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'

export interface AuthState {
  user: User | null
  session: Session | null
  status: AuthStatus
  globalError: string | null
}

const initialState: AuthState = {
  user: null,
  session: null,
  status: 'unknown',
  globalError: null,
}

export const useAuthStore = defineStore('auth', () => {
  const logger = useLogger('auth.store')
  const authState = reactive(initialState)

  const loading = computed(() => authState.status === 'loading')
  const isAuthenticated = computed(() => authState.status === 'authenticated')
  const isReady = computed(
    () =>
      authState.status === 'authenticated' ||
      authState.status === 'unauthenticated'
  )

  function setLoading(reason = 'unknown') {
    authState.status = 'loading'
    logger.debug({ reason }, 'Auth loading state changed')
  }

  function setSession(data: { session?: Session | null; user?: User | null }) {
    if (!data?.session) {
      setUnauthenticated('empty-session')
      return
    }

    authState.user = data?.user ?? null
    authState.session = data.session
    authState.status = 'authenticated'
    logger.info(
      {
        status: authState.status,
        hasSession: !!data.session,
        hasUser: !!data.user,
        userId: data.user?.id,
      },
      'Auth session updated'
    )
  }

  function setUnauthenticated(reason = 'unknown') {
    authState.user = null
    authState.session = null
    authState.status = 'unauthenticated'
    logger.info({ reason }, 'Auth session cleared')
  }

  function markUnknown(reason = 'unknown') {
    authState.user = null
    authState.session = null
    authState.status = 'unknown'
    logger.debug({ reason }, 'Auth state marked unknown')
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
    clearError()
    setUnauthenticated('reset')
  }

  return {
    ...toRefs(authState),
    loading,
    isAuthenticated,
    isReady,
    authState,
    setError,
    clearError,
    setSession,
    setLoading,
    setUnauthenticated,
    markUnknown,
    reset,
  }
})
