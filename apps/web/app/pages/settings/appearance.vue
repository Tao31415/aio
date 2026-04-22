<script setup lang="ts">
  import { SETTINGS_ROUTE_CONFIG } from '~/utils/route-config'

  definePageMeta({
    title: SETTINGS_ROUTE_CONFIG.appearance!.title,
    icon: SETTINGS_ROUTE_CONFIG.appearance!.icon,
  })

  const uiSettingsStore = useUiSettingsStore()
  const uiSettings = uiSettingsStore
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
  function setTheme(theme: string) {
    uiSettingsStore.setTheme(theme as 'light' | 'dark' | 'system')
  }
</script>
<template>
  <!-- 设置内容 -->
  <div class="lg:col-span-3 space-y-6">
    <!-- 外观设置 -->
    <UCard :ui="{ body: 'space-y-6 p-6' }">
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
              :variant="uiSettings.theme === mode.value ? 'soft' : 'outline'"
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
  </div>
</template>
