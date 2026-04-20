<template>
  <AuthShell
    left-gradient="bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600"
    left-title="找回密码"
    left-emoji="🔑"
    left-description="别担心，我们会帮助您重新获得账户访问权限。只需几个简单的步骤即可完成。"
    mobile-subtitle="重置密码，找回您的账户"
    :left-features="[
      { icon: '📧', text: '输入注册邮箱地址' },
      { icon: '🔗', text: '接收安全重置链接' },
      { icon: '🔐', text: '设置新的安全密码' },
      { icon: '✅', text: '重新登录您的账户' },
    ]"
    :halo-colors="[
      'from-sky-400/30 to-cyan-400/30',
      'from-emerald-400/25 to-teal-400/25',
      'from-blue-400/20 to-indigo-400/20',
    ]"
    :top-line-gradient="
      isSubmitted
        ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'
        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600'
    "
  >
    <div class="space-y-6">
      <!-- 成功状态 -->
      <template v-if="isSubmitted">
        <div class="text-center">
          <div
            class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl mb-6"
          >
            <svg
              class="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          </div>
          <h1
            class="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3"
          >
            邮件已发送
          </h1>
          <p class="text-sm text-muted-foreground">
            我们已向
            <span class="font-semibold text-foreground">{{ email }}</span>
            发送了密码重置链接
          </p>
        </div>
        <div
          class="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50"
        >
          <p class="text-sm text-muted-foreground leading-relaxed">
            📧 请检查您的邮箱并点击链接重置密码
            <br />
            📁 如果没有收到，请检查垃圾邮件文件夹
            <br />
            ⏰ 链接将在15分钟后过期
          </p>
        </div>
        <button
          type="button"
          @click="resetForm"
          class="w-full h-11 text-sm border border-border/50 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all"
        >
          重新发送
        </button>
      </template>

      <!-- 表单状态 -->
      <template v-else>
        <div class="text-center">
          <div
            class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl mb-6"
          >
            <svg
              class="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect
                width="20"
                height="16"
                x="2"
                y="4"
                rx="2"
              />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1
            class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3"
          >
            忘记密码？
          </h1>
          <p class="text-sm text-muted-foreground leading-relaxed">
            别担心，输入您的邮箱地址
            <br />
            我们将发送密码重置链接
          </p>
        </div>

        <form
          @submit.prevent="handleSubmit"
          class="space-y-4"
        >
          <div
            v-if="globalError || localError"
            class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            {{ globalError || localError }}
          </div>

          <div class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">
              邮箱地址
            </label>
            <div class="relative">
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect
                  width="20"
                  height="16"
                  x="2"
                  y="4"
                  rx="2"
                />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                v-model="email"
                type="email"
                required
                class="w-full pl-10 pr-3 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full h-12 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg
              v-if="loading"
              class="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span>{{ loading ? '发送中...' : '发送重置链接' }}</span>
            <span v-if="!loading">→</span>
          </button>

          <div
            class="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50"
          >
            <svg
              class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
              />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <div class="text-xs text-muted-foreground leading-relaxed">
              <p class="font-medium text-foreground mb-1">安全提示</p>
              重置链接将在15分钟后过期，请及时查收邮件并完成密码重置。
            </div>
          </div>
        </form>
      </template>

      <div class="text-center">
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium transition-colors group"
        >
          <svg
            class="h-4 w-4 group-hover:-translate-x-1 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          返回登录
        </NuxtLink>
      </div>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
  definePageMeta({ layout: 'auth', auth: 'guest' })

  const { requestPasswordReset, clearError, globalError, loading } = useAuth()
  const toast = useMyToast()

  const email = ref('')
  const isSubmitted = ref(false)
  const localError = ref('')

  function resetForm() {
    isSubmitted.value = false
    email.value = ''
    localError.value = ''
  }

  async function handleSubmit() {
    localError.value = ''
    if (!email.value) {
      localError.value = '请输入邮箱地址'
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      localError.value = '请输入有效的邮箱地址'
      return
    }
    try {
      await requestPasswordReset({
        email: email.value,
        redirectTo: `${window.location.origin}/reset-password`,
      })
      isSubmitted.value = true
      toast.success('重置链接已发送到您的邮箱')
    } catch {
      // 错误已在 store 中处理
    }
  }

  onMounted(() => {
    clearError()
  })
</script>
