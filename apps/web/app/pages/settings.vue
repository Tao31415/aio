<script setup lang="ts">
  import { APP_ROUTE_MAP } from '~/utils/route-config'

  definePageMeta({
    title: APP_ROUTE_MAP['/settings']!.title,
    icon: APP_ROUTE_MAP['/settings']!.icon,
    layout: 'dashboard',
    auth: 'user',
  })
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">系统设置</h1>
      <p class="text-muted">管理您的账户和系统偏好设置</p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <NuxtPage />
    </div>
  </div>
</template>
