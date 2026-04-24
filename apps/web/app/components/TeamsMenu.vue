<script setup lang="ts">
  interface Props {
    collapsed?: boolean
    isMobile?: boolean
  }
  withDefaults(defineProps<Props>(), {
    collapsed: false,
    isMobile: false,
  })
  const config = useRuntimeConfig()
  const brandName = computed(() => config.public.brandName)
</script>

<template>
  <UButton
    to="/dashboard"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    class="data-[state=open]:bg-elevated"
    :class="[!collapsed ? 'py-3' : 'p-2']"
    :ui="{
      trailingIcon: 'text-dimmed',
      base: 'hover:bg-transparent active:bg-transparent',
    }"
  >
    <template #leading>
      <div
        class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0"
      >
        <svg
          viewBox="0 0 24 24"
          class="w-5 h-5 text-white"
          fill="currentColor"
        >
          <path
            d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18l7.5 3.82v7l-7.5 3.75L4.5 15V9.82l7.5-3.64z"
          />
          <path
            d="M12 6l-5 2.5v5L12 16l5-2.5v-5L12 6z"
            class="opacity-60"
          />
        </svg>
      </div>
    </template>
    <span
      v-if="!collapsed"
      class="text-base font-semibold"
    >
      {{ brandName }}
    </span>
  </UButton>
</template>
