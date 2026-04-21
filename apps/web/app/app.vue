<template>
  <UApp :toaster="{ position: 'bottom-right', duration: 4000 }">
    <NuxtLoadingIndicator />
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
  </UApp>
</template>

<script setup lang="ts">
  const { isAuthenticated } = useAuth()

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
</script>
