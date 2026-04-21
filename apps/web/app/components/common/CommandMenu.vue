<template>
  <UModal
    v-model:open="modalOpen"
    title="命令面板"
    description="搜索并执行常用命令"
    :ui="{
      content: 'sm:mt-24',
      body: 'p-0',
      header: 'px-4 py-3',
      footer: 'px-4 py-2',
    }"
  >
    <template #body>
      <div class="border-b border-default px-4 py-3">
        <div class="flex items-center gap-3">
          <UInput
            v-model="query"
            type="text"
            autofocus
            icon="i-lucide-search"
            placeholder="搜索命令..."
            class="flex-1"
            @keydown.down.prevent="selectNext"
            @keydown.up.prevent="selectPrev"
            @keydown.enter.prevent="executeSelected"
            @keydown.escape="close"
          />
          <kbd
            class="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-default bg-accented px-1.5 font-mono text-xs font-medium text-muted"
          >
            ESC
          </kbd>
        </div>
      </div>

      <div class="max-h-80 overflow-y-auto py-2">
        <div
          v-if="filteredCommands.length === 0"
          class="px-4 py-8 text-center text-muted"
        >
          没有找到匹配的命令
        </div>
        <div v-else>
          <div
            v-for="(group, groupIndex) in groupedCommands"
            :key="group.name"
            class="mb-2"
          >
            <div class="px-4 py-1 text-xs font-medium text-muted uppercase">
              {{ group.name }}
            </div>
            <UButton
              v-for="(command, commandIndex) in group.commands"
              :key="command.id"
              color="neutral"
              :variant="isSelected(groupIndex, commandIndex) ? 'soft' : 'ghost'"
              class="w-full justify-start rounded-none px-4 py-2"
              @click="executeCommand(command)"
              @mouseenter="setSelected(groupIndex, commandIndex)"
            >
              <UIcon
                :name="command.icon"
                class="size-4 text-muted"
              />
              <span class="flex-1 text-left">{{ command.name }}</span>
              <span
                v-if="command.shortcut"
                class="text-xs text-muted"
              >
                {{ command.shortcut }}
              </span>
            </UButton>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center gap-4 text-xs text-muted">
        <span class="flex items-center gap-1">
          <kbd class="px-1 py-0.5 rounded border border-default bg-accented">
            ↑↓
          </kbd>
          选择
        </span>
        <span class="flex items-center gap-1">
          <kbd class="px-1 py-0.5 rounded border border-default bg-accented">
            ↵
          </kbd>
          执行
        </span>
        <span class="flex items-center gap-1">
          <kbd class="px-1 py-0.5 rounded border border-default bg-accented">
            ESC
          </kbd>
          关闭
        </span>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { getSidebarRoutes } from '~/utils/route-config'

  // 命令面板状态
  const commandMenu = useCommandMenu()
  const isOpen = computed(() => commandMenu.isOpen.value)
  const modalOpen = computed({
    get: () => isOpen.value,
    set: (value: boolean) => {
      if (value) {
        commandMenu.open()
      } else {
        commandMenu.close()
      }
    },
  })

  // 状态
  const query = ref('')
  const selectedGroup = ref(0)
  const selectedCommand = ref(0)

  // 路由
  const router = useRouter()
  const { signOut } = useAuthActions()

  // 命令定义
  interface Command {
    id: string
    name: string
    icon: string
    action: () => void
    shortcut?: string
    group: string
  }

  // UI 设置
  const uiSettings = useUiSettingsStore()

  // 所有命令
  const navigationCommands = getSidebarRoutes().map<Command>((route) => ({
    id: `nav-${route.key}`,
    name: route.title,
    icon: route.icon || 'i-lucide-arrow-right',
    action: () => router.push(route.path),
    group: '导航',
  }))

  const commands: Command[] = [
    ...navigationCommands,
    // 主题
    {
      id: 'theme-toggle',
      name: '切换主题',
      icon: 'i-lucide-moon-star',
      action: () => uiSettings.toggleTheme(),
      shortcut: '⌘T',
      group: '设置',
    },
    {
      id: 'theme-light',
      name: '浅色模式',
      icon: 'i-lucide-sun',
      action: () => uiSettings.setTheme('light'),
      group: '设置',
    },
    {
      id: 'theme-dark',
      name: '深色模式',
      icon: 'i-lucide-moon-star',
      action: () => uiSettings.setTheme('dark'),
      group: '设置',
    },
    {
      id: 'theme-system',
      name: '跟随系统',
      icon: 'i-lucide-monitor',
      action: () => uiSettings.setTheme('system'),
      group: '设置',
    },
    // 账户
    {
      id: 'logout',
      name: '退出登录',
      icon: 'i-lucide-log-out',
      action: () => signOut({ redirectTo: '/login' }),
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
    if (!group) return
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
      const group = groupedCommands.value[selectedGroup.value]
      if (group) {
        selectedCommand.value = group.commands.length - 1
      }
    }
  }

  function executeSelected() {
    const group = groupedCommands.value[selectedGroup.value]
    const command = group?.commands[selectedCommand.value]
    if (command) {
      executeCommand(command)
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
