/**
 * 认证中间件
 * - 未登录：只允许访问 guestOnlyPaths 中的页面
 * - 已登录：访问 guestOnlyPaths 页面跳转到 dashboard
 */
import { ensureSession } from '~/composables/auth/session-manager'

const guestOnlyPaths = new Set(['/login'])

export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (!import.meta.client) return

  const logger = useLogger('auth.global')
  const { isAuthenticated } = useAuth()

  await ensureSession({
    reason: `auth.middleware:${to.fullPath}`,
  })

  const isGuestOnlyPage = guestOnlyPaths.has(to.path)

  // 未登录：只允许访问 guest 页面
  if (!isAuthenticated.value) {
    if (!isGuestOnlyPage) {
      logger.info(
        { path: to.fullPath },
        'Guest accessing protected route, redirecting to login'
      )
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    }
    return
  }

  // 已登录：访问 guest 页面跳转到 dashboard
  if (isGuestOnlyPage) {
    logger.info(
      { path: to.fullPath },
      'Authenticated user accessing guest route, redirect to dashboard'
    )
    return navigateTo('/dashboard')
  }
})
