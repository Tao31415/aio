<script setup lang="ts">
  import { ensureSession } from '~/composables/auth/session-manager'
  import { type SignInForm, signInSchema } from '~/types/auth'
  import { APP_ROUTE_MAP } from '~/utils/route-config'

  definePageMeta({
    title: APP_ROUTE_MAP['/login']!.title,
    icon: APP_ROUTE_MAP['/login']!.icon,
    layout: 'auth',
    auth: 'guest',
  })

  const auth = useAuth()
  const { signIn } = auth

  const route = useRoute()
  const toast = useToast()
  const config = useRuntimeConfig()
  const localePath = useLocalePath()
  const logger = useLogger('login')

  const redirectTo = computed(() => {
    const redirect = route.query.redirect as string
    return localePath(redirect || '/home')
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
  const error = ref<string | null>(null)

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
        onSuccess: async () => {
          logger.info('onSuccess')
          await ensureSession({
            force: true,
            reason: 'login.success',
          })
          await navigateTo(redirectTo.value)
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
          logger.info('onError')
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
          class="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          登录账户
        </h1>
        <p class="text-sm text-muted mt-2">输入您的用户名和密码登录</p>
      </div>

      <!-- 登录表单 -->
      <UForm
        :state="form"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          :title="error"
        />

        <UFormField
          label="用户名"
          name="username"
          required
          :error="errors.username"
        >
          <UInput
            v-model="form.username"
            type="text"
            autocomplete="username"
            placeholder="your username"
            icon="i-lucide-user"
            size="xl"
            class="w-full"
            @blur="handleBlur('username')"
          />
        </UFormField>

        <UFormField
          label="密码"
          name="password"
          required
          :error="errors.password"
        >
          <div class="relative">
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              icon="i-lucide-lock"
              size="xl"
              class="w-full"
              :ui="{ base: 'pr-11' }"
              @blur="handleBlur('password')"
            />
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="xs"
              class="absolute right-2 top-1/2 -translate-y-1/2"
              :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="showPassword = !showPassword"
            />
          </div>
        </UFormField>

        <div class="flex items-center justify-between text-sm">
          <UCheckbox
            v-model="form.remember"
            label="记住我"
          />
        </div>

        <div
          v-if="demoUsername && demoPassword"
          class="flex items-center gap-2 py-2"
        >
          <div class="flex-1 border-t border-default" />
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-user-round"
            @click="fillDemoCredentials"
          >
            测试账号
          </UButton>
          <div class="flex-1 border-t border-default" />
        </div>

        <UButton
          type="submit"
          color="primary"
          size="xl"
          class="w-full justify-center"
          :loading="loading"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ loading ? '登录中...' : '登录' }}
        </UButton>
      </UForm>
    </div>
  </AuthShell>
</template>
