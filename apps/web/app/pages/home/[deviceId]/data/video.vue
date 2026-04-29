<script setup lang="ts">
  definePageMeta({
    keepAlive: true,
  })

  const videos = ref([
    // { id: 1, name: '监测点 A1 视频 1', url: '...', time: '2024-03-15 08:00' },
    // { id: 2, name: '监测点 A1 视频 2', url: '...', time: '2024-03-14 14:30' },
  ])
</script>

<template>
  <div class="h-full flex flex-col p-4">
    <div
      v-if="videos.length === 0"
      class="flex-1 flex items-center justify-center bg-elevated border border-default rounded-xl"
    >
      <div class="text-center text-muted">
        <UIcon
          name="i-lucide-video-off"
          class="w-12 h-12 mx-auto mb-2"
        />
        <p>暂无视频数据</p>
      </div>
    </div>
  </div>
</template>
