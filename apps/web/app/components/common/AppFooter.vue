<template>
  <footer
    class="h-12 border-t bg-card flex items-center justify-between px-4 lg:px-6 text-sm text-muted-foreground shrink-0"
  >
    <div class="flex items-center gap-4">
      <span>
        &copy; {{ new Date().getFullYear() }} {{ brandName }}. All rights
        reserved.
      </span>
    </div>
    <div class="flex items-center gap-4">
      <a
        href="https://halolight.docs.h7ml.cn/"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-foreground transition-colors"
      >
        在线文档
      </a>
      <NuxtLink
        to="/terms"
        class="hover:text-foreground transition-colors"
      >
        服务条款
      </NuxtLink>
      <NuxtLink
        to="/privacy"
        class="hover:text-foreground transition-colors"
      >
        隐私政策
      </NuxtLink>
      <span class="hidden sm:inline">v1.0.0</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
  const config = useRuntimeConfig()
  const brandName = computed(() => config.public.brandName)
</script>
