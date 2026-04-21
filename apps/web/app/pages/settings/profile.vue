<script setup lang="ts">
  import { SETTINGS_ROUTE_CONFIG } from '~/utils/route-config'

  definePageMeta({
    title: SETTINGS_ROUTE_CONFIG.profile!.title,
    icon: SETTINGS_ROUTE_CONFIG.profile!.icon,
  })

  const authStore = useAuthStore()
  const toast = useToast()

  const user = computed(() => authStore.user)
  // 个人资料表单
  const profileForm = reactive({
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: '',
    city: '',
    bio: '',
  })
  function saveProfile() {
    toast.add({ title: '个人资料已保存', color: 'success' })
  }
</script>
<template>
      <!-- 设置内容 -->
      <div class="lg:col-span-3 space-y-6">
        <!-- 个人资料 -->
        <UCard
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
      </div>
</template>
