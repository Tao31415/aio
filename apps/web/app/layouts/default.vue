<script setup lang="ts">
  // 布局状态
  const layout = useLayoutStore()
  const uiSettings = useUiSettingsStore()

  // 响应式判断移动端
  const isMobile = ref(false)

  // 切换侧边栏
  function handleToggleSidebar() {
    if (isMobile.value) {
      layout.toggleMobileSidebar()
    } else {
      layout.toggleSidebar()
    }
  }

  // 监听窗口大小变化
  function handleResize() {
    isMobile.value = window.innerWidth < 1024
    if (!isMobile.value) {
      layout.closeMobileSidebar()
    }
  }

  // 生命周期
  onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
</script>

<template>
  <div class="h-screen overflow-hidden flex flex-col bg-default">
    <!-- 主要内容区域 -->
    <div class="flex flex-1 min-h-0">
      <!-- 侧边栏 -->
      <AppSidebar
        v-if="!isMobile"
        class="shrink-0"
        :collapsed="layout.sidebarCollapsed"
        @toggle="layout.toggleSidebar"
      />

      <!-- 移动端侧边栏抽屉 -->
      <Transition name="slide">
        <div
          v-if="isMobile && layout.mobileSidebarOpen"
          class="fixed inset-0 z-50"
        >
          <!-- 遮罩层 -->
          <div
            class="absolute inset-0 bg-black/50"
            @click="layout.closeMobileSidebar"
          />
          <!-- 侧边栏内容 -->
          <div class="absolute left-0 top-0 h-full w-64 bg-default shadow-xl">
            <AppSidebar
              :collapsed="false"
              :is-mobile="true"
            />
          </div>
        </div>
      </Transition>

      <!-- 主内容区 -->
      <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
        <!-- 顶部导航 -->
        <AppHeader
          @toggle-sidebar="handleToggleSidebar"
          @toggle-mobile-sidebar="layout.toggleMobileSidebar"
        />

        <!-- 标签栏 -->
        <AppTabs v-if="uiSettings.showTabBar" />

        <!-- 页面内容 -->
        <main class="flex-1 overflow-auto bg-accented/20 p-4 lg:p-6">
          <slot />
        </main>

        <!-- 页脚 -->
        <AppFooter v-if="uiSettings.showFooter" />
      </div>
    </div>

    <!-- 命令面板 -->
    <CommandMenu />
  </div>
</template>
