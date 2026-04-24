<script setup lang="ts">
  import { SETTINGS_ROUTE_CONFIG } from '~/utils/route-config'

  definePageMeta({
    title: SETTINGS_ROUTE_CONFIG.profile!.title,
    icon: SETTINGS_ROUTE_CONFIG.profile!.icon,
  })

  const authStore = useAuthStore()
  const toast = useToast()
  const { updateProfile } = useAuthActions()

  const user = computed(() => authStore.user)

  // 昵称表单
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
  </div>
</template>
