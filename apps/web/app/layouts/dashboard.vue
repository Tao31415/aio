<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'

  const route = useRoute()
  const toast = useToast()
  const uiSettings = useUiSettingsStore()
  const colorMode = useColorMode()
  const auth = useAuthStore()
  const { signOut } = useAuth()
  const open = ref(false)
  function toggleTheme() {
    if (colorMode.value === 'light') {
      colorMode.preference = 'dark'
    } else {
      colorMode.preference = 'light'
    }
  }
  const userInitial = computed(() => {
    const displayName =
      auth.user?.username || auth.user?.name || auth.user?.email
    return displayName?.trim().charAt(0).toUpperCase() || 'U'
  })
  // 菜单项
  interface MenuItem {
    title: string
    path: string
    icon: string
    badge?: string | number
    permission?: string
  }

  const menuItems: MenuItem[] = [
    { title: '仪表板', path: '/dashboard', icon: 'i-lucide-layout-dashboard' },
    { title: '用户管理', path: '/users', icon: 'i-lucide-users' },
    {
      title: '消息中心',
      path: '/messages',
      icon: 'i-lucide-messages-square',
      badge: 5,
    },
    { title: '数据分析', path: '/analytics', icon: 'i-lucide-chart-column' },
    { title: '个人资料', path: '/profile', icon: 'i-lucide-user-round' },
    { title: '系统设置', path: '/settings', icon: 'i-lucide-settings' },
  ]

  const links = [
    menuItems.map((item) => ({
      label: item.title,
      icon: item.icon,
      to: item.path,
      badge: item.badge,
      onSelect: () => {
        open.value = false
      },
    })),
  ] satisfies NavigationMenuItem[][]

  const groups = computed(() => [
    {
      id: 'links',
      label: 'Go to',
      items: links.flat(),
    },
    {
      id: 'code',
      label: 'Code',
      items: [
        {
          id: 'source',
          label: 'View page source',
          icon: 'i-simple-icons-github',
          to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
          target: '_blank',
        },
      ],
    },
  ])

  onMounted(async () => {
    const cookie = useCookie('cookie-consent')
    if (cookie.value === 'accepted') {
      return
    }

    toast.add({
      title:
        'We use first-party cookies to enhance your experience on our website.',
      duration: 0,
      close: false,
      actions: [
        {
          label: 'Accept',
          color: 'neutral',
          variant: 'outline',
          onClick: () => {
            cookie.value = 'accepted'
          },
        },
        {
          label: 'Opt out',
          color: 'neutral',
          variant: 'ghost',
        },
      ],
    })
  })

  import type { DropdownMenuItem } from '@nuxt/ui'
  const { isNotificationsSlideoverOpen } = useDashboard()

  const userMenuItems = computed<DropdownMenuItem[][]>(() => [
    [
      {
        label: auth.user?.name || '用户',
        description: auth.user?.email,
        disabled: true,
      },
    ],
    [
      {
        label: '个人资料',
        icon: 'i-lucide-user-round',
      },
      {
        label: '系统设置',
        icon: 'i-lucide-settings',
      },
    ],
    [
      {
        label: '退出登录',
        icon: 'i-lucide-log-out',
        color: 'error',
        onSelect(e) {
          e.preventDefault()
          signOut({
            redirectTo: '/login',
          })
        },
      },
    ],
  ])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <UDashboardPanel id="home">
      <template #header>
        <UDashboardNavbar :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
            <UDashboardSearchButton class="bg-transparent ring-default" />
          </template>
          <template #right>
            <UTooltip
              text="Notifications"
              :shortcuts="['N']"
            >
              <UButton
                color="neutral"
                variant="ghost"
                square
                @click="isNotificationsSlideoverOpen = true"
              >
                <UChip
                  color="error"
                  inset
                >
                  <UIcon
                    name="i-lucide-bell"
                    class="size-5 shrink-0"
                  />
                </UChip>
              </UButton>
            </UTooltip>
            <!-- 主题切换 -->
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              :icon="uiSettings.isDark ? 'i-lucide-sun' : 'i-lucide-moon-star'"
              @click="toggleTheme"
            />

            <!-- 用户菜单 -->
            <UDropdownMenu :items="userMenuItems">
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                class="gap-2 px-1.5"
              >
                <div
                  class="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                >
                  <span class="text-primary-foreground text-sm font-medium">
                    {{ userInitial }}
                  </span>
                </div>
                <span class="hidden md:inline text-sm font-medium">
                  {{ auth.user?.name }}
                </span>
                <UIcon
                  name="i-lucide-chevron-down"
                  class="hidden md:inline size-4"
                />
              </UButton>
            </UDropdownMenu>
          </template>
        </UDashboardNavbar>
        <!-- 标签栏 -->
        <AppTabs v-if="uiSettings.showTabBar" />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
