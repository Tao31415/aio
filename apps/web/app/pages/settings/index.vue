<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold">系统设置</h1>
      <p class="text-muted-foreground">管理您的账户和系统偏好设置</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 设置导航 -->
      <div class="lg:col-span-1">
        <nav class="space-y-1">
          <button
            v-for="item in settingsTabs"
            :key="item.id"
            @click="activeTab = item.id"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
              activeTab === item.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent',
            ]"
          >
            <component
              :is="item.icon"
              class="w-5 h-5"
            />
            {{ item.label }}
          </button>
        </nav>
      </div>

      <!-- 设置内容 -->
      <div class="lg:col-span-3 space-y-6">
        <!-- 个人资料 -->
        <div
          v-if="activeTab === 'profile'"
          class="bg-card rounded-xl border p-6 space-y-6"
        >
          <h2 class="text-lg font-semibold">个人资料</h2>

          <div class="flex items-center gap-6">
            <div
              class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <span class="text-2xl font-bold text-primary">
                {{ user?.name?.charAt(0) || 'U' }}
              </span>
            </div>
            <div>
              <button
                class="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                上传头像
              </button>
              <p class="text-sm text-muted-foreground mt-2">
                支持 JPG、PNG 格式，最大 2MB
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">用户名</label>
              <input
                v-model="profileForm.name"
                type="text"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">邮箱</label>
              <input
                v-model="profileForm.email"
                type="email"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">手机号</label>
              <input
                v-model="profileForm.phone"
                type="tel"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">所在城市</label>
              <input
                v-model="profileForm.city"
                type="text"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">个人简介</label>
            <textarea
              v-model="profileForm.bio"
              rows="4"
              class="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <button
            @click="saveProfile"
            class="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            保存更改
          </button>
        </div>

        <!-- 外观设置 -->
        <div
          v-if="activeTab === 'appearance'"
          class="bg-card rounded-xl border p-6 space-y-6"
        >
          <h2 class="text-lg font-semibold">外观设置</h2>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-3 block">主题模式</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="mode in themeModes"
                  :key="mode.value"
                  @click="setTheme(mode.value)"
                  :class="[
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                    uiSettings.theme === mode.value
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:bg-accent',
                  ]"
                >
                  <component
                    :is="mode.icon"
                    class="w-6 h-6"
                  />
                  <span class="text-sm">{{ mode.label }}</span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between py-4 border-t">
              <div>
                <p class="font-medium">显示页脚</p>
                <p class="text-sm text-muted-foreground">
                  在页面底部显示版权信息
                </p>
              </div>
              <button
                @click="uiSettings.showFooter = !uiSettings.showFooter"
                :class="[
                  'relative w-11 h-6 rounded-full transition-colors',
                  uiSettings.showFooter ? 'bg-primary' : 'bg-muted',
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                    uiSettings.showFooter && 'translate-x-5',
                  ]"
                />
              </button>
            </div>

            <div class="flex items-center justify-between py-4 border-t">
              <div>
                <p class="font-medium">显示标签栏</p>
                <p class="text-sm text-muted-foreground">
                  在顶部显示多标签导航
                </p>
              </div>
              <button
                @click="uiSettings.showTabBar = !uiSettings.showTabBar"
                :class="[
                  'relative w-11 h-6 rounded-full transition-colors',
                  uiSettings.showTabBar ? 'bg-primary' : 'bg-muted',
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                    uiSettings.showTabBar && 'translate-x-5',
                  ]"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div
          v-if="activeTab === 'notifications'"
          class="bg-card rounded-xl border p-6 space-y-6"
        >
          <h2 class="text-lg font-semibold">通知设置</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between py-4">
              <div>
                <p class="font-medium">邮件通知</p>
                <p class="text-sm text-muted-foreground">
                  接收重要更新和安全提醒
                </p>
              </div>
              <button
                @click="
                  notificationSettings.email = !notificationSettings.email
                "
                :class="[
                  'relative w-11 h-6 rounded-full transition-colors',
                  notificationSettings.email ? 'bg-primary' : 'bg-muted',
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                    notificationSettings.email && 'translate-x-5',
                  ]"
                />
              </button>
            </div>

            <div class="flex items-center justify-between py-4 border-t">
              <div>
                <p class="font-medium">浏览器通知</p>
                <p class="text-sm text-muted-foreground">
                  在浏览器中显示推送通知
                </p>
              </div>
              <button
                @click="
                  notificationSettings.browser = !notificationSettings.browser
                "
                :class="[
                  'relative w-11 h-6 rounded-full transition-colors',
                  notificationSettings.browser ? 'bg-primary' : 'bg-muted',
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                    notificationSettings.browser && 'translate-x-5',
                  ]"
                />
              </button>
            </div>

            <div class="flex items-center justify-between py-4 border-t">
              <div>
                <p class="font-medium">营销通知</p>
                <p class="text-sm text-muted-foreground">
                  接收产品更新和促销信息
                </p>
              </div>
              <button
                @click="
                  notificationSettings.marketing =
                    !notificationSettings.marketing
                "
                :class="[
                  'relative w-11 h-6 rounded-full transition-colors',
                  notificationSettings.marketing ? 'bg-primary' : 'bg-muted',
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                    notificationSettings.marketing && 'translate-x-5',
                  ]"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- 安全设置 -->
        <div
          v-if="activeTab === 'security'"
          class="bg-card rounded-xl border p-6 space-y-6"
        >
          <h2 class="text-lg font-semibold">安全设置</h2>

          <div class="space-y-4">
            <div class="p-4 rounded-lg border">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">修改密码</p>
                  <p class="text-sm text-muted-foreground">
                    定期更换密码以保护账户安全
                  </p>
                </div>
                <button
                  class="px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
                >
                  修改
                </button>
              </div>
            </div>

            <div class="p-4 rounded-lg border">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">两步验证</p>
                  <p class="text-sm text-muted-foreground">
                    <span
                      v-if="securitySettings.twoFactor"
                      class="text-green-600 dark:text-green-400"
                    >
                      已启用
                    </span>
                    <span
                      v-else
                      class="text-muted-foreground"
                    >
                      未启用
                    </span>
                  </p>
                </div>
                <button
                  @click="
                    securitySettings.twoFactor = !securitySettings.twoFactor
                  "
                  class="px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
                >
                  {{ securitySettings.twoFactor ? '关闭' : '启用' }}
                </button>
              </div>
            </div>

            <div class="p-4 rounded-lg border">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">登录设备</p>
                  <p class="text-sm text-muted-foreground">
                    查看和管理已登录的设备
                  </p>
                </div>
                <button
                  class="px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
                >
                  查看
                </button>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t">
            <h3 class="font-medium text-destructive mb-4">危险操作</h3>
            <button
              class="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
            >
              删除账户
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'default',
  })

  const authStore = useAuthStore()
  const uiSettingsStore = useUiSettingsStore()
  const { showToast } = useToast()

  const user = computed(() => authStore.user)
  const uiSettings = uiSettingsStore

  const activeTab = ref('profile')

  // 设置导航
  const settingsTabs = [
    {
      id: 'profile',
      label: '个人资料',
      icon: {
        template:
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>',
      },
    },
    {
      id: 'appearance',
      label: '外观设置',
      icon: {
        template:
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>',
      },
    },
    {
      id: 'notifications',
      label: '通知设置',
      icon: {
        template:
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>',
      },
    },
    {
      id: 'security',
      label: '安全设置',
      icon: {
        template:
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>',
      },
    },
  ]

  // 主题模式
  const themeModes = [
    {
      value: 'light',
      label: '浅色',
      icon: {
        template:
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
      },
    },
    {
      value: 'dark',
      label: '深色',
      icon: {
        template:
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>',
      },
    },
    {
      value: 'system',
      label: '跟随系统',
      icon: {
        template:
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
      },
    },
  ]

  // 个人资料表单
  const profileForm = reactive({
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: '',
    city: '',
    bio: '',
  })

  // 通知设置
  const notificationSettings = reactive({
    email: true,
    browser: true,
    marketing: false,
  })

  // 安全设置
  const securitySettings = reactive({
    twoFactor: false,
  })

  function setTheme(theme: string) {
    uiSettingsStore.setTheme(theme as 'light' | 'dark' | 'system')
  }

  function saveProfile() {
    showToast('个人资料已保存', 'success')
  }
</script>
