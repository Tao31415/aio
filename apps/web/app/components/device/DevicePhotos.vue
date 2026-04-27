<script setup lang="ts">
  import type { DevicePhoto } from '~/stores/device'
  import { useDeviceStore } from '~/stores/device'

  const deviceStore = useDeviceStore()
  const toast = useToast()
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  const showPhotoModal = ref(false)
  const photoTimeValue = ref('')
  const selectedFile = ref<File | null>(null)
  const previewUrl = ref<string | null>(null)
  const isUploading = ref(false)
  const fileInputRef = ref<HTMLInputElement | null>(null)

  const timeOptions = computed(() => {
    const options = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const hour = String(h).padStart(2, '0')
        const minute = String(m).padStart(2, '0')
        options.push({
          label: `${hour}:${minute}`,
          value: `${hour}:${minute}`,
        })
      }
    }
    return options
  })

  watch(selectedFile, (file) => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
    if (file) {
      previewUrl.value = URL.createObjectURL(file)
    }
  })

  async function deleteDevicePhoto(photo: DevicePhoto) {
    if (!confirm('确定要删除这张照片吗？')) return
    try {
      await $fetch(`${apiBase}/api/v1/device/photo/${photo.id}`, {
        method: 'DELETE',
      })
      toast.add({ title: '照片已删除', color: 'success' })
      deviceStore.clearPhotoUrls(photo.id)
      await deviceStore.refreshSelectedDevice()
    } catch (e) {
      toast.add({ title: '删除失败', description: String(e), color: 'error' })
    }
  }

  function openPhotoModal() {
    photoTimeValue.value = ''
    selectedFile.value = null
    previewUrl.value = null
    showPhotoModal.value = true
  }

  function closePhotoModal() {
    showPhotoModal.value = false
    selectedFile.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
  }

  function clearSelectedFile() {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    selectedFile.value = null
    previewUrl.value = null
  }

  function triggerFileSelect() {
    fileInputRef.value?.click()
  }

  function handleFileInputChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0] || null
    if (file) {
      selectedFile.value = file
    }
    target.value = ''
  }

  async function createDevicePhoto() {
    if (!selectedFile.value) {
      toast.add({
        title: '请选择图片',
        color: 'warning',
      })
      return
    }

    isUploading.value = true
    try {
      const { objectName, presignedUrl } = await $fetch<{
        objectName: string
        presignedUrl: string
      }>(`${apiBase}/api/v1/upload/presign-upload`, {
        method: 'POST',
        body: {
          filename: selectedFile.value.name,
          contentType: selectedFile.value.type,
        },
      })

      await fetch(presignedUrl, {
        method: 'PUT',
        body: selectedFile.value,
        headers: {
          'Content-Type': selectedFile.value.type,
        },
      })

      const displayTimeStr = photoTimeValue.value || undefined
      await $fetch<DevicePhoto>(`${apiBase}/api/v1/device/photo`, {
        method: 'POST',
        body: {
          deviceId: deviceStore.selectedDevice!.id,
          objectName,
          displayTime: displayTimeStr,
        },
      })

      toast.add({ title: '照片上传成功', color: 'success' })
      closePhotoModal()
      await deviceStore.refreshSelectedDevice()
      await deviceStore.loadAllPhotoUrls()
    } catch (e) {
      toast.add({ title: '上传失败', description: String(e), color: 'error' })
    } finally {
      isUploading.value = false
    }
  }
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between">
      <p class="font-medium">
        设备照片 ({{ deviceStore.selectedDevice?.devicePhotos?.length || 0 }})
      </p>
      <UButton
        size="sm"
        icon="i-lucide-plus"
        @click="openPhotoModal"
      />
    </div>

    <div
      v-if="deviceStore.selectedDevice?.devicePhotos?.length"
      class="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <div
        v-for="photo in deviceStore.selectedDevice.devicePhotos"
        :key="photo.id"
        class="relative group aspect-square bg-accented rounded-lg overflow-hidden"
      >
        <img
          v-if="deviceStore.photoUrls[photo.id]"
          :src="deviceStore.photoUrls[photo.id]"
          :alt="photo.displayTime || '设备照片'"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted"
        >
          <UIcon
            name="i-lucide-image"
            class="w-12 h-12 opacity-50"
          />
          <span class="text-sm">加载中...</span>
        </div>
        <div
          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        >
          <UButton
            icon="i-lucide-trash"
            color="error"
            variant="solid"
            size="xs"
            @click.stop="deleteDevicePhoto(photo)"
          />
        </div>
        <p
          v-if="photo.displayTime"
          class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate"
        >
          {{ photo.displayTime }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="text-center py-8 text-muted"
    >
      <UIcon
        name="i-lucide-image"
        class="w-12 h-12 mx-auto mb-2 opacity-50"
      />
      <p>暂无照片</p>
    </div>
  </div>

  <UModal
    v-model:open="showPhotoModal"
    title="上传照片"
  >
    <template #body>
      <UForm
        class="space-y-4"
        @submit="createDevicePhoto"
      >
        <UFormField
          label="选择图片"
          description="支持 JPG、PNG、WebP 格式"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleFileInputChange"
          />
          <div
            v-if="!selectedFile"
            class="w-full"
          >
            <UFileUpload
              v-model="selectedFile"
              accept="image/jpeg,image/png,image/webp"
              :multiple="false"
              size="lg"
              label="点击选择图片或拖拽到此处"
              description="图片文件，不超过 10MB"
              :preview="false"
              class="w-full min-h-48"
            />
          </div>
          <div
            v-else-if="previewUrl"
            class="relative rounded-lg overflow-hidden border border-accented"
          >
            <img
              :src="previewUrl"
              class="w-full max-h-64 object-contain"
              alt="Preview"
            />
            <div class="absolute top-2 right-2 flex gap-2">
              <UButton
                icon="i-lucide-x"
                size="xs"
                color="error"
                variant="solid"
                @click="clearSelectedFile"
              />
              <UButton
                icon="i-lucide-upload"
                size="xs"
                color="neutral"
                variant="solid"
                @click="triggerFileSelect"
              >
                更换
              </UButton>
            </div>
            <div class="p-2 bg-accented text-sm text-muted truncate">
              {{ selectedFile?.name }}
            </div>
          </div>
        </UFormField>

        <UFormField label="显示时刻 (HH:mm)">
          <USelect
            v-model="photoTimeValue"
            placeholder="选择时间"
            :items="timeOptions"
          />
        </UFormField>

        <div class="flex gap-3 pt-2">
          <UButton
            type="submit"
            color="primary"
            class="flex-1 justify-center"
            :disabled="!selectedFile || isUploading"
            :loading="isUploading"
          >
            {{ isUploading ? '上传中...' : '上传' }}
          </UButton>
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            class="flex-1 justify-center"
            :disabled="isUploading"
            @click="closePhotoModal"
          >
            取消
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
