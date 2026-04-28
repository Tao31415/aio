<script setup lang="ts">
  import { sub } from 'date-fns'

  const route = useRoute()
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  interface DevicePhoto {
    id: string
    deviceId: string
    objectName: string
    displayTime: string | null
    createdAt: string
  }

  interface Device {
    id: string
    name: string
    code: string
    project: string | null
    devicePhotos: DevicePhoto[]
  }

  const dateRange = ref({
    start: sub(new Date(), { days: 30 }),
    end: new Date(),
  })

  const searchQuery = ref('')

  const photos = ref<
    Array<{
      id: string
      url: string
      name: string
      time: string
    }>
  >([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const selectedPhoto = ref<(typeof photos.value)[0] | null>(null)
  const isFullscreen = ref(false)
  const currentIndex = ref(0)

  const deviceId = computed(() => route.params.deviceId as string)

  async function fetchPhotos() {
    if (!deviceId.value) return
    isLoading.value = true
    error.value = null
    try {
      const device = await $fetch<Device>(
        `${apiBase}/api/v1/device/${deviceId.value}`
      )
      photos.value = (device.devicePhotos || []).map((photo) => ({
        id: photo.id,
        url: `${apiBase}/api/v1/upload/download?objectName=${encodeURIComponent(photo.objectName)}`,
        name: photo.objectName.split('/').pop() || photo.objectName,
        time: photo.displayTime || photo.createdAt,
      }))
    } catch (e) {
      console.error('获取设备照片失败:', e)
      error.value = '无法获取设备照片'
      photos.value = []
    } finally {
      isLoading.value = false
    }
  }

  function selectPhoto(photo: (typeof photos.value)[0]) {
    const index = filteredPhotos.value.findIndex((p) => p.id === photo.id)
    if (index !== -1) {
      currentIndex.value = index
      selectedPhoto.value = photo
      isFullscreen.value = true
    }
  }

  function closeFullscreen() {
    isFullscreen.value = false
    selectedPhoto.value = null
  }

  function prevPhoto() {
    if (currentIndex.value > 0) {
      currentIndex.value--
      selectedPhoto.value = filteredPhotos.value[currentIndex.value]
    }
  }

  function nextPhoto() {
    if (currentIndex.value < filteredPhotos.value.length - 1) {
      currentIndex.value++
      selectedPhoto.value = filteredPhotos.value[currentIndex.value]
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isFullscreen.value) return
    if (e.key === 'Escape') closeFullscreen()
    if (e.key === 'ArrowLeft') prevPhoto()
    if (e.key === 'ArrowRight') nextPhoto()
  }

  onMounted(() => {
    fetchPhotos()
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  watch(deviceId, () => {
    fetchPhotos()
  })

  const filteredPhotos = computed(() => {
    let result = photos.value
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(query))
    }
    return result
  })
</script>

<template>
  <div class="h-full flex flex-col p-4 gap-4">
    <div
      class="flex items-center gap-4 bg-elevated border border-default rounded-xl p-4"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">时间范围：</span>
        <UInput
          v-model="dateRange.start"
          type="date"
          size="sm"
          class="w-36"
        />
        <span class="text-muted">至</span>
        <UInput
          v-model="dateRange.end"
          type="date"
          size="sm"
          class="w-36"
        />
      </div>

      <div class="flex-1">
        <UInput
          v-model="searchQuery"
          placeholder="搜索照片名称..."
          icon="i-lucide-search"
          size="sm"
          class="w-64"
        />
      </div>
    </div>

    <div
      class="flex-1 bg-elevated border border-default rounded-xl p-4 overflow-auto"
    >
      <div
        v-if="isLoading"
        class="flex items-center justify-center h-full"
      >
        <div class="text-center text-muted">
          <UIcon
            name="i-lucide-loader-2"
            class="w-8 h-8 animate-spin mb-2 mx-auto"
          />
          <p>加载照片中...</p>
        </div>
      </div>

      <div
        v-else-if="error"
        class="flex items-center justify-center h-full"
      >
        <div class="text-center text-error">
          <UIcon
            name="i-lucide-alert-circle"
            class="w-12 h-12 mx-auto mb-2 opacity-50"
          />
          <p>{{ error }}</p>
          <UButton
            color="error"
            variant="soft"
            size="sm"
            class="mt-2"
            @click="fetchPhotos"
          >
            重试
          </UButton>
        </div>
      </div>

      <div
        v-else
        class="grid grid-cols-4 gap-4"
      >
        <div
          v-for="photo in filteredPhotos"
          :key="photo.id"
          class="aspect-video bg-muted/20 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          @click="selectPhoto(photo)"
        >
          <img
            :src="photo.url"
            :alt="photo.name"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <div
        v-if="!isLoading && !error && filteredPhotos.length === 0"
        class="flex-1 flex items-center justify-center h-full"
      >
        <div class="text-center text-muted">
          <UIcon
            name="i-lucide-image-off"
            class="w-12 h-12 mx-auto mb-2"
          />
          <p>暂无照片数据</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isFullscreen && selectedPhoto"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          @click.self="closeFullscreen"
        >
          <button
            class="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            @click="closeFullscreen"
          >
            <UIcon
              name="i-lucide-x"
              class="w-8 h-8"
            />
          </button>

          <button
            v-if="currentIndex > 0"
            class="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
            @click="prevPhoto"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="w-10 h-10"
            />
          </button>

          <button
            v-if="currentIndex < filteredPhotos.length - 1"
            class="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
            @click="nextPhoto"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="w-10 h-10"
            />
          </button>

          <div class="max-w-6xl max-h-[90vh] mx-4">
            <img
              :src="selectedPhoto.url"
              :alt="selectedPhoto.name"
              class="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div class="mt-4 text-center text-white">
              <p class="text-lg font-medium">{{ selectedPhoto.name }}</p>
              <p class="text-sm text-white/60 mt-1">{{ selectedPhoto.time }}</p>
              <p class="text-xs text-white/40 mt-2">
                {{ currentIndex + 1 }} / {{ filteredPhotos.length }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
