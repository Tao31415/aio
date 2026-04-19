<template>
  <div>
    <NuxtLayout>
      <NuxtPage v-slot="{ Component }">
        <KeepAlive :include="keepAlive.includeKeys.value">
          <component
            :is="Component"
            :key="keepAlive.currentKey.value"
          />
        </KeepAlive>
      </NuxtPage>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
  import { setupMock } from '~/utils/mock'

  const { isAuthenticated } = useAuth()

  // 全局初始化
  const config = useRuntimeConfig()

  // 初始化主题
  const { initTheme } = useTheme()

  // 初始化 KeepAlive
  const keepAlive = useKeepAlive()

  // 公开路由列表
  const publicRoutes = ['/login']

  // 监听认证状态变化，未登录则重定向到登录页
  watch(isAuthenticated, (authenticated) => {
    if (
      !authenticated &&
      !publicRoutes.some((route) => route === useRoute().path)
    ) {
      navigateTo({ path: '/login' })
    }
  })

  // 初始化 Mock 数据（客户端）
  onMounted(() => {
    initTheme()
    if (config.public.mock) {
      setupMock()
    }
  })
</script>
