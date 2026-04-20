<script setup lang="ts">
  import type { NuxtError } from '#app'

  defineProps<{
    error: NuxtError
  }>()

  const handleError = () => clearError({ redirect: '/' })

  const errorMessages: Record<number, { title: string; description: string }> =
    {
      400: { title: 'Bad Request', description: '请求格式有误，请检查输入' },
      401: { title: 'Unauthorized', description: '请先登录后再访问' },
      403: { title: 'Forbidden', description: '您没有权限访问此页面' },
      404: { title: 'Page Not Found', description: '页面不存在或已被移除' },
      405: { title: 'Method Not Allowed', description: '请求方法不被允许' },
      408: { title: 'Request Timeout', description: '请求超时，请稍后重试' },
      500: { title: 'Server Error', description: '服务器发生错误，请稍后重试' },
      502: { title: 'Bad Gateway', description: '网关错误，服务暂时不可用' },
      503: {
        title: 'Service Unavailable',
        description: '服务暂时不可用，请稍后重试',
      },
      504: { title: 'Gateway Timeout', description: '网关超时，请稍后重试' },
    }

  const getErrorInfo = (code: number | undefined) => {
    if (code === undefined) {
      return {
        title: 'Unknown Error',
        description: '发生未知错误，请稍后重试',
      }
    }
    return (
      errorMessages[code] || {
        title: 'Unknown Error',
        description: '发生未知错误，请稍后重试',
      }
    )
  }
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="text-center max-w-md w-full">
      <!-- Error Icon -->
      <div class="relative mx-auto w-32 h-32 mb-8">
        <div
          class="absolute inset-0 bg-destructive/10 rounded-full animate-pulse"
        />
        <div
          class="absolute inset-4 bg-destructive/20 rounded-full animate-bounce"
          style="animation-duration: 2s"
        />
        <div
          class="absolute inset-0 flex items-center justify-center bg-background rounded-full border-4 border-destructive/20"
        >
          <span class="text-5xl font-bold text-destructive">
            {{ error.statusCode || 500 }}
          </span>
        </div>
      </div>

      <!-- Error Info -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-foreground mb-2">
          {{ getErrorInfo(error.status).title }}
        </h1>
        <p class="text-muted-foreground">
          {{ getErrorInfo(error.status).description }}
        </p>
      </div>

      <!-- Error Message (Development Only) -->
      <div
        v-if="error.message && error.statusCode === 500"
        class="mb-8 p-4 bg-muted/50 rounded-lg text-left"
      >
        <p class="text-sm text-muted-foreground font-mono break-all">
          {{ error.message }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          @click="handleError"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          返回首页
        </button>

        <NuxtLink
          to="/login"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-input bg-background rounded-lg font-medium hover:bg-accent transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          登录
        </NuxtLink>
      </div>

      <!-- Footer Tips -->
      <p class="mt-12 text-sm text-muted-foreground">
        如果问题持续存在，请联系管理员
      </p>
    </div>
  </div>
</template>
