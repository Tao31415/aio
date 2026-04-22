<script setup lang="ts">
  import { SETTINGS_ROUTE_CONFIG } from '~/utils/route-config'

  definePageMeta({
    title: SETTINGS_ROUTE_CONFIG.security!.title,
    icon: SETTINGS_ROUTE_CONFIG.security!.icon,
  })

  // 安全设置
  const securitySettings = reactive({
    twoFactor: false,
  })
</script>
<template>
  <!-- 设置内容 -->
  <div class="lg:col-span-3 space-y-6">
    <!-- 安全设置 -->
    <UCard :ui="{ body: 'space-y-6 p-6' }">
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
              @click="securitySettings.twoFactor = !securitySettings.twoFactor"
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
</template>
