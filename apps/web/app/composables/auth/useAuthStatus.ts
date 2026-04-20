export const useAuthStatus = () => {
  const store = useAuthStore()

  return {
    status: computed(() => store.status),
    session: computed(() => store.session),
    user: computed(() => store.user),
    globalError: computed(() => store.globalError),
    isAuthenticated: computed(() => store.isAuthenticated),
    isReady: computed(() => store.isReady),
    loading: computed(() => store.loading),
    clearError: store.clearError,
  }
}
