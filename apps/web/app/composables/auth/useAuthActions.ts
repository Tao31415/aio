import { getAuthClient } from './session-manager'
import type { User } from '~/types'

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

  /**
   * 更新用户资料（昵称、头像等）
   */
  async function updateProfile(options: {
    name?: string
    image?: string
  }): Promise<{ user: User | null; error?: unknown }> {
    try {
      logger.debug(options, 'updateProfile called')
      const { data, error } = await client.updateUser(options)

      if (error) {
        logger.error({ err: error }, 'Failed to update profile')
        return { user: null, error }
      }

      if (!data) {
        logger.error('Failed to update profile: no data returned')
        return { user: null, error: new Error('更新资料失败') }
      }

      logger.info('Profile updated successfully')
      return { user: data as User }
    } catch (err) {
      logger.error({ err }, 'Failed to update profile')
      return { user: null, error: err }
    }
  }

  /**
   * 修改当前用户密码
   */
  async function changePassword(options: {
    currentPassword: string
    newPassword: string
    revokeOtherSessions?: boolean
  }): Promise<{ success: boolean; error?: unknown }> {
    try {
      logger.debug({}, 'changePassword called')
      const { error } = await client.changePassword({
        currentPassword: options.currentPassword,
        newPassword: options.newPassword,
        revokeOtherSessions: options.revokeOtherSessions,
      })

      if (error) {
        logger.error({ err: error }, 'Failed to change password')
        return { success: false, error }
      }

      logger.info('Password changed successfully')
      return { success: true }
    } catch (err) {
      logger.error({ err }, 'Failed to change password')
      return { success: false, error: err }
    }
  }

  return {
    signIn: client.signIn,
    signUp: client.signUp,
    requestPasswordReset: client.requestPasswordReset,
    resetPassword: client.resetPassword,
    signOut,
    updateProfile,
    changePassword,
  }
}
