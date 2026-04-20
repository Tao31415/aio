<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">个人资料</h1>
        <p class="text-muted-foreground">管理您的个人信息和账户设置</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 个人信息卡片 -->
      <div class="lg:col-span-1">
        <div class="bg-card rounded-xl border p-6 text-center">
          <div
            class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
          >
            <span class="text-3xl font-bold text-primary">
              {{ user?.name?.charAt(0) || 'U' }}
            </span>
          </div>
          <h2 class="text-xl font-semibold">{{ user?.name || '用户' }}</h2>
          <p class="text-muted-foreground">
            {{ user?.email || 'user@example.com' }}
          </p>
          <div class="flex items-center justify-center gap-2 mt-2">
            <span
              class="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
              {{ user?.role === 'admin' ? '管理员' : '用户' }}
            </span>
          </div>

          <div class="mt-6 pt-6 border-t space-y-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">注册时间</span>
              <span>2024-01-01</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">最后登录</span>
              <span>今天 14:30</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">账户状态</span>
              <span class="text-green-600 dark:text-green-400">正常</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 基本信息 -->
        <div class="bg-card rounded-xl border p-6">
          <h3 class="font-semibold mb-4">基本信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">
                用户名
              </label>
              <input
                v-model="form.name"
                type="text"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">
                邮箱地址
              </label>
              <input
                v-model="form.email"
                type="email"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">
                手机号码
              </label>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="请输入手机号"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">
                所在城市
              </label>
              <input
                v-model="form.city"
                type="text"
                placeholder="请输入城市"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        <!-- 个人简介 -->
        <div class="bg-card rounded-xl border p-6">
          <h3 class="font-semibold mb-4">个人简介</h3>
          <textarea
            v-model="form.bio"
            rows="4"
            placeholder="介绍一下自己..."
            class="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <!-- 社交链接 -->
        <div class="bg-card rounded-xl border p-6">
          <h3 class="font-semibold mb-4">社交链接</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  />
                </svg>
              </div>
              <input
                v-model="form.github"
                type="text"
                placeholder="GitHub 用户名"
                class="flex-1 h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                  />
                </svg>
              </div>
              <input
                v-model="form.twitter"
                type="text"
                placeholder="Twitter 用户名"
                class="flex-1 h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </div>
              <input
                v-model="form.linkedin"
                type="text"
                placeholder="LinkedIn 用户名"
                class="flex-1 h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end gap-3">
          <button
            @click="resetForm"
            class="px-6 py-2 rounded-lg border hover:bg-accent transition-colors"
          >
            重置
          </button>
          <button
            @click="saveProfile"
            class="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            保存更改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    auth: 'user',
  })

  const authStore = useAuthStore()
  const { showToast } = useMyToast()

  const user = computed(() => authStore.user)

  const form = reactive({
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: '',
    city: '',
    bio: '',
    github: '',
    twitter: '',
    linkedin: '',
  })

  function resetForm() {
    form.name = user.value?.name || ''
    form.email = user.value?.email || ''
    form.phone = ''
    form.city = ''
    form.bio = ''
    form.github = ''
    form.twitter = ''
    form.linkedin = ''
  }

  function saveProfile() {
    showToast('个人资料已保存', 'success')
  }
</script>
