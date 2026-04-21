<script setup lang="ts">
  import { SETTINGS_ROUTE_CONFIG } from '~/utils/route-config'

  definePageMeta({
    title: SETTINGS_ROUTE_CONFIG.notifications!.title,
    icon: SETTINGS_ROUTE_CONFIG.notifications!.icon,
  })


  // 通知设置
  const notificationSettings = reactive({
    email: true,
    browser: true,
    marketing: false,
  })
</script>
<template>
      <!-- 设置内容 -->
      <div class="lg:col-span-3 space-y-6">
        <!-- 通知设置 -->
        <UCard
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
      </div>
</template>
