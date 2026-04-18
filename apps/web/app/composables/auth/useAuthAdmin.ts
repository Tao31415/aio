const getAuthClient = () => {
  const { $auth } = useNuxtApp()
  if (!$auth) {
    throw new Error(
      'Auth client not initialized. Please ensure auth plugin is loaded.'
    )
  }
  return $auth
}

export const useAuthAdmin = () => {
  const client = getAuthClient()
  const store = useAuthStore()

  return {
    session: computed(() => store.session),
    user: computed(() => store.user),
    error: computed(() => store.globalError),
    isAuthenticated: computed(() => store.isAuthenticated),
    isInitialized: computed(() => store.isInitialized),
    isLoading: computed(() => store.isLoading),
    signIn: client.signIn,
    signUp: client.signUp,
    resetPassword: client.resetPassword,
    errorCodes: client.$ERROR_CODES,
    clearError: store.clearError,
    client,
  }
}
