import { getAuthClient } from './session-manager'

export const useAuthActions = () => {
  const client = getAuthClient()
  const store = useAuthStore()
  const logger = useLogger('auth')

  const signOut = async ({
    redirectTo = '/',
    redirect = true,
  }: SignOutOptions = {}) => {
    logger.info({ redirectTo: Boolean(redirectTo) }, 'auth.signOut started')
    await client.signOut({
      fetchOptions: {
        onSuccess: async () => {
          store.reset()
          logger.info('auth.signOut success: store reset')
          if (redirect && redirectTo) {
            logger.debug('auth.signOut redirecting')
            await navigateTo(redirectTo)
          }
        },
      },
    })
  }

  return {
    signIn: client.signIn,
    signUp: client.signUp,
    requestPasswordReset: client.requestPasswordReset,
    resetPassword: client.resetPassword,
    signOut,
  }
}
