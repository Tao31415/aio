<template>
  <div
    class="bg-elevated border border-default rounded-xl p-6 space-y-4 h-full flex flex-col"
  >
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">快速操作</h3>
      <span class="text-xs text-muted">常用入口</span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 flex-1">
      <UButton
        v-for="action in actions"
        :key="action.label"
        color="neutral"
        variant="ghost"
        class="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-lg border border-default bg-default p-3 text-center transition-all hover:bg-accented/80"
        @click="handleAction(action)"
      >
        <span
          class="h-10 w-10 rounded-lg flex items-center justify-center"
          :class="getActionToneBg(action.tone)"
        >
          <component
            :is="action.icon"
            class="w-5 h-5"
            :class="getActionToneText(action.tone)"
          />
        </span>
        <div class="text-center">
          <p class="font-medium text-sm">{{ action.label }}</p>
          <p class="text-xs text-muted">{{ action.hint }}</p>
        </div>
      </UButton>
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
    tone: 'info' | 'success' | 'warning' | 'primary' | 'error' | 'neutral'
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
      tone: 'info',
      href: '/users',
    },
    {
      label: '新建文档',
      hint: '创建文档',
      icon: IconFilePlus,
      tone: 'success',
      href: '/documents',
    },
    {
      label: '数据分析',
      hint: '查看报表',
      icon: IconBarChart3,
      tone: 'primary',
      href: '/analytics',
    },
    {
      label: '日程安排',
      hint: '管理日程',
      icon: IconCalendar,
      tone: 'error',
      href: '/calendar',
    },
    {
      label: '系统设置',
      hint: '配置选项',
      icon: IconSettings,
      tone: 'neutral',
      href: '/settings',
    },
  ]

  const handleAction = (action: QuickAction) => {
    emit('action', action.label)
    router.push(action.href)
  }

  function getActionToneBg(tone: QuickAction['tone']) {
    const map = {
      info: 'bg-info/10',
      success: 'bg-success/10',
      warning: 'bg-warning/10',
      primary: 'bg-primary/10',
      error: 'bg-error/10',
      neutral: 'bg-accented',
    } as const

    return map[tone]
  }

  function getActionToneText(tone: QuickAction['tone']) {
    const map = {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      primary: 'text-primary',
      error: 'text-error',
      neutral: 'text-muted',
    } as const

    return map[tone]
  }
</script>
