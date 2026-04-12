<script setup lang="ts">
  import { fn } from '@aio/utils'

  const config = useRuntimeConfig()
  const { data, pending, error } = await useFetch(`${config.public.apiBase}`)

  const logger = useLogger()

  onMounted(() => {
    logger.info({ user: 'tester' }, '组件已挂载')
  })

  const handleClick = () => {
    try {
      // 模拟错误
      throw new Error('Oops!')
    } catch (err) {
      logger.error(err, '点击事件发生错误')
    }
  }
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <button @click="handleClick">打个日志</button>
    <p>WEB_ENV: {{ config.public.env }}</p>
    <p>API 响应:</p>
    <pre>{{
      pending
        ? '加载中...'
        : error
          ? error.message
          : JSON.stringify(data, null, 2)
    }}</pre>
    <p>Utils fn(): {{ fn() }}</p>
    <NuxtWelcome />
  </div>
</template>
