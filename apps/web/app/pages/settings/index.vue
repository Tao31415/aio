<script setup lang="ts">
  definePageMeta({
    title: '系统设置',
    icon: 'i-lucide-settings',
  })

  const authStore = useAuthStore()
  const toast = useToast()
  const { changePassword, signOut, updateProfile, deleteAccount } =
    useAuthActions()

  const user = computed(() => authStore.user)

  // ==================== 昵称表单 ====================
  const profileForm = reactive({
    name: user.value?.name || '',
  })

  async function saveProfile() {
    if (profileForm.name === user.value?.name) {
      toast.add({ title: '没有需要保存的更改', color: 'info' })
      return
    }

    const { user: updatedUser, error } = await updateProfile({
      name: profileForm.name,
    })

    if (error) {
      toast.add({
        title: '更新昵称失败',
        description: (error as Error).message,
        color: 'error',
      })
      return
    }

    if (updatedUser) {
      authStore.setUser(updatedUser)
      toast.add({ title: '昵称已更新', color: 'success' })
    }
  }

  // ==================== 重置密码弹窗状态 ====================
  const isResetPasswordOpen = ref(false)
  const resetPasswordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const isResettingPassword = ref(false)

  // 密码验证规则
  const passwordValidation = computed(() => {
    const p = resetPasswordForm.newPassword
    return {
      hasMinLength: p.length >= 8,
      hasUpperCase: /[A-Z]/.test(p),
      hasLowerCase: /[a-z]/.test(p),
      hasNumber: /\d/.test(p),
    }
  })
  const isPasswordValid = computed(
    () =>
      passwordValidation.value.hasMinLength &&
      passwordValidation.value.hasUpperCase &&
      passwordValidation.value.hasLowerCase &&
      passwordValidation.value.hasNumber
  )
  const isConfirmPasswordMatch = computed(
    () =>
      resetPasswordForm.confirmPassword !== '' &&
      resetPasswordForm.newPassword === resetPasswordForm.confirmPassword
  )

  function openResetPassword() {
    resetPasswordForm.currentPassword = ''
    resetPasswordForm.newPassword = ''
    resetPasswordForm.confirmPassword = ''
    isResetPasswordOpen.value = true
  }

  async function handleResetPassword() {
    if (!isPasswordValid.value) {
      toast.add({ title: '新密码不符合要求', color: 'error' })
      return
    }

    if (!isConfirmPasswordMatch.value) {
      toast.add({ title: '两次输入的密码不一致', color: 'error' })
      return
    }

    isResettingPassword.value = true

    const { error } = await changePassword({
      currentPassword: resetPasswordForm.currentPassword,
      newPassword: resetPasswordForm.newPassword,
      revokeOtherSessions: true,
    })

    isResettingPassword.value = false

    if (error) {
      toast.add({
        title: '修改密码失败',
        description: (error as Error).message,
        color: 'error',
      })
      return
    }

    isResetPasswordOpen.value = false
    toast.add({
      title: '密码已成功修改',
      description: '已为您退出其他登录中的设备',
      color: 'success',
    })
  }

  // ==================== 删除账户弹窗状态 ====================
  const isDeleteAccountOpen = ref(false)
  const deleteAccountForm = reactive({
    confirmText: '',
  })
  const isDeletingAccount = ref(false)

  function openDeleteAccount() {
    deleteAccountForm.confirmText = ''
    isDeleteAccountOpen.value = true
  }

  async function handleDeleteAccount() {
    if (deleteAccountForm.confirmText !== '删除账户') {
      toast.add({ title: '请输入"删除账户"以确认', color: 'error' })
      return
    }

    isDeletingAccount.value = true

    const { error } = await deleteAccount()

    isDeletingAccount.value = false

    if (error) {
      toast.add({
        title: '删除账户失败',
        description: (error as Error).message,
        color: 'error',
      })
      return
    }

    isDeleteAccountOpen.value = false

    toast.add({
      title: '账户已删除',
      description: '正在跳转至首页...',
      color: 'warning',
    })

    // 退出登录并跳转
    await signOut({ redirectTo: '/', redirect: true })
  }
</script>

