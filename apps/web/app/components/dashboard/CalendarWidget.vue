<template>
  <div class="bg-card border rounded-xl p-6 space-y-4 h-full flex flex-col">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">日程</h3>
      <span class="text-xs text-muted-foreground">今日日程</span>
    </div>

    <!-- Today's Events List -->
    <div class="flex-1 overflow-auto rounded-md border bg-muted/30 p-3">
      <div
        v-if="loading"
        class="text-xs text-muted-foreground"
      >
        加载中...
      </div>
      <div
        v-else-if="todayEvents.length === 0"
        class="text-xs text-muted-foreground text-center py-4"
      >
        暂无日程
      </div>
      <ul
        v-else
        class="space-y-2"
      >
        <li
          v-for="event in displayList"
          :key="event.id"
          class="flex items-start justify-between gap-2 rounded-md bg-background p-2 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex-1">
            <p class="text-sm font-medium leading-tight">
              {{ event.title || '未命名事件' }}
            </p>
            <p class="text-[11px] text-muted-foreground leading-tight">
              {{ formatRange(event.start, event.end) }}
            </p>
          </div>
          <span class="text-[11px] text-muted-foreground">日程</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface CalendarEvent {
    id: string
    title: string
    start?: string
    end?: string
  }

  const props = defineProps<{
    data?: CalendarEvent[]
    loading?: boolean
  }>()

  // Mock data matching Next.js implementation
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const defaultEvents: CalendarEvent[] = [
    {
      id: '1',
      title: '产品评审',
      start: `${todayStr}T14:00:00`,
      end: `${todayStr}T15:00:00`,
    },
    {
      id: '2',
      title: '团队周会',
      start: `${todayStr}T10:00:00`,
      end: `${todayStr}T11:00:00`,
    },
    {
      id: '3',
      title: '客户演示',
      start: `${todayStr}T16:00:00`,
      end: `${todayStr}T17:00:00`,
    },
  ]

  const todayEvents = computed(() => {
    const events = props.data || defaultEvents
    return events.filter((event) => {
      const start = event.start?.slice(0, 10)
      return start === todayStr
    })
  })

  const displayList = computed(() => todayEvents.value.slice(0, 6))

  const formatRange = (start?: string, end?: string) => {
    if (!start) return '时间未定'

    const startDate = new Date(start)
    const endDate = end ? new Date(end) : null

    const fmt = new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

    const startStr = fmt.format(startDate)
    const endStr = endDate ? fmt.format(endDate) : ''

    return endStr ? `${startStr} - ${endStr}` : startStr
  }
</script>
