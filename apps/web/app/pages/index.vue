<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <div
        class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"
      />
      <p class="text-muted-foreground">正在跳转到仪表板...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    auth: 'user',
  })

  // 自动跳转到仪表板
  onMounted(() => {
    navigateTo('/dashboard')
  })
</script>
