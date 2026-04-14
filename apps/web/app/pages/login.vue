<template>
  <AuthShell
    left-title="欢迎回来"
    left-emoji="👋"
    left-description="登录您的账户，开始管理您的业务数据和团队协作，体验高效的工作流程。"
    mobile-subtitle="欢迎回来，请登录您的账户"
    :left-features="[
      { icon: '🚀', text: '快速部署，即刻启动' },
      { icon: '📊', text: '实时数据分析与可视化' },
      { icon: '🔒', text: '企业级安全保障' },
      { icon: '⚡', text: '极致性能体验' },
    ]"
  >
    <div class="space-y-6">
      <!-- 标题 -->
      <div class="text-center">
        <h1
          class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          登录账户
        </h1>
        <p class="text-sm text-muted-foreground mt-2">输入您的邮箱和密码登录</p>
      </div>

      <!-- 社交登录 -->
      <div class="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          type="button"
          @click="handleSocialLogin('github')"
          :disabled="socialLoading === 'github'"
          class="w-full h-11 sm:h-12 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed relative"
          :title="`使用 GitHub 登录${showDemoHint ? ' (模拟)' : ''}`"
        >
          <svg
            v-if="socialLoading !== 'github'"
            class="h-5 w-5 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          <svg
            v-else
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </button>
        <button
          type="button"
          @click="handleSocialLogin('google')"
          :disabled="socialLoading === 'google'"
          class="w-full h-11 sm:h-12 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed relative"
          :title="`使用 Google 登录${showDemoHint ? ' (模拟)' : ''}`"
        >
          <svg
            v-if="socialLoading !== 'google'"
            class="h-5 w-5 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <svg
            v-else
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </button>
        <button
          type="button"
          @click="handleSocialLogin('wechat')"
          :disabled="socialLoading === 'wechat'"
          class="w-full h-11 sm:h-12 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed relative"
          :title="`使用微信登录${showDemoHint ? ' (模拟)' : ''}`"
        >
          <svg
            v-if="socialLoading !== 'wechat'"
            class="h-5 w-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-2.036 2.96c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.983.97-.983zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.983.97-.983z"
            />
          </svg>
          <svg
            v-else
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </button>
      </div>

      <!-- 分隔线 -->
      <div class="relative py-3">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border/50" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-card px-3 text-muted-foreground font-medium">
            或使用邮箱登录
          </span>
        </div>
      </div>

      <!-- 登录表单 -->
      <form
        @submit.prevent="handleSubmit"
        class="space-y-4"
      >
        <!-- 错误提示 -->
        <div
          v-if="auth.error"
          class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          {{ auth.error }}
        </div>

        <!-- 邮箱 -->
        <div class="space-y-2">
          <label
            for="email"
            class="text-xs font-medium text-muted-foreground"
          >
            邮箱地址
          </label>
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
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
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full pl-10 pr-3 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <!-- 密码 -->
        <div class="space-y-2">
          <label
            for="password"
            class="text-xs font-medium text-muted-foreground"
          >
            密码
          </label>
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect
                width="18"
                height="11"
                x="3"
                y="11"
                rx="2"
                ry="2"
              />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full pl-10 pr-10 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                v-if="!showPassword"
                class="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
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
                xmlns="http://www.w3.org/2000/svg"
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
        </div>

        <!-- 记住我 -->
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 cursor-pointer group">
            <input
              v-model="form.remember"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span
              class="text-muted-foreground group-hover:text-foreground transition-colors"
            >
              记住我
            </span>
          </label>
          <NuxtLink
            to="/forgot-password"
            class="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            忘记密码？
          </NuxtLink>
        </div>

        <!-- 测试账号按钮 -->
        <div
          v-if="demoEmail && demoPassword"
          class="flex items-center gap-2 py-2"
        >
          <div class="flex-1 h-px bg-border/50" />
          <button
            type="button"
            @click="fillDemoCredentials"
            class="h-7 px-3 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <svg
              class="h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle
                cx="12"
                cy="7"
                r="4"
              />
            </svg>
            测试账号
          </button>
          <div class="flex-1 h-px bg-border/50" />
        </div>

        <!-- 提交按钮 -->
        <button
          type="submit"
          :disabled="auth.loading"
          class="w-full h-12 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="auth.loading"
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>{{ auth.loading ? '登录中...' : '登录' }}</span>
          <span
            v-if="!auth.loading"
            class="ml-1"
          >
            →
          </span>
        </button>
      </form>

      <!-- 注册链接 -->
      <div class="text-center text-sm">
        <span class="text-muted-foreground">还没有账户？</span>
        <NuxtLink
          to="/register"
          class="text-primary hover:text-primary/80 font-semibold transition-colors ml-1"
        >
          立即注册
        </NuxtLink>
      </div>

      <!-- 条款链接 -->
      <p class="text-xs text-muted-foreground/70 text-center leading-relaxed">
        阅读我们的
        <NuxtLink
          to="/terms"
          class="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          服务条款
        </NuxtLink>
        和
        <NuxtLink
          to="/privacy"
          class="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          隐私政策
        </NuxtLink>
      </p>

      <!-- 测试账号提示 -->
      <p
        v-if="showDemoHint && demoEmail && demoPassword"
        class="text-xs text-muted-foreground/60 text-center"
      >
        测试账号请点击上方"测试账号"按钮自动填充
      </p>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
  definePageMeta({ layout: 'auth' })

  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()
  const config = useRuntimeConfig()

  const showDemoHint = computed(() => config.public.showDemoHint)
  const demoEmail = computed(() => config.public.demoEmail as string)
  const demoPassword = computed(() => config.public.demoPassword as string)
  const showPassword = ref(false)
  const socialLoading = ref<'github' | 'google' | 'wechat' | null>(null)

  const form = reactive({ email: '', password: '', remember: false })

  function fillDemoCredentials() {
    if (demoEmail.value && demoPassword.value) {
      form.email = demoEmail.value
      form.password = demoPassword.value
    }
  }

  async function handleSubmit() {
    try {
      await auth.login(form)
      toast.success('登录成功')
      const redirect = (route.query.redirect as string) || '/dashboard'
      await router.push(redirect)
    } catch {
      // 错误已在 store 中处理
    }
  }

  async function handleSocialLogin(provider: 'github' | 'google' | 'wechat') {
    socialLoading.value = provider

    try {
      await auth.socialLogin(provider)

      const providerNames = {
        github: 'GitHub',
        google: 'Google',
        wechat: '微信',
      }

      toast.success(`${providerNames[provider]} 登录成功`)

      const redirect = (route.query.redirect as string) || '/dashboard'
      await router.push(redirect)
    } catch (error) {
      // 错误已在 store 中处理，这里只需要显示 toast
      const providerNames = {
        github: 'GitHub',
        google: 'Google',
        wechat: '微信',
      }
      toast.error(`${providerNames[provider]} 登录失败`)
    } finally {
      socialLoading.value = null
    }
  }

  onMounted(() => {
    auth.clearError()
  })
</script>
