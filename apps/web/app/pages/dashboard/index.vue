<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    auth: 'user',
  })

  const authStore = useAuthStore()
  const toast = useToast()

  const currentUser = computed(() => authStore.user)
  const isRefreshing = ref(false)
  const selectedPeriod = ref('7天')

  // 统计数据
  const stats = ref([
    {
      title: '总用户数',
      value: '12,345',
      change: 12.5,
      icon: 'IconUsers',
      tone: 'info',
    },
    {
      title: '活跃用户',
      value: '8,234',
      change: 8.2,
      icon: 'IconActivity',
      tone: 'success',
    },
    {
      title: '总收入',
      value: '¥234,567',
      change: -2.4,
      icon: 'IconMoney',
      tone: 'warning',
    },
    {
      title: '订单数',
      value: '1,234',
      change: 15.3,
      icon: 'IconCart',
      tone: 'secondary',
    },
  ])

  // 图表数据
  const chartData = computed(() => {
    const days =
      selectedPeriod.value === '7天'
        ? 7
        : selectedPeriod.value === '30天'
          ? 30
          : 90
    return Array.from({ length: Math.min(days, 12) }, (_, i) => ({
      label: `${i + 1}日`,
      value: Math.floor(Math.random() * 60) + 40,
    }))
  })

  // 最近用户
  const recentUsers = ref([
    { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
    { id: 2, name: '李四', email: 'lisi@example.com', status: 'active' },
    { id: 3, name: '王五', email: 'wangwu@example.com', status: 'offline' },
    { id: 4, name: '赵六', email: 'zhaoliu@example.com', status: 'active' },
    { id: 5, name: '钱七', email: 'qianqi@example.com', status: 'offline' },
  ])

  // 待办事项
  const tasks = ref([
    {
      id: 1,
      title: '完成项目文档编写',
      completed: false,
      priority: 'high' as const,
    },
    {
      id: 2,
      title: '审核用户反馈',
      completed: true,
      priority: 'medium' as const,
    },
    {
      id: 3,
      title: '更新系统配置',
      completed: false,
      priority: 'low' as const,
    },
    {
      id: 4,
      title: '准备周会报告',
      completed: false,
      priority: 'medium' as const,
    },
    { id: 5, title: '测试新功能', completed: true, priority: 'high' as const },
  ])

  const completedTasks = computed(
    () => tasks.value.filter((t) => t.completed).length
  )

  function getTaskPriorityColor(priority: 'high' | 'medium' | 'low') {
    const map = {
      high: 'error',
      medium: 'warning',
      low: 'primary',
    } as const
    return map[priority]
  }

  function getRecentUserStatusColor(status: string) {
    return status === 'active' ? 'success' : 'neutral'
  }

  function getNotificationIconWrapperClass(type: string) {
    const map = {
      info: 'bg-info/10',
      success: 'bg-success/10',
      warning: 'bg-warning/10',
      error: 'bg-error/10',
    } as const

    return map[type as keyof typeof map] || 'bg-accented'
  }

  function getNotificationIconClass(type: string) {
    const map = {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
    } as const

    return map[type as keyof typeof map] || 'text-muted'
  }

  function getStatToneBg(tone: string) {
    const map = {
      info: 'bg-info/10',
      success: 'bg-success/10',
      warning: 'bg-warning/10',
      secondary: 'bg-secondary/10',
    } as const

    return map[tone as keyof typeof map] || 'bg-accented'
  }

  function getStatToneText(tone: string) {
    const map = {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      secondary: 'text-secondary',
    } as const

    return map[tone as keyof typeof map] || 'text-muted'
  }

  function toggleTask(id: number) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.completed = !task.completed
    }
  }

  // 通知
  const notifications = ref([
    {
      id: 1,
      type: 'success' as const,
      title: '系统更新完成',
      message: '新版本已成功部署到生产环境',
      time: '5 分钟前',
    },
    {
      id: 2,
      type: 'info' as const,
      title: '新用户注册',
      message: '今日新增 23 位用户注册',
      time: '1 小时前',
    },
    {
      id: 3,
      type: 'warning' as const,
      title: '存储空间告警',
      message: '服务器存储使用率已达 85%',
      time: '2 小时前',
    },
    {
      id: 4,
      type: 'error' as const,
      title: '支付失败',
      message: '订单 #12345 支付处理失败',
      time: '3 小时前',
    },
  ])

  // 刷新数据
  async function handleRefresh() {
    isRefreshing.value = true
    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.add({ title: '数据已刷新', color: 'success' })
    } catch {
      toast.add({ title: '刷新失败', color: 'error' })
    } finally {
      isRefreshing.value = false
    }
  }

  // 图标组件
  const IconUsers = {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
  }
  const IconActivity = {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`,
  }
  const IconMoney = {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  }
  const IconCart = {
    template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
  }

  // 图标映射
  const iconMap = {
    IconUsers,
    IconActivity,
    IconMoney,
    IconCart,
  } as const

  // 获取图标组件
  const getIcon = (name: string) => iconMap[name as keyof typeof iconMap]

  // 测试 Toast
  function testToast() {
    toast.add({
      title: 'Toast 测试成功',
      description: '这是一条 Toast 通知',
      color: 'success',
      icon: 'i-lucide-check-circle',
      duration: 3000,
    })
  }

  // 测试 Error Page
  function testError() {
    navigateTo('/error-page-that-does-not-exist')
  }
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">仪表板</h1>
        <p class="text-muted">
          欢迎回来，{{ currentUser?.name || '用户' }}！以下是今日概览。
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          @click="handleRefresh"
          :disabled="isRefreshing"
          color="neutral"
          variant="outline"
          :loading="isRefreshing"
          icon="i-lucide-refresh-cw"
        >
          {{ isRefreshing ? '刷新中...' : '刷新' }}
        </UButton>
        <UButton
          @click="testToast"
          color="neutral"
          variant="outline"
          icon="i-lucide-bell-ring"
        >
          测试 Toast
        </UButton>
        <UButton
          @click="testError"
          color="error"
          variant="outline"
          icon="i-lucide-triangle-alert"
        >
          测试 Error
        </UButton>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard
        v-for="stat in stats"
        :key="stat.title"
        class="transition-all hover:shadow-md"
        :ui="{ body: 'p-6' }"
      >
        <div class="flex items-center justify-between">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="getStatToneBg(stat.tone)"
          >
            <component
              :is="getIcon(stat.icon)"
              class="w-6 h-6"
              :class="getStatToneText(stat.tone)"
            />
          </div>
          <UBadge
            :color="stat.change >= 0 ? 'success' : 'error'"
            variant="soft"
          >
            {{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}%
          </UBadge>
        </div>
        <div class="mt-4">
          <p class="text-2xl font-bold">{{ stat.value }}</p>
          <p class="text-sm text-muted">{{ stat.title }}</p>
        </div>
      </UCard>
    </div>

    <!-- 图表和列表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 访问趋势图 -->
      <UCard
        class="lg:col-span-2"
        :ui="{ body: 'p-6' }"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-semibold">访问趋势</h3>
          <div class="flex items-center gap-2">
            <UButton
              v-for="period in ['7天', '30天', '90天']"
              :key="period"
              @click="selectedPeriod = period"
              color="primary"
              size="xs"
              :variant="selectedPeriod === period ? 'solid' : 'ghost'"
            >
              {{ period }}
            </UButton>
          </div>
        </div>
        <div class="h-64 flex items-end justify-between gap-2">
          <div
            v-for="(bar, index) in chartData"
            :key="index"
            class="relative flex-1 rounded-t-lg bg-primary/15 transition-all hover:bg-primary/20 group"
            :style="{ height: `${bar.value}%` }"
          >
            <div
              class="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              {{ bar.label }}: {{ bar.value }}
            </div>
          </div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-muted">
          <span
            v-for="(bar, index) in chartData"
            :key="index"
          >
            {{ bar.label }}
          </span>
        </div>
      </UCard>

      <!-- 最近用户 -->
      <UCard :ui="{ body: 'p-6' }">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">最近用户</h3>
          <UButton
            to="/users"
            color="primary"
            variant="ghost"
            size="xs"
          >
            查看全部
          </UButton>
        </div>
        <div class="space-y-4">
          <div
            v-for="item in recentUsers"
            :key="item.id"
            class="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accented/80"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-accented"
            >
              <span class="text-sm font-medium text-default">
                {{ item.name.charAt(0) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ item.name }}</p>
              <p class="text-sm text-muted truncate">
                {{ item.email }}
              </p>
            </div>
            <UBadge
              :color="getRecentUserStatusColor(item.status)"
              variant="soft"
            >
              {{ item.status === 'active' ? '活跃' : '离线' }}
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 待办事项和通知 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 待办事项 -->
      <UCard :ui="{ body: 'p-6' }">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">待办事项</h3>
          <span class="text-sm text-muted">
            {{ completedTasks }}/{{ tasks.length }} 已完成
          </span>
        </div>
        <div class="space-y-2">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-accented transition-colors group"
          >
            <UCheckbox
              :model-value="task.completed"
              @update:model-value="toggleTask(task.id)"
            />
            <span
              :class="['flex-1', task.completed && 'line-through text-muted']"
            >
              {{ task.title }}
            </span>
            <UBadge
              :color="getTaskPriorityColor(task.priority)"
              variant="soft"
            >
              {{ { high: '高', medium: '中', low: '低' }[task.priority] }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- 通知列表 -->
      <UCard :ui="{ body: 'p-6' }">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">最新通知</h3>
          <UButton
            color="primary"
            variant="ghost"
            size="xs"
          >
            全部已读
          </UButton>
        </div>
        <div class="space-y-3">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="flex gap-3 p-3 rounded-lg hover:bg-accented transition-colors"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="getNotificationIconWrapperClass(notification.type)"
            >
              <svg
                class="w-5 h-5"
                :class="getNotificationIconClass(notification.type)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="notification.type === 'info'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  v-else-if="notification.type === 'success'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  v-else-if="notification.type === 'warning'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium">{{ notification.title }}</p>
              <p class="text-sm text-muted truncate">
                {{ notification.message }}
              </p>
              <p class="text-xs text-muted mt-1">
                {{ notification.time }}
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
