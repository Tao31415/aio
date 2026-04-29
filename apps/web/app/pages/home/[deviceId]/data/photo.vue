<script setup lang="ts">
  import { sub } from 'date-fns'
  import { usePhoto, type PhotoWithDetails } from '~/composables/usePhoto'

  definePageMeta({
    key: route => `data-photo-${route.params.deviceId}`,
    keepalive: true,
  })

  const route = useRoute()
  const deviceId = computed(() => route.params.deviceId as string)
  const dataCache = useDataCacheStore()

  const dateRange = ref({
    start: sub(new Date(), { hours: 24 }),
    end: new Date(),
  })

  const dateStart = computed({
    get: () => {
      const d = dateRange.value.start
      return d instanceof Date ? d.toISOString().split('T')[0] : ''
    },
    set: (val: string) => {
      if (val) dateRange.value.start = new Date(val)
    },
  })

  const dateEnd = computed({
    get: () => {
      const d = dateRange.value.end
      return d instanceof Date ? d.toISOString().split('T')[0] : ''
    },
    set: (val: string) => {
      if (val) dateRange.value.end = new Date(val)
    },
  })

  const { fetchPhotos, transformPhotos, isLoading, error } = usePhoto()

  const photos = ref<PhotoWithDetails[]>([])
  const errorMsg = ref<string | null>(null)

  const selectedPhoto = ref<PhotoWithDetails | null>(null)
  const isFullscreen = ref(false)
  const currentIndex = ref(0)

  /** 保存当前状态到 store */
  function saveToCache() {
    dataCache.setPhoto(deviceId.value, {
      startDate: dateRange.value.start,
      endDate: dateRange.value.end,
      photos: photos.value.map((p) => ({
        id: p.id,
        name: p.name,
        url: p.url,
        time: p.time,
        raw: p,
      })),
      hasSearched: photos.value.length > 0 || !!errorMsg.value,
    })
  }

  /** 从 store 恢复状态 */
  function restoreFromCache(): boolean {
    const cached = dataCache.getPhoto(deviceId.value)
    if (!cached) return false

    dateRange.value = { start: cached.startDate, end: cached.endDate }
    photos.value = cached.photos.map((p) => p.raw as PhotoWithDetails)
    return true
  }

  async function loadPhotos() {
    if (!deviceId.value) return
    try {
      const rawPhotos = await fetchPhotos(deviceId.value, {
        startTime: dateRange.value.start,
        endTime: dateRange.value.end,
      })
      photos.value = transformPhotos(rawPhotos, true)
      saveToCache()
    } catch (e) {
      console.error('获取设备照片失败:', e)
      errorMsg.value = '无法获取设备照片'
      photos.value = []
    }
  }

  function handleSearch() {
    loadPhotos()
  }

  function handleClear() {
    dateRange.value = {
      start: sub(new Date(), { hours: 24 }),
      end: new Date(),
    }
    loadPhotos()
  }

  function selectPhoto(photo: PhotoWithDetails) {
    const index = photos.value.findIndex((p) => p.id === photo.id)
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
      selectedPhoto.value = photos.value[currentIndex.value] ?? null
    }
  }

  function nextPhoto() {
    if (currentIndex.value < photos.value.length - 1) {
      currentIndex.value++
      selectedPhoto.value = photos.value[currentIndex.value] ?? null
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isFullscreen.value) return
    if (e.key === 'Escape') closeFullscreen()
    if (e.key === 'ArrowLeft') prevPhoto()
    if (e.key === 'ArrowRight') nextPhoto()
  }

  onMounted(() => {
    if (!restoreFromCache()) {
      loadPhotos()
    }
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  // 从其他页面（如 /basic）返回时，从 store 恢复数据
  onActivated(() => {
    restoreFromCache()
  })

  watch(deviceId, () => {
    loadPhotos()
  })
</script>

<template>
  <div class="h-full flex flex-col p-4 gap-4">
    <div
      class="flex items-center flex-wrap gap-4 bg-elevated border border-default rounded-xl p-4"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">开始日期：</span>
        <UInput
          v-model="dateStart"
          type="date"
          size="sm"
          class="w-36"
        />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">结束日期：</span>
        <UInput
          v-model="dateEnd"
          type="date"
          size="sm"
          class="w-36"
        />
      </div>

      <UButton
        size="sm"
        icon="i-lucide-search"
        @click="handleSearch"
      >
        查找
      </UButton>

      <UButton
        size="sm"
        color="secondary"
        icon="i-lucide-x"
        @click="handleClear"
      >
        清除
      </UButton>
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
            class="w-12 h-12 animate-spin mx-auto mb-2"
          />
          <p>加载中...</p>
        </div>
      </div>

      <div
        v-else-if="errorMsg || error"
        class="flex items-center justify-center h-full"
      >
        <div class="text-center text-error">
          <UIcon
            name="i-lucide-alert-circle"
            class="w-12 h-12 mx-auto mb-2"
          />
          <p>{{ errorMsg || error }}</p>
        </div>
      </div>

      <div
        v-else-if="photos.length === 0"
        class="flex items-center justify-center h-full"
      >
        <div class="text-center text-muted">
          <UIcon
            name="i-lucide-image-off"
            class="w-12 h-12 mx-auto mb-2 opacity-50"
          />
          <p>暂无照片</p>
        </div>
      </div>

      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="relative aspect-square rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-primary transition-all"
          @click="selectPhoto(photo)"
        >
          <img
            :src="photo.url"
            :alt="photo.name"
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div class="absolute bottom-2 left-2 right-2 text-white text-xs">
              <p class="truncate">{{ photo.name }}</p>
              <p class="text-white/70">{{ photo.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        name="fade"
        mode="out-in"
      >
        <div
          v-if="isFullscreen && selectedPhoto"
          class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          @click.self="closeFullscreen"
        >
          <button
            class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            @click="closeFullscreen"
          >
            <UIcon
              name="i-lucide-x"
              class="w-6 h-6"
            />
          </button>

          <button
            v-if="currentIndex > 0"
            class="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            @click="prevPhoto"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="w-8 h-8"
            />
          </button>

          <button
            v-if="currentIndex < photos.length - 1"
            class="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            @click="nextPhoto"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="w-8 h-8"
            />
          </button>

          <div class="max-w-5xl max-h-[90vh]">
            <img
              :src="selectedPhoto.url"
              :alt="selectedPhoto.name"
              class="max-w-full max-h-[90vh] object-contain"
            />
            <div class="text-white text-center mt-4">
              <p class="text-lg">{{ selectedPhoto.name }}</p>
              <p class="text-white/70">{{ selectedPhoto.time }}</p>
            </div>
          </div>

          <div
            class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm"
          >
            {{ currentIndex + 1 }} / {{ photos.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
