<script setup lang="ts">
  import { formatTimeAgo } from '@vueuse/core'
  import type { Notification } from '~/types'

  const { isNotificationsSlideoverOpen } = useDashboard()

  const { data: notifications } =
    await useFetch<Notification[]>('/api/notifications')
</script>

<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="通知"
    :ui="{
      title: 'font-semibold text-foreground',
    }"
  >
    <template #body>
      <div class="space-y-1">
        <NuxtLink
          v-for="notification in notifications"
          :key="notification.id"
          :to="`/inbox?id=${notification.id}`"
          class="px-3 py-3 rounded-lg hover:bg-accented/50 flex items-center gap-3 relative -mx-3 first:-mt-3 last:-mb-3 transition-colors duration-150"
        >
          <UChip
            color="error"
            :show="!!notification.unread"
            inset
          >
            <UAvatar
              v-bind="notification.sender.avatar"
              :alt="notification.sender.name"
              size="md"
            />
          </UChip>

          <div class="text-sm flex-1 min-w-0">
            <p class="flex items-center justify-between gap-2">
              <span class="text-foreground font-medium truncate">
                {{ notification.sender.name }}
              </span>

              <time
                :datetime="notification.date"
                class="text-muted text-xs shrink-0"
                v-text="formatTimeAgo(new Date(notification.date))"
              />
            </p>

            <p class="text-muted truncate">
              {{ notification.body }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </template>
  </USlideover>
</template>
