<script setup lang="ts">
  const config = useRuntimeConfig()
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <p>WEB_ENV: {{ config.public.env }}</p>
    <NuxtWelcome />
  </div>
</template>
