<template>
  <AuthShell
    left-gradient="bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700"
    left-title="重置密码"
    left-emoji="🔐"
    left-description="设置一个安全的新密码，保护您的账户安全。请确保密码足够复杂。"
    mobile-subtitle="设置您的新密码"
    :left-features="[
      { icon: '🔒', text: '使用至少 8 个字符' },
      { icon: '🔤', text: '混合大小写字母' },
      { icon: '🔢', text: '包含数字和符号' },
      { icon: '🛡️', text: '避免使用个人信息' },
    ]"
    :halo-colors="[
      'from-indigo-400/30 to-violet-400/30',
      'from-fuchsia-400/25 to-pink-400/25',
      'from-blue-400/20 to-cyan-400/20',
    ]"
    :show-left="!!token"
    :top-line-gradient="
      isSuccess
        ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'
        : !token
          ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500'
          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600'
    "
  >
    <div class="space-y-6">
      <!-- Token 无效 -->
      <template v-if="!token">
        <div class="text-center">
          <div
            class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl mb-6"
          >
            <svg
              class="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>
          <h1
            class="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3"
          >
            无效链接
          </h1>
          <p class="text-sm text-muted-foreground mb-6">
            密码重置链接无效或已过期
          </p>
        </div>
        <p class="text-sm text-muted-foreground text-center">
          请重新请求密码重置链接，或联系客服获取帮助。
        </p>
        <div class="flex flex-col gap-3">
          <NuxtLink
            to="/forgot-password"
            class="w-full h-12 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          >
            重新发送链接
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="w-full h-12 text-sm border border-border/50 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all flex items-center justify-center"
          >
            返回登录
          </NuxtLink>
        </div>
      </template>

      <!-- 成功状态 -->
      <template v-else-if="isSuccess">
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
            密码重置成功
          </h1>
          <p class="text-sm text-muted-foreground">您的密码已成功重置</p>
        </div>
        <div
          class="p-4 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50"
        >
          <p class="text-sm text-muted-foreground leading-relaxed">
            ✅ 您的密码已成功更新
            <br />
            🔐 现在可以使用新密码登录您的账户
          </p>
        </div>
        <NuxtLink
          to="/login"
          class="w-full h-12 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <span>前往登录</span>
          <span>→</span>
        </NuxtLink>
      </template>

      <!-- 重置表单 -->
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
              <path
                d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
              />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1
            class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3"
          >
            设置新密码
          </h1>
          <p class="text-sm text-muted-foreground">
            请设置您的新密码，确保密码足够安全
          </p>
        </div>

        <form
          @submit.prevent="handleSubmit"
          class="space-y-4"
        >
          <div
            v-if="auth.error || localError"
            class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            {{ auth.error || localError }}
          </div>

          <div class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">
              新密码
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
                  width="18"
                  height="11"
                  x="3"
                  y="11"
                  rx="2"
                />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pl-10 pr-10 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg
                  v-if="!showPassword"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>
                <svg
                  v-else
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
                  />
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                  <path
                    d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
                  />
                  <path d="m2 2 20 20" />
                </svg>
              </button>
            </div>
            <div
              v-if="form.password"
              class="space-y-2"
            >
              <div class="flex gap-1">
                <div
                  v-for="level in 4"
                  :key="level"
                  class="h-1.5 flex-1 rounded-full transition-colors"
                  :class="getStrengthColor(level)"
                />
              </div>
              <div class="grid grid-cols-2 gap-1">
                <div
                  v-for="rule in passwordRules"
                  :key="rule.label"
                  class="flex items-center gap-1 text-xs"
                  :class="
                    rule.test(form.password)
                      ? 'text-green-500'
                      : 'text-muted-foreground'
                  "
                >
                  <svg
                    v-if="rule.test(form.password)"
                    class="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <svg
                    v-else
                    class="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                  {{ rule.label }}
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">
              确认新密码
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
                  width="18"
                  height="11"
                  x="3"
                  y="11"
                  rx="2"
                />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full pl-10 pr-10 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg
                  v-if="!showConfirmPassword"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>
                <svg
                  v-else
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
                  />
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                  <path
                    d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
                  />
                  <path d="m2 2 20 20" />
                </svg>
              </button>
            </div>
            <div
              v-if="form.confirmPassword"
              class="flex items-center gap-1 text-xs"
              :class="
                form.password === form.confirmPassword
                  ? 'text-green-500'
                  : 'text-destructive'
              "
            >
              <svg
                v-if="form.password === form.confirmPassword"
                class="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <svg
                v-else
                class="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              {{
                form.password === form.confirmPassword
                  ? '密码匹配'
                  : '密码不匹配'
              }}
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
            <span>{{ loading ? '重置中...' : '重置密码' }}</span>
            <span v-if="!loading">→</span>
          </button>
        </form>

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
      </template>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
  definePageMeta({ layout: 'auth' })

  const route = useRoute()
  const auth = useAuthStore()
  const toast = useToast()

  const loading = ref(false)
  const isSuccess = ref(false)
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const localError = ref('')
  const form = reactive({ password: '', confirmPassword: '' })

  const token = computed(() => route.query.token as string)

  const passwordRules = [
    { label: '至少8个字符', test: (p: string) => p.length >= 8 },
    { label: '包含大写字母', test: (p: string) => /[A-Z]/.test(p) },
    { label: '包含小写字母', test: (p: string) => /[a-z]/.test(p) },
    { label: '包含数字', test: (p: string) => /\d/.test(p) },
  ]

  const passwordStrength = computed(
    () => passwordRules.filter((rule) => rule.test(form.password)).length
  )

  function getStrengthColor(level: number) {
    if (passwordStrength.value >= level) {
      if (passwordStrength.value <= 1) return 'bg-red-500'
      if (passwordStrength.value <= 2) return 'bg-orange-500'
      if (passwordStrength.value <= 3) return 'bg-yellow-500'
      return 'bg-green-500'
    }
    return 'bg-muted'
  }

  async function handleSubmit() {
    localError.value = ''
    if (!token.value) {
      localError.value = '无效的重置链接'
      return
    }
    if (!form.password || !form.confirmPassword) {
      localError.value = '请填写所有字段'
      return
    }
    if (form.password !== form.confirmPassword) {
      localError.value = '两次密码输入不一致'
      return
    }
    if (passwordStrength.value < 3) {
      localError.value = '密码强度不足'
      return
    }
    loading.value = true
    try {
      await auth.resetPassword(token.value, form.password, form.confirmPassword)
      isSuccess.value = true
      toast.success('密码重置成功')
    } catch {
      // 错误已在 store 中处理
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    auth.clearError()
  })
</script>
