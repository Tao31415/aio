<script setup lang="ts">
  import type { NuxtError } from '#app'

  defineProps({
    error: {
      type: Object as PropType<NuxtError>,
      required: true,
    },
  })
  useHead({
    htmlAttrs: {
      lang: 'en',
    },
  })
  useSeoMeta({
    title: 'Page not found',
    description: 'We are sorry but this page could not be found.',
  })

  const { data: navigation } = await useAsyncData(
    'navigation',
    () => queryCollectionNavigation('docs'),
    {
      transform: (data) =>
        data.find((item) => item.path === '/docs')?.children || [],
    }
  )
  const { data: files } = useLazyAsyncData(
    'search',
    () => queryCollectionSearchSections('docs'),
    {
      server: false,
    }
  )

  const links = [
    {
      label: 'Docs',
      icon: 'i-lucide-book',
      to: '/docs/getting-started',
    },
    {
      label: 'Pricing',
      icon: 'i-lucide-credit-card',
      to: '/pricing',
    },
    {
      label: 'Blog',
      icon: 'i-lucide-pencil',
      to: '/blog',
    },
  ]
</script>

<template>
  <div>
    <AppHeader />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="links"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <UToaster />
  </div>
</template>

<script lang="ts">
  function getStatusMessage(code: number): string {
    const messages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Page Not Found',
      405: 'Method Not Allowed',
      408: 'Request Timeout',
      409: 'Conflict',
      410: 'Gone',
      418: "I'm a teapot",
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Server Error',
      501: 'Not Implemented',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    }
    return messages[code] || 'Error'
  }
</script>
