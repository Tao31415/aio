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
  const authState = reactive(initialState)
  const isInitialized = ref(false)
  function setInitialized() {
    isInitialized.value = true
  }
  function sessionLoading(result: boolean) {
    authState.isLoading = result
  }

  function setSession(data: { session?: Session | null; user?: User | null }) {
    authState.user = data?.user ?? null
    authState.session = data?.session ?? null
    authState.isAuthenticated = !!data.session
  }

  let errorTimer: ReturnType<typeof setTimeout> | null = null
  function setError(error: string | null) {
    authState.globalError = error
    if (errorTimer) clearTimeout(errorTimer)
    errorTimer = setTimeout(() => {
      clearError()
    }, 5000)
  }

  function clearError() {
    authState.globalError = null
  }

  function reset() {
    authState.isAuthenticated = false
    authState.isLoading = false
    authState.session = null
    authState.user = null
  }

  return {
    ...authState,
    authState,
    isInitialized,
    setError,
    clearError,
    setSession,
    reset,
    sessionLoading,
    setInitialized,
  }
})
