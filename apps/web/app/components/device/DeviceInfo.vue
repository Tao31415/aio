<script setup lang="ts">
  import { useDeviceStore } from '~/stores/device'

  const deviceStore = useDeviceStore()
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <p class="text-sm text-muted">工程</p>
        <p>{{ deviceStore.selectedDevice?.project || '-' }}</p>
      </div>
      <div>
        <p class="text-sm text-muted">经度</p>
        <p>{{ deviceStore.selectedDevice?.longitude ?? '-' }}</p>
      </div>
      <div>
        <p class="text-sm text-muted">纬度</p>
        <p>{{ deviceStore.selectedDevice?.latitude ?? '-' }}</p>
      </div>
      <div>
        <p class="text-sm text-muted">高程</p>
        <p>{{ deviceStore.selectedDevice?.elevation ?? '-' }}</p>
      </div>
      <div>
        <p class="text-sm text-muted">X 坐标</p>
        <p>{{ deviceStore.selectedDevice?.coordX ?? '-' }}</p>
      </div>
      <div>
        <p class="text-sm text-muted">Y 坐标</p>
        <p>{{ deviceStore.selectedDevice?.coordY ?? '-' }}</p>
      </div>
      <div>
        <p class="text-sm text-muted">Z 坐标</p>
        <p>{{ deviceStore.selectedDevice?.coordZ ?? '-' }}</p>
      </div>
    </div>
  </div>
</template>
