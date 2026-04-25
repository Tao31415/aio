<script setup lang="ts">
  // 子页面

  import { sub } from 'date-fns'

  // 时间范围选择
  const dateRange = ref({
    start: sub(new Date(), { days: 30 }),
    end: new Date(),
  })

  // 搜索
  const searchQuery = ref('')

  // 照片列表
  const photos = ref([
    {
      id: 1,
      url: 'https://picsum.photos/800/600?random=1',
      name: '监测点 A1 照片 1',
      time: '2024-03-15 08:00',
    },
    {
      id: 2,
      url: 'https://picsum.photos/800/600?random=2',
      name: '监测点 A1 照片 2',
      time: '2024-03-14 14:30',
    },
    {
      id: 3,
      url: 'https://picsum.photos/800/600?random=3',
      name: '监测点 A2 照片 1',
      time: '2024-03-14 08:00',
    },
    {
      id: 4,
      url: 'https://picsum.photos/800/600?random=4',
      name: '监测点 A2 照片 2',
      time: '2024-03-13 16:00',
    },
    {
      id: 5,
      url: 'https://picsum.photos/800/600?random=5',
      name: '监测点 B1 照片 1',
      time: '2024-03-13 08:00',
    },
    {
      id: 6,
      url: 'https://picsum.photos/800/600?random=6',
      name: '监测点 B1 照片 2',
      time: '2024-03-12 10:00',
    },
  ])

  // 当前选中的照片
  const selectedPhoto = ref<(typeof photos.value)[0] | null>(null)

  function selectPhoto(photo: (typeof photos.value)[0]) {
    selectedPhoto.value = photo
  }
</script>

<template>
  <div class="h-full flex flex-col p-4 gap-4">
    <!-- 照片筛选器 -->
    <div
      class="flex items-center gap-4 bg-elevated border border-default rounded-xl p-4"
    >
      <!-- 时间范围选择 -->
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

      <!-- 搜索框 -->
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

    <!-- 照片列表 -->
    <div
      class="flex-1 bg-elevated border border-default rounded-xl p-4 overflow-auto"
    >
      <div class="grid grid-cols-4 gap-4">
        <div
          v-for="photo in photos"
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

      <!-- 空状态 -->
      <div
        v-if="photos.length === 0"
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
  </div>
</template>
