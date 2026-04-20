/**
 * 认证中间件
 * 基于 route meta 的 user / guest 访问控制
 */
import { ensureSession } from '~/composables/auth/session-manager'

export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (!import.meta.client) return

  const routeAuth = to.meta.auth
  if (routeAuth !== 'user' && routeAuth !== 'guest') return

  const redirectPath = '/dashboard'
  const logger = useLogger('auth.global')
  const { isAuthenticated } = useAuth()

  await ensureSession({
    reason: `auth.middleware:${routeAuth}:${to.fullPath}`,
  })

  if (routeAuth === 'user' && !isAuthenticated.value) {
    logger.info(
      {
        path: to.fullPath,
      },
      'Guest user accessing protected route, redirecting to login'
    )
    await navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  if (routeAuth === 'guest' && isAuthenticated.value) {
    logger.info(
      {
        path: to.fullPath,
      },
      'Authenticated user accessing guest route, redirecting to dashboard'
    )
    await navigateTo(redirectPath)
    return
  }
})
