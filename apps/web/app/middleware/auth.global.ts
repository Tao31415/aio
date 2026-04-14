/**
 * 认证中间件
 * 保护需要登录的路由
 */
export default defineNuxtRouteMiddleware((to, _from) => {
  const auth = useAuthStore()

  // 不需要认证的路由
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
  ]
  const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route))

  // 未登录用户访问受保护路由
  if (!auth.isAuthenticated && !isPublicRoute) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  // 已登录用户访问认证页面
  if (
    auth.isAuthenticated &&
    isPublicRoute &&
    to.path !== '/terms' &&
    to.path !== '/privacy'
  ) {
    return navigateTo('/')
  }
})
