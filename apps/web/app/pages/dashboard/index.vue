<script setup lang="ts">
  definePageMeta({
    layout: 'dashboard',
    auth: 'user',
  })
  import { sub } from 'date-fns'
  import type { Period, Range } from '~/types'
  const range = shallowRef<Range>({
    start: sub(new Date(), { days: 14 }),
    end: new Date(),
  })
  const period = ref<Period>('daily')
</script>
<template>
  <div class="flex items-center gap-3">
    <HomeDateRangePicker
      v-model="range"
      class="-ms-1"
    />

    <HomePeriodSelect
      v-model="period"
      :range="range"
    />
  </div>
  <HomeStats
    :period="period"
    :range="range"
  />
  <HomeChart
    :period="period"
    :range="range"
  />
  <HomeSales
    :period="period"
    :range="range"
  />
</template>
