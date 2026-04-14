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

  // 全局初始化
  const config = useRuntimeConfig()

  // 初始化主题
  const { initTheme } = useTheme()

  // 初始化 KeepAlive
  const keepAlive = useKeepAlive()

  // 初始化 Mock 数据（客户端）
  onMounted(() => {
    initTheme()
    if (config.public.mock) {
      setupMock()
    }
  })
</script>
