export const useAuthStatus = () => {
  const store = useAuthStore()

  return {
    session: computed(() => store.session),
    user: computed(() => store.user),
    globalError: computed(() => store.globalError),
    isAuthenticated: computed(() => store.isAuthenticated),
    isInitialized: computed(() => store.isInitialized),
    isLoading: computed(() => store.isLoading),
    clearError: store.clearError,
  }
}
