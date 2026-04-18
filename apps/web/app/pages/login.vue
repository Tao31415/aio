<script setup lang="ts">
  import { type SignInForm, signInSchema } from '~/types/auth'
  definePageMeta({ layout: 'auth' })

  const auth = useAuth()
  const { signIn } = auth

  const route = useRoute()
  const toast = useToast()
  const config = useRuntimeConfig()
  const localePath = useLocalePath()
  const logger = useLogger('login')

  const redirectTo = computed(() => {
    const redirect = route.query.redirect as string
    return localePath(redirect || '/')
  })

  const demoUsername = computed(() => config.public.demoUsername)
  const demoPassword = computed(() => config.public.demoPassword)
  const showPassword = ref(false)

  const form = reactive<SignInForm>({
    username: '',
    password: '',
    remember: false,
    callbackURL: redirectTo.value,
  })

  const errors = ref<Record<string, string>>({})

  const loading = ref(false)
  const error = ref(null)

  function fillDemoCredentials() {
    if (demoUsername.value && demoPassword.value) {
      form.username = demoUsername.value
      form.password = demoPassword.value
    }
  }

  function validateField(field: keyof SignInForm) {
    const result = signInSchema.safeParse(form)
    const fieldError = result.error?.issues.find((i) => i.path[0] === field)
    if (fieldError) {
      errors.value[field] = fieldError.message
    } else {
      delete errors.value[field]
    }
  }

  const debouncedValidate = useDebounceFn((field: keyof SignInForm) => {
    logger.info({ field }, 'debouncedValidate')
    validateField(field)
  }, 300)
  function handleBlur(field: keyof SignInForm) {
    logger.info({ field }, 'handleBlur')
    debouncedValidate(field)
  }

  function validateAll(): boolean {
    const result = signInSchema.safeParse(form)
    logger.info({ result }, 'validate login form')

    if (!result.success) {
      // 清空旧错误
      errors.value = {}
      // 提取所有错误
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        errors.value[field] = issue.message
      })
      logger.error('validate login form failed')
      return false
    }

    errors.value = {}
    return true
  }

  async function handleSubmit() {
    logger.info('submit login form')
    if (!validateAll()) return
    logger.info('validate login form success')

    if (loading.value) return
    logger.info('sign in request')

    try {
      logger.info({ form }, 'sign in request')
      await signIn.username(form, {
        onSuccess: () => {
          navigateTo(redirectTo.value)
        },
        onRequest: () => {
          logger.info('onRequest')
          loading.value = true
        },
        onResponse: () => {
          logger.info('onResponse')
          loading.value = false
        },
        onError: (ctx: { error: { message: any } }) => {
          logger.info('onRequest')
          loading.value = false
          error.value = ctx.error.message
          toast.add({
            title: ctx.error.message,
            color: 'error',
          })
        },
      })
    } catch (e) {
      logger.error(e, 'sign in failed')
      // 业务错误（非校验错误）在这里处理
    }
  }
</script>
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
        <p class="text-sm text-muted-foreground mt-2">
          输入您的用户名和密码登录
        </p>
      </div>

      <!-- 登录表单 -->
      <form
        @submit.prevent="handleSubmit"
        class="space-y-4"
      >
        <!-- 错误提示 -->
        <div
          v-if="error"
          class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          {{ error }}
        </div>

        <!-- 用户名 -->
        <div class="space-y-2">
          <label
            for="username"
            class="text-xs font-medium text-muted-foreground"
          >
            用户名
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
              id="username"
              v-model="form.username"
              type="username"
              @blur="handleBlur('username')"
              required
              class="w-full pl-10 pr-3 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
              placeholder="your username"
            />
            <span
              v-if="errors.username"
              class="text-red-500 text-sm"
            >
              {{ errors.username }}
            </span>
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
              @blur="handleBlur('password')"
              class="w-full pl-10 pr-10 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
              placeholder="••••••••"
            />
            <span
              v-if="errors.password"
              class="text-red-500 text-sm"
            >
              {{ errors.password }}
            </span>
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
        </div>

        <!-- 测试账号按钮 -->
        <div
          v-if="demoUsername && demoPassword"
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
          :disabled="loading"
          class="w-full h-12 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="loading"
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>{{ loading ? '登录中...' : '登录' }}</span>
          <span
            v-if="!loading"
            class="ml-1"
          >
            →
          </span>
        </button>
      </form>
    </div>
  </AuthShell>
</template>
