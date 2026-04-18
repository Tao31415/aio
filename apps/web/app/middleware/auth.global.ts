/**
 * 认证中间件
 * 保护需要登录的路由
 * 使用 better-auth client 获取会话状态
 */
export default defineNuxtRouteMiddleware(async (to, _from) => {
  // 仅在客户端执行
  if (!import.meta.client) return

  const { isAuthenticated, isInitialized, getSession } = useAuth()

  if (!isInitialized.value) {
    await getSession()
  }

  // 公开路由（不需要认证）
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
  ]
  const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route))

  // 未登录用户访问受保护路由 → 重定向到登录页
  // if (!isAuthenticated.value && !isPublicRoute) {
  //   return navigateTo({
  //     path: '/login',
  //     query: { redirect: to.fullPath },
  //   })
  // }

  // 已登录用户访问认证页面（登录/注册等）→ 重定向到首页
  if (
    isAuthenticated.value &&
    isPublicRoute &&
    to.path !== '/terms' &&
    to.path !== '/privacy'
  ) {
    return navigateTo('/')
  }
})
