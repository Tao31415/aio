<template>
  <div class="bg-card border rounded-xl p-6 space-y-4 h-full flex flex-col">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">快速操作</h3>
      <span class="text-xs text-muted-foreground">常用入口</span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 flex-1">
      <button
        v-for="action in actions"
        :key="action.label"
        class="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all min-h-[88px] group"
        @click="handleAction(action)"
      >
        <span
          class="h-10 w-10 rounded-lg flex items-center justify-center"
          :class="action.bg"
        >
          <component
            :is="action.icon"
            class="w-5 h-5"
            :class="action.color"
          />
        </span>
        <div class="text-center">
          <p class="font-medium text-sm">{{ action.label }}</p>
          <p class="text-xs text-muted-foreground">{{ action.hint }}</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    IconUsers,
    IconFilePlus,
    IconBell,
    IconBarChart3,
    IconCalendar,
    IconSettings,
  } from '@/components/icons'

  interface QuickAction {
    label: string
    hint: string
    icon: Component
    bg: string
    color: string
    href: string
  }

  const router = useRouter()
  const emit = defineEmits<{
    (e: 'action', label: string): void
  }>()

  // Actions matching Next.js implementation
  const actions: QuickAction[] = [
    {
      label: '添加用户',
      hint: '快速添加成员',
      icon: IconUsers,
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      color: 'text-blue-600 dark:text-blue-400',
      href: '/users',
    },
    {
      label: '新建文档',
      hint: '创建文档',
      icon: IconFilePlus,
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      color: 'text-emerald-600 dark:text-emerald-400',
      href: '/documents',
    },
    {
      label: '发送通知',
      hint: '推送消息',
      icon: IconBell,
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      color: 'text-amber-600 dark:text-amber-400',
      href: '/notifications',
    },
    {
      label: '数据分析',
      hint: '查看报表',
      icon: IconBarChart3,
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      color: 'text-purple-600 dark:text-purple-400',
      href: '/analytics',
    },
    {
      label: '日程安排',
      hint: '管理日程',
      icon: IconCalendar,
      bg: 'bg-pink-50 dark:bg-pink-900/30',
      color: 'text-pink-600 dark:text-pink-400',
      href: '/calendar',
    },
    {
      label: '系统设置',
      hint: '配置选项',
      icon: IconSettings,
      bg: 'bg-slate-50 dark:bg-slate-900/30',
      color: 'text-slate-600 dark:text-slate-400',
      href: '/settings',
    },
  ]

  const handleAction = (action: QuickAction) => {
    emit('action', action.label)
    router.push(action.href)
  }
</script>
