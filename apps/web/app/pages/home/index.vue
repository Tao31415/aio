<script setup lang="ts">
  definePageMeta({
    layout: 'home',
  })

  const selectedDeviceStore = useSelectedDeviceStore()

  onMounted(() => {
    if (selectedDeviceStore.firstDevice) {
      navigateTo(`/home/${selectedDeviceStore.firstDevice.id}/basic`, {
        replace: true,
      })
    }
  })
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="text-center text-muted">
      <UIcon
        name="i-lucide-hard-drive"
        class="w-16 h-16 mx-auto mb-4 opacity-50"
      />
      <p class="text-lg">暂无选中设备</p>
      <p class="text-sm mt-1">请从左侧设备列表选择一个设备</p>
    </div>
  </div>
</template>
