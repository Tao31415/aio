<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-32"
      >
        <!-- 遮罩 -->
        <div
          class="fixed inset-0 bg-black/50"
          @click="close"
        />

        <!-- 命令面板 -->
        <div
          class="relative w-full max-w-lg mx-4 bg-card border rounded-lg shadow-2xl overflow-hidden"
        >
          <!-- 搜索框 -->
          <div class="flex items-center gap-3 px-4 py-3 border-b">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="搜索命令..."
              class="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              @keydown.down.prevent="selectNext"
              @keydown.up.prevent="selectPrev"
              @keydown.enter.prevent="executeSelected"
              @keydown.escape="close"
            />
            <kbd
              class="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground"
            >
              ESC
            </kbd>
          </div>

          <!-- 命令列表 -->
          <div class="max-h-80 overflow-y-auto py-2">
            <div
              v-if="filteredCommands.length === 0"
              class="px-4 py-8 text-center text-muted-foreground"
            >
              没有找到匹配的命令
            </div>
            <div v-else>
              <div
                v-for="(group, groupIndex) in groupedCommands"
                :key="group.name"
                class="mb-2"
              >
                <div
                  class="px-4 py-1 text-xs font-medium text-muted-foreground uppercase"
                >
                  {{ group.name }}
                </div>
                <div
                  v-for="(command, commandIndex) in group.commands"
                  :key="command.id"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors',
                    isSelected(groupIndex, commandIndex)
                      ? 'bg-accent'
                      : 'hover:bg-accent/50',
                  ]"
                  @click="executeCommand(command)"
                  @mouseenter="setSelected(groupIndex, commandIndex)"
                >
                  <component
                    :is="command.icon"
                    class="w-4 h-4 text-muted-foreground"
                  />
                  <span class="flex-1">{{ command.name }}</span>
                  <span
                    v-if="command.shortcut"
                    class="text-xs text-muted-foreground"
                  >
                    {{ command.shortcut }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部提示 -->
          <div
            class="flex items-center gap-4 px-4 py-2 border-t text-xs text-muted-foreground"
          >
            <span class="flex items-center gap-1">
              <kbd class="px-1 py-0.5 rounded border bg-muted">↑↓</kbd>
              选择
            </span>
            <span class="flex items-center gap-1">
              <kbd class="px-1 py-0.5 rounded border bg-muted">↵</kbd>
              执行
            </span>
            <span class="flex items-center gap-1">
              <kbd class="px-1 py-0.5 rounded border bg-muted">ESC</kbd>
              关闭
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { h } from 'vue'

  // 命令面板状态
  const commandMenu = useCommandMenu()
  const isOpen = computed(() => commandMenu.isOpen.value)

  // 状态
  const query = ref('')
  const selectedGroup = ref(0)
  const selectedCommand = ref(0)
  const inputRef = ref<HTMLInputElement | null>(null)

  // 路由
  const router = useRouter()

  // 命令定义
  interface Command {
    id: string
    name: string
    icon: { render: () => ReturnType<typeof h> }
    action: () => void
    shortcut?: string
    group: string
  }

  // 图标组件
  const NavigateIcon = {
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M13 7l5 5m0 0l-5 5m5-5H6',
          }),
        ]
      )
    },
  }

  const ThemeIcon = {
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
          }),
        ]
      )
    },
  }

  const SettingsIcon = {
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
          }),
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
          }),
        ]
      )
    },
  }

  const LogoutIcon = {
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
          }),
        ]
      )
    },
  }

  // UI 设置
  const uiSettings = useUiSettingsStore()
  const auth = useAuthStore()

  // 所有命令
  const commands: Command[] = [
    // 导航
    {
      id: 'nav-dashboard',
      name: '仪表板',
      icon: NavigateIcon,
      action: () => router.push('/'),
      group: '导航',
    },
    {
      id: 'nav-users',
      name: '用户管理',
      icon: NavigateIcon,
      action: () => router.push('/users'),
      group: '导航',
    },
    {
      id: 'nav-messages',
      name: '消息中心',
      icon: NavigateIcon,
      action: () => router.push('/messages'),
      group: '导航',
    },
    {
      id: 'nav-files',
      name: '文件管理',
      icon: NavigateIcon,
      action: () => router.push('/files'),
      group: '导航',
    },
    {
      id: 'nav-calendar',
      name: '日程安排',
      icon: NavigateIcon,
      action: () => router.push('/calendar'),
      group: '导航',
    },
    {
      id: 'nav-settings',
      name: '系统设置',
      icon: NavigateIcon,
      action: () => router.push('/settings'),
      group: '导航',
    },
    // 主题
    {
      id: 'theme-toggle',
      name: '切换主题',
      icon: ThemeIcon,
      action: () => uiSettings.toggleTheme(),
      shortcut: '⌘T',
      group: '设置',
    },
    {
      id: 'theme-light',
      name: '浅色模式',
      icon: ThemeIcon,
      action: () => uiSettings.setTheme('light'),
      group: '设置',
    },
    {
      id: 'theme-dark',
      name: '深色模式',
      icon: ThemeIcon,
      action: () => uiSettings.setTheme('dark'),
      group: '设置',
    },
    {
      id: 'theme-system',
      name: '跟随系统',
      icon: ThemeIcon,
      action: () => uiSettings.setTheme('system'),
      group: '设置',
    },
    // 账户
    {
      id: 'profile',
      name: '个人资料',
      icon: SettingsIcon,
      action: () => router.push('/profile'),
      group: '账户',
    },
    {
      id: 'logout',
      name: '退出登录',
      icon: LogoutIcon,
      action: () => {
        auth.logout()
        router.push('/login')
      },
      group: '账户',
    },
  ]

  // 过滤后的命令
  const filteredCommands = computed(() => {
    if (!query.value) return commands
    const q = query.value.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(q) ||
        cmd.group.toLowerCase().includes(q)
    )
  })

  // 分组后的命令
  const groupedCommands = computed(() => {
    const groups: { name: string; commands: Command[] }[] = []
    for (const cmd of filteredCommands.value) {
      let group = groups.find((g) => g.name === cmd.group)
      if (!group) {
        group = { name: cmd.group, commands: [] }
        groups.push(group)
      }
      group.commands.push(cmd)
    }
    return groups
  })

  // 选中状态
  function isSelected(groupIndex: number, commandIndex: number) {
    return (
      selectedGroup.value === groupIndex &&
      selectedCommand.value === commandIndex
    )
  }

  function setSelected(groupIndex: number, commandIndex: number) {
    selectedGroup.value = groupIndex
    selectedCommand.value = commandIndex
  }

  function selectNext() {
    const group = groupedCommands.value[selectedGroup.value]
    if (selectedCommand.value < group.commands.length - 1) {
      selectedCommand.value++
    } else if (selectedGroup.value < groupedCommands.value.length - 1) {
      selectedGroup.value++
      selectedCommand.value = 0
    }
  }

  function selectPrev() {
    if (selectedCommand.value > 0) {
      selectedCommand.value--
    } else if (selectedGroup.value > 0) {
      selectedGroup.value--
      selectedCommand.value =
        groupedCommands.value[selectedGroup.value].commands.length - 1
    }
  }

  function executeSelected() {
    const group = groupedCommands.value[selectedGroup.value]
    if (group && group.commands[selectedCommand.value]) {
      executeCommand(group.commands[selectedCommand.value])
    }
  }

  function executeCommand(command: Command) {
    close()
    command.action()
  }

  // 打开/关闭
  function open() {
    commandMenu.open()
    query.value = ''
    selectedGroup.value = 0
    selectedCommand.value = 0
    nextTick(() => {
      inputRef.value?.focus()
    })
  }

  function close() {
    commandMenu.close()
  }

  function toggle() {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  // 监听打开状态，聚焦输入框
  watch(isOpen, (val) => {
    if (val) {
      query.value = ''
      selectedGroup.value = 0
      selectedCommand.value = 0
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  })

  // 键盘快捷键
  onMounted(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown)
    })
  })

  // 暴露方法
  defineExpose({ open, close, toggle })
</script>
