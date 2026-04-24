<script setup lang="ts">
  import { APP_ROUTE_MAP } from '~/utils/route-config'

  definePageMeta({
    title: APP_ROUTE_MAP['/']!.title,
    icon: APP_ROUTE_MAP['/']!.icon,
    layout: 'dashboard',
    auth: 'user',
  })

  onMounted(() => {
    navigateTo('/dashboard', { replace: true })
  })
</script>

<template>
  <NuxtPage />
</template>
