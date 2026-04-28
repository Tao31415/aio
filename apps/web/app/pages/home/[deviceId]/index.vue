<script setup lang="ts">
  definePageMeta({
    layout: 'home',
  })

  const route = useRoute()

  onMounted(() => {
    const deviceId = route.params.deviceId
    if (deviceId) {
      navigateTo(`/home/${deviceId}/basic`, {
        replace: true,
      })
    }
  })
</script>
