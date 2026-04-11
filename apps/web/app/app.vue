<script setup lang="ts">
  import { fn } from '@aio/utils'

  const config = useRuntimeConfig()
  const { data, pending, error } = await useFetch(`${config.public.apiBase}`)
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
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
