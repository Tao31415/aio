<template>
  <Teleport to="body">
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto bg-card border rounded-lg shadow-lg p-4 flex items-start gap-3',
            toast.type === 'success' && 'border-green-500',
            toast.type === 'error' && 'border-destructive',
            toast.type === 'warning' && 'border-amber-500',
            toast.type === 'info' && 'border-blue-500',
          ]"
        >
          <!-- 图标 -->
          <div
            :class="[
              'shrink-0',
              toast.type === 'success' && 'text-green-500',
              toast.type === 'error' && 'text-destructive',
              toast.type === 'warning' && 'text-amber-500',
              toast.type === 'info' && 'text-blue-500',
            ]"
          >
            <svg
              v-if="toast.type === 'success'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'warning'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <p
              v-if="toast.title"
              class="font-medium text-foreground"
            >
              {{ toast.title }}
            </p>
            <p class="text-sm text-muted-foreground">{{ toast.message }}</p>
          </div>

          <!-- 关闭按钮 -->
          <button
            class="shrink-0 p-1 rounded hover:bg-muted transition-colors"
            @click="removeToast(toast.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  const { toasts, removeToast } = useMyToast()
</script>
