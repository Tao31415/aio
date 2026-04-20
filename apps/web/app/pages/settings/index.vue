<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold">系统设置</h1>
      <p class="text-muted">管理您的账户和系统偏好设置</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 设置导航 -->
      <div class="lg:col-span-1">
        <nav class="space-y-1">
          <UButton
            v-for="item in settingsTabs"
            :key="item.id"
            @click="activeTab = item.id"
            :icon="item.icon"
            :variant="activeTab === item.id ? 'solid' : 'ghost'"
            color="primary"
            class="w-full justify-start"
          >
            {{ item.label }}
          </UButton>
        </nav>
      </div>

      <!-- 设置内容 -->
      <div class="lg:col-span-3 space-y-6">
        <!-- 个人资料 -->
        <UCard
          v-if="activeTab === 'profile'"
          :ui="{ body: 'space-y-6 p-6' }"
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
              <UButton color="primary">上传头像</UButton>
              <p class="text-sm text-muted mt-2">
                支持 JPG、PNG 格式，最大 2MB
              </p>
            </div>
          </div>

          <UForm
            :state="profileForm"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <UFormField
              label="用户名"
              name="name"
            >
              <UInput
                v-model="profileForm.name"
                type="text"
              />
            </UFormField>
            <UFormField
              label="邮箱"
              name="email"
            >
              <UInput
                v-model="profileForm.email"
                type="email"
              />
            </UFormField>
            <UFormField
              label="手机号"
              name="phone"
            >
              <UInput
                v-model="profileForm.phone"
                type="tel"
              />
            </UFormField>
            <UFormField
              label="所在城市"
              name="city"
            >
              <UInput
                v-model="profileForm.city"
                type="text"
              />
            </UFormField>
            <UFormField
              label="个人简介"
              name="bio"
              class="md:col-span-2"
            >
              <UTextarea
                v-model="profileForm.bio"
                :rows="4"
                class="w-full"
              />
            </UFormField>
          </UForm>

          <UButton
            @click="saveProfile"
            color="primary"
          >
            保存更改
          </UButton>
        </UCard>

        <!-- 外观设置 -->
        <UCard
          v-if="activeTab === 'appearance'"
          :ui="{ body: 'space-y-6 p-6' }"
        >
          <h2 class="text-lg font-semibold">外观设置</h2>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-3 block">主题模式</label>
              <div class="grid grid-cols-3 gap-3">
                <UButton
                  v-for="mode in themeModes"
                  :key="mode.value"
                  @click="setTheme(mode.value)"
                  :icon="mode.icon"
                  :variant="
                    uiSettings.theme === mode.value ? 'soft' : 'outline'
                  "
                  color="primary"
                  class="min-h-24 justify-center"
                >
                  {{ mode.label }}
                </UButton>
              </div>
            </div>

            <div
              class="flex items-center justify-between py-4 border-t border-default"
            >
              <div>
                <p class="font-medium">显示页脚</p>
                <p class="text-sm text-muted">在页面底部显示版权信息</p>
              </div>
              <USwitch v-model="uiSettings.showFooter" />
            </div>

            <div
              class="flex items-center justify-between py-4 border-t border-default"
            >
              <div>
                <p class="font-medium">显示标签栏</p>
                <p class="text-sm text-muted">在顶部显示多标签导航</p>
              </div>
              <USwitch v-model="uiSettings.showTabBar" />
            </div>
          </div>
        </UCard>

        <!-- 通知设置 -->
        <UCard
          v-if="activeTab === 'notifications'"
          :ui="{ body: 'space-y-6 p-6' }"
        >
          <h2 class="text-lg font-semibold">通知设置</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between py-4">
              <div>
                <p class="font-medium">邮件通知</p>
                <p class="text-sm text-muted">接收重要更新和安全提醒</p>
              </div>
              <USwitch v-model="notificationSettings.email" />
            </div>

            <div
              class="flex items-center justify-between py-4 border-t border-default"
            >
              <div>
                <p class="font-medium">浏览器通知</p>
                <p class="text-sm text-muted">在浏览器中显示推送通知</p>
              </div>
              <USwitch v-model="notificationSettings.browser" />
            </div>

            <div
              class="flex items-center justify-between py-4 border-t border-default"
            >
              <div>
                <p class="font-medium">营销通知</p>
                <p class="text-sm text-muted">接收产品更新和促销信息</p>
              </div>
              <USwitch v-model="notificationSettings.marketing" />
            </div>
          </div>
        </UCard>

        <!-- 安全设置 -->
        <UCard
          v-if="activeTab === 'security'"
          :ui="{ body: 'space-y-6 p-6' }"
        >
          <h2 class="text-lg font-semibold">安全设置</h2>

          <div class="space-y-4">
            <div class="p-4 rounded-lg border border-default">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">修改密码</p>
                  <p class="text-sm text-muted">定期更换密码以保护账户安全</p>
                </div>
                <UButton
                  color="neutral"
                  variant="outline"
                >
                  修改
                </UButton>
              </div>
            </div>

            <div class="p-4 rounded-lg border border-default">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">两步验证</p>
                  <div class="mt-1">
                    <UBadge
                      v-if="securitySettings.twoFactor"
                      color="success"
                      variant="soft"
                      size="sm"
                    >
                      已启用
                    </UBadge>
                    <UBadge
                      v-else
                      color="neutral"
                      variant="soft"
                      size="sm"
                    >
                      未启用
                    </UBadge>
                  </div>
                </div>
                <UButton
                  @click="
                    securitySettings.twoFactor = !securitySettings.twoFactor
                  "
                  color="neutral"
                  variant="outline"
                >
                  {{ securitySettings.twoFactor ? '关闭' : '启用' }}
                </UButton>
              </div>
            </div>

            <div class="p-4 rounded-lg border border-default">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">登录设备</p>
                  <p class="text-sm text-muted">查看和管理已登录的设备</p>
                </div>
                <UButton
                  color="neutral"
                  variant="outline"
                >
                  查看
                </UButton>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-default">
            <h3 class="font-medium text-destructive mb-4">危险操作</h3>
            <UButton
              color="error"
              variant="outline"
            >
              删除账户
            </UButton>
          </div>
        </UCard>
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
  const uiSettingsStore = useUiSettingsStore()
  const toast = useToast()

  const user = computed(() => authStore.user)
  const uiSettings = uiSettingsStore

  const activeTab = ref('profile')

  // 设置导航
  const settingsTabs = [
    {
      id: 'profile',
      label: '个人资料',
      icon: 'i-lucide-user-round',
    },
    {
      id: 'appearance',
      label: '外观设置',
      icon: 'i-lucide-palette',
    },
    {
      id: 'notifications',
      label: '通知设置',
      icon: 'i-lucide-bell',
    },
    {
      id: 'security',
      label: '安全设置',
      icon: 'i-lucide-shield-check',
    },
  ]

  // 主题模式
  const themeModes = [
    {
      value: 'light',
      label: '浅色',
      icon: 'i-lucide-sun',
    },
    {
      value: 'dark',
      label: '深色',
      icon: 'i-lucide-moon-star',
    },
    {
      value: 'system',
      label: '跟随系统',
      icon: 'i-lucide-monitor',
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
    toast.add({ title: '个人资料已保存', color: 'success' })
  }
</script>
