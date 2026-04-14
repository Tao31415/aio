<template>
  <div
    v-if="tabs.tabs.length > 1"
    class="h-10 border-b bg-card flex items-center gap-1 shrink-0 relative"
  >
    <!-- 左滚动按钮 -->
    <button
      v-if="canScrollLeft"
      class="h-full px-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
      @click="scroll('left')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <!-- 标签列表 -->
    <div
      ref="tabsContainerRef"
      class="flex-1 flex items-center gap-1 px-2 overflow-x-auto scrollbar-hide"
    >
      <div
        v-for="tab in tabs.tabs"
        :key="tab.id"
        :data-tab-id="tab.id"
        :class="[
          'flex items-center gap-1 px-3 py-1.5 rounded-t text-sm cursor-pointer transition-colors shrink-0 relative group',
          tab.path === route.path
            ? 'bg-background border-t border-x text-foreground -mb-px'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        ]"
        @click="navigateTo(tab.path)"
        @contextmenu.prevent="openContextMenu($event, tab)"
      >
        <!-- 活动指示器 -->
        <div
          v-if="tab.path === route.path"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        />

        <span class="max-w-32 truncate">{{ tab.title }}</span>
        <button
          v-if="tab.closable !== false"
          class="ml-1 p-0.5 rounded hover:bg-muted transition-colors"
          :class="
            tab.path === route.path
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          "
          @click.stop="closeTab(tab.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 右滚动按钮 -->
    <button
      v-if="canScrollRight"
      class="h-full px-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
      @click="scroll('right')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>

    <!-- 标签操作 -->
    <div class="flex items-center gap-1 shrink-0 px-2 border-l">
      <!-- 关闭其他 -->
      <button
        class="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title="关闭其他标签"
        @click="closeOtherTabs"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
      <!-- 刷新当前 -->
      <button
        class="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title="刷新当前页面"
        @click="refreshCurrentTab"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>

    <!-- 右键菜单 -->
    <Transition name="fade">
      <div
        v-if="contextMenu.visible"
        class="absolute z-50 w-44 rounded-lg border bg-popover shadow-lg py-1 text-sm"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        @click.stop
      >
        <button
          class="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
          @click="refreshTab(contextMenu.tab!)"
        >
          刷新页面
        </button>
        <div class="h-px bg-border my-1" />
        <button
          v-if="contextMenu.tab?.closable !== false"
          class="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
          @click="closeTab(contextMenu.tab!.id)"
        >
          关闭标签
        </button>
        <button
          class="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
          @click="closeOtherTabsFrom(contextMenu.tab!)"
        >
          关闭其他
        </button>
        <button
          class="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
          @click="closeRightTabs(contextMenu.tab!)"
        >
          关闭右侧
        </button>
        <div class="h-px bg-border my-1" />
        <button
          class="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
          @click="closeAllTabs"
        >
          关闭所有
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import type { Tab } from '~/stores/tabs'

  const tabs = useTabsStore()
  const route = useRoute()
  const router = useRouter()
  const tabsContainerRef = ref<HTMLDivElement | null>(null)
  const canScrollLeft = ref(false)
  const canScrollRight = ref(false)

  // 右键菜单状态
  const contextMenu = reactive<{
    visible: boolean
    x: number
    y: number
    tab: Tab | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    tab: null,
  })

  // 检查滚动状态
  const checkScroll = () => {
    const container = tabsContainerRef.value
    if (!container) return

    canScrollLeft.value = container.scrollLeft > 0
    canScrollRight.value =
      container.scrollLeft < container.scrollWidth - container.clientWidth
  }

  // 滚动到活动标签
  const scrollToActiveTab = () => {
    const container = tabsContainerRef.value
    if (!container) return

    const activeTab = container.querySelector(
      `[data-tab-id="${tabs.tabs.find((t) => t.path === route.path)?.id}"]`
    )
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }

  // 滚动标签
  const scroll = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.value
    if (!container) return

    const scrollAmount = 200
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  // 打开右键菜单
  const openContextMenu = (event: MouseEvent, tab: Tab) => {
    contextMenu.visible = true
    contextMenu.x = event.clientX
    contextMenu.y = event.clientY
    contextMenu.tab = tab
  }

  // 隐藏右键菜单
  const hideContextMenu = () => {
    contextMenu.visible = false
  }

  // 关闭标签
  function closeTab(id: string) {
    const closedTab = tabs.tabs.find((t) => t.id === id)
    tabs.closeTab(id)
    hideContextMenu()

    // 如果关闭的是当前标签，导航到最后一个标签
    if (closedTab?.path === route.path && tabs.tabs.length > 0) {
      const lastTab = tabs.tabs[tabs.tabs.length - 1]
      router.push(lastTab.path)
    }
  }

  // 关闭其他标签
  function closeOtherTabs() {
    tabs.closeOtherTabs(route.path)
  }

  // 关闭其他标签（从右键菜单）
  function closeOtherTabsFrom(tab: Tab) {
    tabs.closeOtherTabs(tab.path)
    hideContextMenu()
    if (route.path !== tab.path) {
      router.push(tab.path)
    }
  }

  // 关闭右侧标签
  function closeRightTabs(tab: Tab) {
    tabs.closeRightTabs(tab.path)
    hideContextMenu()
  }

  // 关闭所有标签
  function closeAllTabs() {
    tabs.closeAllTabs()
    hideContextMenu()
    router.push('/')
  }

  // 刷新当前标签
  function refreshCurrentTab() {
    // 清除页面缓存
    const cacheStore = usePageCacheStore()
    cacheStore.clearPageState(route.path)
    // 使用 Nuxt 的刷新功能
    refreshNuxtData()
  }

  // 刷新指定标签
  function refreshTab(tab: Tab) {
    hideContextMenu()
    // 清除页面缓存
    const cacheStore = usePageCacheStore()
    cacheStore.clearPageState(tab.path)

    if (route.path === tab.path) {
      refreshNuxtData()
    } else {
      router.push(tab.path).then(() => {
        nextTick(() => refreshNuxtData())
      })
    }
  }

  // 监听路由变化，自动添加标签
  watch(
    () => route.path,
    (newPath) => {
      const existingTab = tabs.tabs.find((t) => t.path === newPath)
      if (!existingTab) {
        tabs.addTab({
          id: generateId(),
          title: (route.meta.title as string) || getRouteTitle(newPath),
          path: newPath,
          closable: newPath !== '/',
        })
      }
      nextTick(scrollToActiveTab)
    },
    { immediate: true }
  )

  // 监听滚动
  onMounted(() => {
    const container = tabsContainerRef.value
    if (container) {
      container.addEventListener('scroll', checkScroll)
      // 监听容器大小变化
      const observer = new ResizeObserver(checkScroll)
      observer.observe(container)

      onUnmounted(() => {
        container.removeEventListener('scroll', checkScroll)
        observer.disconnect()
      })
    }

    // 监听点击事件关闭右键菜单
    window.addEventListener('click', hideContextMenu)
    onUnmounted(() => {
      window.removeEventListener('click', hideContextMenu)
    })

    // 初始检查
    nextTick(checkScroll)
  })

  // 根据路径获取标题
  function getRouteTitle(path: string): string {
    const titles: Record<string, string> = {
      '/': '仪表板',
      '/users': '用户管理',
      '/messages': '消息中心',
      '/files': '文件管理',
      '/calendar': '日程安排',
      '/analytics': '数据分析',
      '/settings': '系统设置',
      '/profile': '个人资料',
      '/notifications': '通知中心',
    }
    return titles[path] || '页面'
  }
</script>

<style scoped>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