<template>
  <!-- 设置内容 -->
  <div class="lg:col-span-3 space-y-6">
    <!-- 个人资料 -->
    <UCard :ui="{ body: 'space-y-6 p-6' }">
      <h2 class="text-lg font-semibold">个人资料</h2>

      <UForm
        :state="profileForm"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <UFormField
          label="昵称"
          name="name"
        >
          <UInput
            v-model="profileForm.name"
            type="text"
            placeholder="请输入昵称"
            autocomplete="off"
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
              @click="openResetPassword"
            >
              修改
            </UButton>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-default">
        <h3 class="font-medium text-destructive mb-4">危险操作</h3>
        <UButton
          color="error"
          variant="outline"
          @click="openDeleteAccount"
        >
          删除账户
        </UButton>
      </div>
    </UCard>
  </div>

  <!-- 重置密码弹窗 -->
  <UModal
    v-model:open="isResetPasswordOpen"
    title="修改密码"
  >
    <template #body>
      <UForm
        :state="resetPasswordForm"
        class="space-y-4"
      >
        <UFormField
          label="旧密码"
          name="currentPassword"
        >
          <UInput
            v-model="resetPasswordForm.currentPassword"
            type="password"
            placeholder="请输入旧密码"
            autocomplete="current-password"
          />
        </UFormField>

        <UFormField
          label="新密码"
          name="newPassword"
        >
          <UInput
            v-model="resetPasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            autocomplete="new-password"
          />
        </UFormField>

        <!-- 密码强度提示 -->
        <div
          v-if="resetPasswordForm.newPassword"
          class="text-sm space-y-1"
        >
          <div
            :class="
              passwordValidation.hasMinLength ? 'text-success' : 'text-muted'
            "
          >
            • 至少 8 个字符
          </div>
          <div
            :class="
              passwordValidation.hasUpperCase ? 'text-success' : 'text-muted'
            "
          >
            • 包含大写字母
          </div>
          <div
            :class="
              passwordValidation.hasLowerCase ? 'text-success' : 'text-muted'
            "
          >
            • 包含小写字母
          </div>
          <div
            :class="
              passwordValidation.hasNumber ? 'text-success' : 'text-muted'
            "
          >
            • 包含数字
          </div>
        </div>

        <UFormField
          label="确认新密码"
          name="confirmPassword"
        >
          <UInput
            v-model="resetPasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            autocomplete="new-password"
          />
        </UFormField>

        <div
          v-if="resetPasswordForm.confirmPassword && !isConfirmPasswordMatch"
          class="text-sm text-error"
        >
          两次输入的密码不一致
        </div>

        <div class="pt-2 text-sm text-muted">
          修改密码后，其他设备将被强制登出。
        </div>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="outline"
          color="neutral"
          @click="isResetPasswordOpen = false"
        >
          取消
        </UButton>
        <UButton
          color="primary"
          :loading="isResettingPassword"
          :disabled="
            !isPasswordValid ||
            !isConfirmPasswordMatch ||
            !resetPasswordForm.currentPassword
          "
          @click="handleResetPassword"
        >
          确认修改
        </UButton>
      </div>
    </template>
  </UModal>

  <!-- 删除账户弹窗 -->
  <UModal
    v-model:open="isDeleteAccountOpen"
    title="删除账户"
  >
    <template #body>
      <div class="space-y-4">
        <div
          class="p-4 rounded-lg border border-destructive/50 bg-destructive/5"
        >
          <p class="font-medium text-destructive">此操作不可撤销</p>
          <p class="text-sm text-muted mt-1">
            删除账户后，您的所有数据将被永久清除，包括：
          </p>
          <ul class="text-sm text-muted mt-2 list-disc list-inside">
            <li>个人资料和设置</li>
            <li>账户历史记录</li>
            <li>所有相关数据</li>
          </ul>
        </div>

        <UFormField
          label="确认删除"
          name="confirmText"
        >
          <UInput
            v-model="deleteAccountForm.confirmText"
            type="text"
            placeholder="请输入'删除账户'确认"
            autocomplete="off"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="outline"
          color="neutral"
          @click="isDeleteAccountOpen = false"
        >
          取消
        </UButton>
        <UButton
          color="error"
          :loading="isDeletingAccount"
          :disabled="deleteAccountForm.confirmText !== '删除账户'"
          @click="handleDeleteAccount"
        >
          确认删除
        </UButton>
      </div>
    </template>
  </UModal>
</template>
